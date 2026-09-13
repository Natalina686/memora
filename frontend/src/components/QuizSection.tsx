import {
  useMemo,
  useState,
} from 'react'

import {
  completeQuizSession,
  createQuizSession,
  getQuizQuestions,
  submitAnswer,
  type Answer,
  type Learner,
  type Question,
  type QuizAnswerValue,
  type QuizSession,
} from '../api/api'

interface QuizSectionProps {
  learners: Learner[]
  onQuizCompleted?: () => void
}

export function QuizSection({
  learners,
  onQuizCompleted,
}: QuizSectionProps) {
  const [
    selectedLearnerId,
    setSelectedLearnerId,
  ] = useState('')

  const [
    session,
    setSession,
  ] = useState<QuizSession | null>(null)

  const [
    questions,
    setQuestions,
  ] = useState<Question[]>([])

  const [
    currentQuestionIndex,
    setCurrentQuestionIndex,
  ] = useState(0)

  const [
    textAnswer,
    setTextAnswer,
  ] = useState('')

  const [
    singleAnswer,
    setSingleAnswer,
  ] = useState('')

  const [
    multipleAnswers,
    setMultipleAnswers,
  ] = useState<string[]>([])

  const [
    trueFalseAnswer,
    setTrueFalseAnswer,
  ] = useState<boolean | null>(null)

  const [
    answers,
    setAnswers,
  ] = useState<Answer[]>([])

  const [
    lastResult,
    setLastResult,
  ] = useState<boolean | null>(null)

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    submitting,
    setSubmitting,
  ] = useState(false)

  const [
    completed,
    setCompleted,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(null)

  const learnerId =
    selectedLearnerId ||
    learners[0]?.id ||
    ''

  const currentQuestion =
    questions[currentQuestionIndex]

  const correctCount = useMemo(
    () =>
      answers.filter(
        (answer) => answer.isCorrect,
      ).length,
    [answers],
  )

  function resetQuestionAnswer() {
    setTextAnswer('')
    setSingleAnswer('')
    setMultipleAnswers([])
    setTrueFalseAnswer(null)
    setLastResult(null)
  }

  async function handleStartQuiz() {
    if (!learnerId) {
      setError(
        'Спочатку створіть профіль Learner.',
      )
      return
    }

    setLoading(true)
    setError(null)
    setCompleted(false)
    setAnswers([])
    setQuestions([])
    setCurrentQuestionIndex(0)
    resetQuestionAnswer()

    try {
      const createdSession =
        await createQuizSession(learnerId)

      const quizQuestions =
        await getQuizQuestions(
          createdSession.id,
        )

      if (quizQuestions.length === 0) {
        setError(
          'Наразі немає знань, доступних для повторення.',
        )
        return
      }

      setSession(createdSession)
      setQuestions(quizQuestions)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Не вдалося почати тест.',
      )
    } finally {
      setLoading(false)
    }
  }

  function getCurrentAnswer():
    | QuizAnswerValue
    | null {
    if (!currentQuestion) {
      return null
    }

    switch (currentQuestion.type) {
      case 'OPEN_TEXT':
        return textAnswer.trim()
          ? textAnswer.trim()
          : null

      case 'SINGLE_CHOICE':
        return singleAnswer || null

      case 'MULTIPLE_CHOICE':
        return multipleAnswers.length > 0
          ? multipleAnswers
          : null

      case 'TRUE_FALSE':
        return trueFalseAnswer

      default:
        return null
    }
  }

  function toggleMultipleAnswer(
    option: string,
  ) {
    if (!currentQuestion?.options) {
      return
    }

    const selected = new Set(
      multipleAnswers,
    )

    if (selected.has(option)) {
      selected.delete(option)
    } else {
      selected.add(option)
    }

    const orderedAnswers =
      currentQuestion.options.filter(
        (item) => selected.has(item),
      )

    setMultipleAnswers(orderedAnswers)
  }

  async function handleSubmitAnswer() {
    if (
      !session ||
      !currentQuestion
    ) {
      return
    }

    const answer = getCurrentAnswer()

    if (answer === null) {
      setError(
        'Оберіть або введіть відповідь.',
      )
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const result =
        await submitAnswer(
          session.id,
          currentQuestion.id,
          answer,
        )

      setAnswers((current) => [
        ...current,
        result,
      ])

      setLastResult(result.isCorrect)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Не вдалося зберегти відповідь.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleNextQuestion() {
    if (!session) {
      return
    }

    const isLastQuestion =
      currentQuestionIndex ===
      questions.length - 1

    if (isLastQuestion) {
      setLoading(true)
      setError(null)

      try {
        await completeQuizSession(
          session.id,
        )

        setCompleted(true)
        onQuizCompleted?.()
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Не вдалося завершити тест.',
        )
      } finally {
        setLoading(false)
      }

      return
    }

    setCurrentQuestionIndex(
      (current) => current + 1,
    )

    resetQuestionAnswer()
  }

  function handleNewQuiz() {
    setSession(null)
    setQuestions([])
    setAnswers([])
    setCurrentQuestionIndex(0)
    setCompleted(false)
    setError(null)
    resetQuestionAnswer()
  }

  if (completed) {
    const total = questions.length

    const accuracy =
      total > 0
        ? Math.round(
            (correctCount / total) * 100,
          )
        : 0

    return (
      <section className="dashboard-section quiz-section">
        <div className="quiz-result">
          <span className="eyebrow">
            QUIZ COMPLETED
          </span>

          <h2>Тест завершено</h2>

          <div className="quiz-score">
            <strong>
              {correctCount} / {total}
            </strong>

            <span>
              Правильних відповідей
            </span>
          </div>

          <p>
            Точність: {accuracy}%
          </p>

          <p className="quiz-result-note">
            LearningProgress та
            ReviewSchedule оновлено після
            завершення тесту на основі
            результату для кожного Knowledge.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={handleNewQuiz}
          >
            Перевірити доступні знання
          </button>
        </div>
      </section>
    )
  }

  if (!session || questions.length === 0) {
    return (
      <section className="dashboard-section quiz-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              SPACED REPETITION
            </span>

            <h2>
              Перевірити знання
            </h2>

            <p>
              Пройдіть тест. Після завершення
              Memora оновить прогрес та дату
              наступного повторення.
            </p>
          </div>
        </div>

        {learners.length > 1 && (
          <label className="quiz-learner-select">
            Профіль навчання

            <select
              value={learnerId}
              onChange={(event) =>
                setSelectedLearnerId(
                  event.target.value,
                )
              }
            >
              {learners.map((learner) => (
                <option
                  key={learner.id}
                  value={learner.id}
                >
                  {learner.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          type="button"
          className="primary-button quiz-start-button"
          onClick={() =>
            void handleStartQuiz()
          }
          disabled={
            loading ||
            learners.length === 0
          }
        >
          {loading
            ? 'Завантаження...'
            : 'Почати тест'}
        </button>
      </section>
    )
  }

  return (
    <section className="dashboard-section quiz-section">
      <div className="quiz-progress-header">
        <div>
          <span className="eyebrow">
            QUIZ SESSION
          </span>

          <h2>
            Перевірка знань
          </h2>
        </div>

        <strong>
          {currentQuestionIndex + 1} /{' '}
          {questions.length}
        </strong>
      </div>

      <div className="quiz-progress-track">
        <div
          className="quiz-progress-value"
          style={{
            width: `${
              ((currentQuestionIndex + 1) /
                questions.length) *
              100
            }%`,
          }}
        />
      </div>

      {currentQuestion && (
        <article className="active-question">
          <span className="question-type">
            {currentQuestion.type}
          </span>

          <h3>
            {currentQuestion.prompt}
          </h3>

          {currentQuestion.type ===
            'OPEN_TEXT' && (
            <textarea
              className="quiz-text-answer"
              value={textAnswer}
              onChange={(event) =>
                setTextAnswer(
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Введіть відповідь"
              disabled={
                lastResult !== null
              }
            />
          )}

          {currentQuestion.type ===
            'SINGLE_CHOICE' && (
            <div className="quiz-options">
              {currentQuestion.options?.map(
                (option) => (
                  <label
                    className="quiz-option"
                    key={option}
                  >
                    <input
                      type="radio"
                      name={
                        currentQuestion.id
                      }
                      value={option}
                      checked={
                        singleAnswer ===
                        option
                      }
                      onChange={() =>
                        setSingleAnswer(
                          option,
                        )
                      }
                      disabled={
                        lastResult !==
                        null
                      }
                    />

                    <span>
                      {option}
                    </span>
                  </label>
                ),
              )}
            </div>
          )}

          {currentQuestion.type ===
            'MULTIPLE_CHOICE' && (
            <div className="quiz-options">
              {currentQuestion.options?.map(
                (option) => (
                  <label
                    className="quiz-option"
                    key={option}
                  >
                    <input
                      type="checkbox"
                      checked={multipleAnswers.includes(
                        option,
                      )}
                      onChange={() =>
                        toggleMultipleAnswer(
                          option,
                        )
                      }
                      disabled={
                        lastResult !==
                        null
                      }
                    />

                    <span>
                      {option}
                    </span>
                  </label>
                ),
              )}
            </div>
          )}

          {currentQuestion.type ===
            'TRUE_FALSE' && (
            <div className="true-false-options">
              <button
                type="button"
                className={
                  trueFalseAnswer === true
                    ? 'choice-button selected'
                    : 'choice-button'
                }
                onClick={() =>
                  setTrueFalseAnswer(true)
                }
                disabled={
                  lastResult !== null
                }
              >
                Правда
              </button>

              <button
                type="button"
                className={
                  trueFalseAnswer === false
                    ? 'choice-button selected'
                    : 'choice-button'
                }
                onClick={() =>
                  setTrueFalseAnswer(false)
                }
                disabled={
                  lastResult !== null
                }
              >
                Неправда
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {lastResult !== null && (
            <div
              className={
                lastResult
                  ? 'answer-result correct'
                  : 'answer-result incorrect'
              }
            >
              {lastResult
                ? 'Правильна відповідь'
                : 'Неправильна відповідь'}
            </div>
          )}

          <div className="quiz-actions">
            {lastResult === null ? (
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  void handleSubmitAnswer()
                }
                disabled={submitting}
              >
                {submitting
                  ? 'Перевіряємо...'
                  : 'Відповісти'}
              </button>
            ) : (
              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  void handleNextQuestion()
                }
                disabled={loading}
              >
                {currentQuestionIndex ===
                questions.length - 1
                  ? 'Завершити тест'
                  : 'Наступне запитання'}
              </button>
            )}
          </div>
        </article>
      )}
    </section>
  )
}