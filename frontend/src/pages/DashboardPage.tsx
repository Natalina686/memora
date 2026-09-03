import {
  useEffect,
  useState,
} from 'react'

import {
  approveStructuredKnowledge,
  generateQuestions,
  getKnowledgeCollections,
  getLearners,
  structureKnowledge,
  type Knowledge,
  type KnowledgeCollection,
  type Learner,
  type Question,
  type StructureKnowledgeResponse,
} from '../api/api'

import { useAuth } from '../auth/useAuth'

import { QuizSection } from '../components/QuizSection'

export function DashboardPage() {
  const {
    account,
    logout,
  } = useAuth()

  const [learners, setLearners] =
    useState<Learner[]>([])

  const [
    collections,
    setCollections,
  ] = useState<KnowledgeCollection[]>([])

  const [
    selectedCollectionId,
    setSelectedCollectionId,
  ] = useState('')

  const [
    sourceContent,
    setSourceContent,
  ] = useState('')

  const [
    aiResult,
    setAiResult,
  ] =
    useState<StructureKnowledgeResponse | null>(
      null,
    )

  const [
    savedKnowledge,
    setSavedKnowledge,
  ] =
    useState<Knowledge | null>(null)

  const [
    generatedQuestions,
    setGeneratedQuestions,
  ] = useState<Question[]>([])

  const [loading, setLoading] =
    useState(true)

  const [
    aiLoading,
    setAiLoading,
  ] = useState(false)

  const [
    approving,
    setApproving,
  ] = useState(false)

  const [
    generatingQuestions,
    setGeneratingQuestions,
  ] = useState(false)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [
          learnersData,
          collectionsData,
        ] = await Promise.all([
          getLearners(),
          getKnowledgeCollections(),
        ])

        setLearners(learnersData)
        setCollections(collectionsData)

        if (collectionsData.length > 0) {
          setSelectedCollectionId(
            collectionsData[0].id,
          )
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load dashboard',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  async function handleStructureKnowledge() {
    const content = sourceContent.trim()

    if (!content) {
      setError(
        'Введіть інформацію, яку потрібно запам’ятати.',
      )
      return
    }

    setError(null)
    setSavedKnowledge(null)
    setGeneratedQuestions([])
    setAiLoading(true)

    try {
      const result =
        await structureKnowledge(content)

      setAiResult(result)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Не вдалося обробити інформацію за допомогою AI.',
      )
    } finally {
      setAiLoading(false)
    }
  }

  async function handleApprove() {
    if (!aiResult) {
      return
    }

    if (!selectedCollectionId) {
      setError(
        'Оберіть колекцію знань.',
      )
      return
    }

    setError(null)
    setApproving(true)

    try {
      const knowledge =
        await approveStructuredKnowledge(
          aiResult.processingLogId,
          selectedCollectionId,
        )

      setSavedKnowledge(knowledge)
      setAiResult(null)
      setSourceContent('')
      setGeneratedQuestions([])
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Не вдалося зберегти знання.',
      )
    } finally {
      setApproving(false)
    }
  }

  async function handleGenerateQuestions() {
    if (!savedKnowledge) {
      return
    }

    setError(null)
    setGeneratingQuestions(true)

    try {
      const questions =
        await generateQuestions(
          savedKnowledge.id,
        )

      setGeneratedQuestions(questions)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Не вдалося згенерувати запитання.',
      )
    } finally {
      setGeneratingQuestions(false)
    }
  }

  function handleCancelPreview() {
    setAiResult(null)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand compact">
          <div className="brand-mark">
            M
          </div>

          <div>
            <strong>Memora</strong>
            <span>
              Learning Dashboard
            </span>
          </div>
        </div>

        <div className="account-menu">
          <span>{account?.email}</span>

          <button
            type="button"
            className="secondary-button"
            onClick={logout}
          >
            Вийти
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-card">
          <div>
            <span className="eyebrow">
              MEMORA
            </span>

            <h1>
              Персоналізоване навчання
            </h1>

            <p>
              Зберігайте важливі знання,
              перевіряйте себе та
              повторюйте матеріал у
              потрібний момент.
            </p>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>
                Профілі навчання
              </h2>

              <p>
                Learner, доступні вашому
                акаунту.
              </p>
            </div>
          </div>

          {loading && (
            <div className="status-card">
              Завантаження...
            </div>
          )}

          {!loading &&
            learners.length === 0 && (
              <div className="status-card">
                Профілі ще не створені.
              </div>
            )}

          <div className="learner-grid">
            {learners.map((learner) => (
              <article
                className="learner-card"
                key={learner.id}
              >
                <div className="avatar">
                  {learner.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>{learner.name}</h3>

                  <p>
                    Telegram:{' '}
                    {learner.telegramChatId
                      ? 'підключено'
                      : 'не підключено'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section knowledge-creator">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                GENERATIVE AI
              </span>

              <h2>
                Додати нові знання
              </h2>

              <p>
                Напишіть інформацію
                звичайною мовою. Memora
                структурує її перед
                збереженням.
              </p>
            </div>
          </div>

          <div className="knowledge-form">
            <label>
              Колекція

              <select
                value={
                  selectedCollectionId
                }
                onChange={(event) =>
                  setSelectedCollectionId(
                    event.target.value,
                  )
                }
                disabled={
                  collections.length === 0
                }
              >
                {collections.length ===
                  0 && (
                  <option value="">
                    Немає колекцій
                  </option>
                )}

                {collections.map(
                  (collection) => (
                    <option
                      key={collection.id}
                      value={collection.id}
                    >
                      {collection.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Інформація для
              запам&apos;ятовування

              <textarea
                value={sourceContent}
                onChange={(event) =>
                  setSourceContent(
                    event.target.value,
                  )
                }
                placeholder="Наприклад: Мою маму звати Олена. Її день народження 12 травня."
                rows={6}
                disabled={
                  aiLoading ||
                  approving
                }
              />
            </label>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                void handleStructureKnowledge()
              }
              disabled={
                aiLoading ||
                approving ||
                !sourceContent.trim()
              }
            >
              {aiLoading
                ? 'AI обробляє...'
                : 'Структурувати за допомогою AI'}
            </button>
          </div>

          {error && (
            <div className="error-message knowledge-message">
              {error}
            </div>
          )}

          {aiResult && (
            <div className="ai-preview">
              <div className="preview-header">
                <div>
                  <span className="eyebrow">
                    AI PREVIEW
                  </span>

                  <h3>
                    {
                      aiResult
                        .structuredKnowledge
                        .title
                    }
                  </h3>
                </div>
              </div>

              <div className="preview-block">
                <strong>
                  Короткий опис
                </strong>

                <p>
                  {
                    aiResult
                      .structuredKnowledge
                      .summary
                  }
                </p>
              </div>

              <div className="preview-block">
                <strong>
                  Основні факти
                </strong>

                <div className="facts-list">
                  {aiResult
                    .structuredKnowledge
                    .facts.map(
                      (
                        fact,
                        index,
                      ) => (
                        <div
                          className="fact-item"
                          key={`${fact.key}-${index}`}
                        >
                          <span>
                            {fact.key}
                          </span>

                          <strong>
                            {fact.value}
                          </strong>
                        </div>
                      ),
                    )}
                </div>
              </div>

              <div className="preview-block">
                <strong>
                  Ключові слова
                </strong>

                <div className="keyword-list">
                  {aiResult
                    .structuredKnowledge
                    .keywords.map(
                      (keyword) => (
                        <span
                          className="keyword"
                          key={keyword}
                        >
                          {keyword}
                        </span>
                      ),
                    )}
                </div>
              </div>

              <div className="preview-actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    void handleApprove()
                  }
                  disabled={
                    approving ||
                    !selectedCollectionId
                  }
                >
                  {approving
                    ? 'Зберігаємо...'
                    : 'Підтвердити та зберегти'}
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    handleCancelPreview
                  }
                  disabled={approving}
                >
                  Скасувати
                </button>
              </div>
            </div>
          )}

          {savedKnowledge && (
            <div className="success-card">
              <strong>
                Знання збережено
              </strong>

              <p>
                {savedKnowledge.title}
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  void handleGenerateQuestions()
                }
                disabled={
                  generatingQuestions
                }
              >
                {generatingQuestions
                  ? 'AI генерує запитання...'
                  : 'Згенерувати запитання'}
              </button>
            </div>
          )}

          {generatedQuestions.length > 0 && (
            <div className="questions-section">
              <div>
                <span className="eyebrow">
                  GENERATED QUESTIONS
                </span>

                <h3>
                  Запитання для перевірки
                </h3>

                <p>
                  AI створив{' '}
                  {
                    generatedQuestions.length
                  }{' '}
                  запитання.
                </p>
              </div>

              <div className="question-list">
                {generatedQuestions.map(
                  (question, index) => (
                    <article
                      className="question-card"
                      key={question.id}
                    >
                      <div className="question-number">
                        {index + 1}
                      </div>

                      <div className="question-content">
                        <span className="question-type">
                          {question.type}
                        </span>

                        <h4>
                          {question.prompt}
                        </h4>

                        {question.options &&
                          question.options
                            .length > 0 && (
                            <ul className="question-options">
                              {question.options.map(
                                (
                                  option,
                                  optionIndex,
                                ) => (
                                  <li
                                    key={`${question.id}-${optionIndex}`}
                                  >
                                    {option}
                                  </li>
                                ),
                              )}
                            </ul>
                          )}
                      </div>
                    </article>
                  ),
                )}
              </div>
            </div>
          )}
        </section>
        <QuizSection learners={learners} />
      </main>
    </div>
  )
}