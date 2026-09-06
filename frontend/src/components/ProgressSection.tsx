import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getLearningProgress,
  getReviewSchedule,
  type LearningProgress,
  type ReviewSchedule,
} from '../api/api'

interface ProgressSectionProps {
  refreshKey?: number
}

export function ProgressSection({
  refreshKey = 0,
}: ProgressSectionProps) {
  const [
    progress,
    setProgress,
  ] = useState<LearningProgress[]>([])

  const [
    schedules,
    setSchedules,
  ] = useState<ReviewSchedule[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState<string | null>(null)

  async function loadProgress() {
    setLoading(true)
    setError(null)

    try {
      const [
        progressData,
        scheduleData,
      ] = await Promise.all([
        getLearningProgress(),
        getReviewSchedule(),
      ])

      setProgress(progressData)
      setSchedules(scheduleData)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Не вдалося завантажити прогрес.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getLearningProgress(),
      getReviewSchedule(),
    ])
      .then(
        ([
          progressData,
          scheduleData,
        ]) => {
          if (cancelled) {
            return
          }

          setProgress(progressData)
          setSchedules(scheduleData)
          setError(null)
        },
      )
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }

        setError(
          error instanceof Error
            ? error.message
            : 'Не вдалося завантажити прогрес.',
        )
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const averageAccuracy = useMemo(() => {
    if (progress.length === 0) {
      return 0
    }

    const total = progress.reduce(
      (sum, item) =>
        sum + item.accuracy,
      0,
    )

    return Math.round(
      (total / progress.length) * 100,
    )
  }, [progress])

  const dueCount = useMemo(() => {
    const now = new Date()

    return schedules.filter(
      (schedule) =>
        schedule.status ===
          'SCHEDULED' &&
        new Date(
          schedule.nextReviewAt,
        ) <= now,
    ).length
  }, [schedules])

  function getSchedule(
    knowledgeId: string,
  ) {
    return schedules.find(
      (schedule) =>
        schedule.knowledgeId ===
        knowledgeId,
    )
  }

  function formatDate(
    value: string,
  ) {
    return new Intl.DateTimeFormat(
      'uk-UA',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    ).format(new Date(value))
  }

  function isDue(
    schedule:
      | ReviewSchedule
      | undefined,
  ) {
    if (!schedule) {
      return false
    }

    return (
      schedule.status ===
        'SCHEDULED' &&
      new Date(
        schedule.nextReviewAt,
      ) <= new Date()
    )
  }

  return (
    <section className="dashboard-section progress-section">
      <div className="section-heading progress-heading">
        <div>
          <span className="eyebrow">
            LEARNING PROGRESS
          </span>

          <h2>
            Прогрес навчання
          </h2>

          <p>
            Поточний стан засвоєння
            знань та заплановані
            повторення.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            void loadProgress()
          }
          disabled={loading}
        >
          Оновити
        </button>
      </div>

      {loading && (
        <div className="status-card">
          Завантаження прогресу...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        progress.length === 0 && (
          <div className="status-card">
            Даних про прогрес ще немає.
            Пройдіть перший тест.
          </div>
        )}

      {!loading &&
        progress.length > 0 && (
          <>
            <div className="progress-summary-grid">
              <article className="progress-summary-card">
                <span>
                  Знань у прогресі
                </span>

                <strong>
                  {progress.length}
                </strong>
              </article>

              <article className="progress-summary-card">
                <span>
                  Середня точність
                </span>

                <strong>
                  {averageAccuracy}%
                </strong>
              </article>

              <article className="progress-summary-card">
                <span>
                  Потрібно повторити
                </span>

                <strong>
                  {dueCount}
                </strong>
              </article>
            </div>

            <div className="progress-list">
              {progress.map(
                (item) => {
                  const schedule =
                    getSchedule(
                      item.knowledgeId,
                    )

                  const due =
                    isDue(schedule)

                  return (
                    <article
                      className="progress-card"
                      key={item.id}
                    >
                      <div className="progress-card-header">
                        <div>
                          <span className="learner-label">
                            {
                              item
                                .learner
                                .name
                            }
                          </span>

                          <h3>
                            {
                              item
                                .knowledge
                                .title
                            }
                          </h3>
                        </div>

                        {schedule && (
                          <span
                            className={
                              due
                                ? 'review-badge due'
                                : 'review-badge scheduled'
                            }
                          >
                            {due
                              ? 'Час повторити'
                              : 'Заплановано'}
                          </span>
                        )}
                      </div>

                      <div className="accuracy-block">
                        <div className="accuracy-heading">
                          <span>
                            Точність
                          </span>

                          <strong>
                            {Math.round(
                              item.accuracy *
                                100,
                            )}
                            %
                          </strong>
                        </div>

                        <div className="accuracy-track">
                          <div
                            className="accuracy-value"
                            style={{
                              width: `${
                                item.accuracy *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="progress-metrics">
                        <div>
                          <span>
                            Правильні
                          </span>

                          <strong>
                            {
                              item.correctAnswers
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Неправильні
                          </span>

                          <strong>
                            {
                              item.incorrectAnswers
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Повторення
                          </span>

                          <strong>
                            {
                              item.repetition
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            E-Factor
                          </span>

                          <strong>
                            {item.easinessFactor.toFixed(
                              2,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Інтервал
                          </span>

                          <strong>
                            {item.interval}{' '}
                            дн.
                          </strong>
                        </div>
                      </div>

                      {schedule && (
                        <div className="next-review">
                          <span>
                            Наступне
                            повторення
                          </span>

                          <strong>
                            {formatDate(
                              schedule.nextReviewAt,
                            )}
                          </strong>
                        </div>
                      )}
                    </article>
                  )
                },
              )}
            </div>
          </>
        )}
    </section>
  )
}