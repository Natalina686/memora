import { useEffect, useState } from "react";

import {
  approveGeneratedQuestions,
  approveStructuredKnowledge,
  generateQuestions,
  getKnowledgeCollections,
  getLearners,
  structureKnowledge,
  type GeneratedQuestionPreview,
  type Knowledge,
  type KnowledgeCollection,
  type Learner,
  type StructureKnowledgeResponse,
} from "../api/api";

import { useAuth } from "../auth/useAuth";

import { QuizSection } from "../components/QuizSection";
import { ProgressSection } from "../components/ProgressSection";
import { CollectionsSection } from "../components/CollectionsSection";

export function DashboardPage() {
  const { account, logout } = useAuth();

  const [learners, setLearners] = useState<Learner[]>([]);
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);

  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [sourceContent, setSourceContent] = useState("");

  const [aiResult, setAiResult] = useState<StructureKnowledgeResponse | null>(
    null,
  );

  const [savedKnowledge, setSavedKnowledge] = useState<Knowledge | null>(null);

  const [generatedQuestions, setGeneratedQuestions] = useState<
    GeneratedQuestionPreview[]
  >([]);

  const [questionsProcessingLogId, setQuestionsProcessingLogId] = useState<
    string | null
  >(null);

  const [questionsApproved, setQuestionsApproved] = useState(false);

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [approving, setApproving] = useState(false);

  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  const [approvingQuestions, setApprovingQuestions] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [progressRefreshKey, setProgressRefreshKey] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [learnersData, collectionsData] = await Promise.all([
          getLearners(),
          getKnowledgeCollections(),
        ]);

        setLearners(learnersData);
        setCollections(collectionsData);

        if (collectionsData.length > 0) {
          setSelectedCollectionId(collectionsData[0].id);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  async function handleStructureKnowledge() {
    const content = sourceContent.trim();

    if (!content) {
      setError("Введіть інформацію, яку потрібно запам’ятати.");
      return;
    }

    setError(null);
    setSavedKnowledge(null);
    setGeneratedQuestions([]);
    setQuestionsProcessingLogId(null);
    setQuestionsApproved(false);
    setAiLoading(true);

    try {
      const result = await structureKnowledge(content);

      setAiResult(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося обробити інформацію за допомогою AI.",
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function handleApprove() {
  if (!aiResult) {
    return;
  }

  if (!selectedCollectionId) {
    setError("Оберіть колекцію знань.");
    return;
  }

  setError(null);
  setApproving(true);

  try {
    const knowledge = await approveStructuredKnowledge(
      aiResult.processingLogId,
      selectedCollectionId,
    );

    setSavedKnowledge(knowledge);
    setAiResult(null);
    setSourceContent("");

    setGeneratedQuestions([]);
    setQuestionsProcessingLogId(null);
    setQuestionsApproved(false);

    // Одразу після збереження Knowledge запускаємо AI-генерацію питань
    setGeneratingQuestions(true);

    try {
      const result = await generateQuestions(knowledge.id);

      setGeneratedQuestions(result.questions);
      setQuestionsProcessingLogId(result.processingLogId);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Знання збережено, але не вдалося згенерувати запитання.",
      );
    } finally {
      setGeneratingQuestions(false);
    }
  } catch (error) {
    setError(
      error instanceof Error ? error.message : "Не вдалося зберегти знання.",
    );
  } finally {
    setApproving(false);
  }
}

  async function handleGenerateQuestions() {
    if (!savedKnowledge) {
      return;
    }

    setError(null);
    setGeneratingQuestions(true);

    setGeneratedQuestions([]);
    setQuestionsProcessingLogId(null);
    setQuestionsApproved(false);

    try {
      const result = await generateQuestions(savedKnowledge.id);

      setGeneratedQuestions(result.questions);

      setQuestionsProcessingLogId(result.processingLogId);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося згенерувати запитання.",
      );
    } finally {
      setGeneratingQuestions(false);
    }
  }

  async function handleApproveQuestions() {
    if (!questionsProcessingLogId) {
      return;
    }

    setError(null);
    setApprovingQuestions(true);

    try {
      const result = await approveGeneratedQuestions(questionsProcessingLogId);

      setGeneratedQuestions(
        result.questions.map((question) => ({
          type: question.type,
          prompt: question.prompt,
          options: question.options,
          correctAnswer: question.correctAnswer,
        })),
      );

      setQuestionsApproved(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Не вдалося зберегти запитання.",
      );
    } finally {
      setApprovingQuestions(false);
    }
  }

  function handleCancelQuestions() {
    setGeneratedQuestions([]);
    setQuestionsProcessingLogId(null);
    setQuestionsApproved(false);
  }

  function handleCancelPreview() {
    setAiResult(null);
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand compact">
          <div className="brand-mark">M</div>

          <div>
            <strong>Memora</strong>
            <span>Learning Dashboard</span>
          </div>
        </div>

        <div className="account-menu">
          <span>{account?.email}</span>

          <button type="button" className="secondary-button" onClick={logout}>
            Вийти
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-card">
          <div>
            <span className="eyebrow">MEMORA</span>

            <h1>Персоналізоване навчання</h1>

            <p>
              Зберігайте важливі знання, перевіряйте себе та повторюйте матеріал
              у потрібний момент.
            </p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>Профілі навчання</h2>

              <p>Learner, доступні вашому акаунту.</p>
            </div>
          </div>

          {loading && <div className="status-card">Завантаження...</div>}

          {!loading && learners.length === 0 && (
            <div className="status-card">Профілі ще не створені.</div>
          )}

          <div className="learner-grid">
            {learners.map((learner) => (
              <article className="learner-card" key={learner.id}>
                <div className="avatar">
                  {learner.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3>{learner.name}</h3>

                  <p>
                    Telegram:{" "}
                    {learner.telegramChatId ? "підключено" : "не підключено"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <CollectionsSection
          learners={learners}
          collections={collections}
          selectedCollectionId={selectedCollectionId}
          onSelectCollection={setSelectedCollectionId}
          onCollectionsChange={setCollections}
        />

        <section className="dashboard-section knowledge-creator">
          <div className="section-heading">
            <div>
              <span className="eyebrow">GENERATIVE AI</span>

              <h2>Додати нові знання</h2>

              <p>
                Напишіть інформацію звичайною мовою. Memora структурує її перед
                збереженням.
              </p>
            </div>
          </div>

          <div className="knowledge-form">
            <label>
              Оберіть колекцію для нового знання
              <select
                value={selectedCollectionId}
                onChange={(event) =>
                  setSelectedCollectionId(event.target.value)
                }
                disabled={collections.length === 0}
              >
                {collections.length === 0 && (
                  <option value="">Немає колекцій</option>
                )}

                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Інформація для запам&apos;ятовування
              <textarea
                value={sourceContent}
                onChange={(event) => setSourceContent(event.target.value)}
                placeholder="Наприклад: Мою маму звати Олена. Її день народження 12 травня."
                rows={6}
                disabled={aiLoading || approving}
              />
            </label>

            <button
              type="button"
              className="primary-button"
              onClick={() => void handleStructureKnowledge()}
              disabled={aiLoading || approving || !sourceContent.trim()}
            >
              {aiLoading ? "AI обробляє..." : "Структурувати за допомогою AI"}
            </button>
          </div>

          {error && (
            <div className="error-message knowledge-message">{error}</div>
          )}

          {aiResult && (
            <div className="ai-preview">
              <div className="preview-header">
                <div>
                  <span className="eyebrow">AI PREVIEW</span>

                  <h3>{aiResult.structuredKnowledge.title}</h3>
                </div>
              </div>

              <div className="preview-block">
                <strong>Короткий опис</strong>

                <p>{aiResult.structuredKnowledge.summary}</p>
              </div>

              <div className="preview-block">
                <strong>Основні факти</strong>

                <div className="facts-list">
                  {aiResult.structuredKnowledge.facts.map((fact, index) => (
                    <div className="fact-item" key={`${fact.key}-${index}`}>
                      <span>{fact.key}</span>

                      <strong>{fact.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="preview-block">
                <strong>Ключові слова</strong>

                <div className="keyword-list">
                  {aiResult.structuredKnowledge.keywords.map((keyword) => (
                    <span className="keyword" key={keyword}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="preview-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => void handleApprove()}
                  disabled={approving || !selectedCollectionId}
                >
                  {approving ? "Зберігаємо..." : "Підтвердити та зберегти"}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleCancelPreview}
                  disabled={approving}
                >
                  Скасувати
                </button>
              </div>
            </div>
          )}

          {savedKnowledge && (
            <div className="success-card">
              <strong>Знання збережено</strong>

              <p>{savedKnowledge.title}</p>

              <button
                type="button"
                className="primary-button"
                onClick={() => void handleGenerateQuestions()}
                disabled={generatingQuestions}
              >
                {generatingQuestions
                  ? "AI генерує запитання..."
                  : "Згенерувати запитання"}
              </button>
            </div>
          )}

          {generatedQuestions.length > 0 && (
            <div className="questions-section">
              <div className="question-preview-header">
                <div>
                  <span className="eyebrow">
                    {questionsApproved
                      ? "APPROVED QUESTIONS"
                      : "AI QUESTION PREVIEW"}
                  </span>

                  <h3>
                    {questionsApproved
                      ? "Навчальні питання збережено"
                      : "Перевірте запитання"}
                  </h3>

                  <p>
                    {questionsApproved
                      ? `${generatedQuestions.length} питання збережено у системі.`
                      : "Перевірте формулювання та правильні відповіді. Питання ще не збережені."}
                  </p>
                </div>
              </div>

              <div className="question-list">
                {generatedQuestions.map((question, index) => (
                  <article
                    className="question-card"
                    key={`${question.prompt}-${index}`}
                  >
                    <div className="question-number">{index + 1}</div>

                    <div className="question-content">
                      <span className="question-type">{question.type}</span>

                      <h4>{question.prompt}</h4>

                      {question.options && question.options.length > 0 && (
                        <ul className="question-options">
                          {question.options.map((option, optionIndex) => (
                            <li key={`${option}-${optionIndex}`}>{option}</li>
                          ))}
                        </ul>
                      )}

                      <div className="correct-answer-preview">
                        <span>Правильна відповідь</span>

                        <strong>
                          {Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.join(", ")
                            : typeof question.correctAnswer === "boolean"
                              ? question.correctAnswer
                                ? "Правда"
                                : "Неправда"
                              : question.correctAnswer}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {!questionsApproved && (
                <div className="preview-actions question-approval-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => void handleApproveQuestions()}
                    disabled={approvingQuestions || !questionsProcessingLogId}
                  >
                    {approvingQuestions
                      ? "Зберігаємо..."
                      : "Підтвердити та зберегти"}
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCancelQuestions}
                    disabled={approvingQuestions}
                  >
                    Скасувати
                  </button>
                </div>
              )}

              {questionsApproved && (
                <div className="success-card">
                  <strong>Питання підтверджено</strong>

                  <p>4 навчальні питання збережено у базі даних.</p>
                </div>
              )}
            </div>
          )}
        </section>

        <QuizSection
          learners={learners}
          onQuizCompleted={() =>
            setProgressRefreshKey((current) => current + 1)
          }
        />

        <ProgressSection refreshKey={progressRefreshKey} />
      </main>
    </div>
  );
}
