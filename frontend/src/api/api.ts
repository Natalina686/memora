const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

export interface Account {
  id: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  account: Account
}

export interface Learner {
  id: string
  accountId: string
  name: string
  telegramChatId: string | null
  createdAt: string
  updatedAt: string
}

export interface KnowledgeCollection {
  id: string
  learnerId: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface StructuredKnowledgeFact {
  key: string
  value: string
}

export interface StructuredKnowledge {
  title: string
  summary: string
  facts: StructuredKnowledgeFact[]
  keywords: string[]
}

export interface StructureKnowledgeResponse {
  processingLogId: string
  structuredKnowledge: StructuredKnowledge
}

export interface Knowledge {
  id: string
  collectionId: string
  title: string
  sourceContent: string
  structuredData: StructuredKnowledge
  createdAt: string
  updatedAt: string
}

export type QuestionType =
  | 'OPEN_TEXT'
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'

export interface Question {
  id: string
  knowledgeId: string
  type: QuestionType
  prompt: string
  options: string[] | null
  createdAt?: string
  updatedAt?: string
}

export interface QuizSession {
  id: string
  learnerId: string
  startedAt: string
  completedAt: string | null
}

export type QuizAnswerValue =
  | string
  | string[]
  | boolean

export interface Answer {
  id: string
  quizSessionId: string
  questionId: string
  answer: QuizAnswerValue
  isCorrect: boolean
  answeredAt: string
}

export interface CompletedQuizSession
  extends QuizSession {
  answers: Answer[]
}

export interface GeneratedQuestionPreview {
  type: QuestionType
  prompt: string
  options: string[] | null
  correctAnswer:
    | string
    | string[]
    | boolean
}

export interface GenerateQuestionsResponse {
  processingLogId: string
  questions: GeneratedQuestionPreview[]
}

export interface ApprovedQuestion {
  id: string
  knowledgeId: string
  type: QuestionType
  prompt: string
  options: string[] | null
  correctAnswer:
    | string
    | string[]
    | boolean
  createdAt: string
  updatedAt: string
}

export interface ApproveQuestionsResponse {
  processingLogId: string
  questions: ApprovedQuestion[]
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem(
    'memora_access_token',
  )

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...options.headers,
      },
    },
  )

  if (!response.ok) {
    let message = 'Request failed'

    try {
      const error = (await response.json()) as {
        message?: string | string[]
      }

      if (Array.isArray(error.message)) {
        message = error.message.join(', ')
      } else if (error.message) {
        message = error.message
      }
    } catch {
      // Response body may be empty.
    }

    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function register(
  email: string,
  password: string,
) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export function login(
  email: string,
  password: string,
) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
}

export function getLearners() {
  return request<Learner[]>('/learners')
}

export function getKnowledgeCollections() {
  return request<KnowledgeCollection[]>(
    '/knowledge-collections',
  )
}

export function createKnowledgeCollection(
  learnerId: string,
  name: string,
  description?: string,
) {
  return request<KnowledgeCollection>(
    '/knowledge-collections',
    {
      method: 'POST',
      body: JSON.stringify({
        learnerId,
        name,
        description,
      }),
    },
  )
}

export function updateKnowledgeCollection(
  collectionId: string,
  name: string,
  description?: string,
) {
  return request<KnowledgeCollection>(
    `/knowledge-collections/${collectionId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        name,
        description,
      }),
    },
  )
}

export function deleteKnowledgeCollection(
  collectionId: string,
) {
  return request<KnowledgeCollection>(
    `/knowledge-collections/${collectionId}`,
    {
      method: 'DELETE',
    },
  )
}

export function structureKnowledge(
  sourceContent: string,
) {
  return request<StructureKnowledgeResponse>(
    '/ai/structure-knowledge',
    {
      method: 'POST',
      body: JSON.stringify({
        sourceContent,
      }),
    },
  )
}

export function approveStructuredKnowledge(
  processingLogId: string,
  collectionId: string,
) {
  return request<Knowledge>(
    `/ai/processing/${processingLogId}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({
        collectionId,
      }),
    },
  )
}

export function getKnowledge() {
  return request<Knowledge[]>('/knowledge')
}

export function generateQuestions(
  knowledgeId: string,
) {
  return request<GenerateQuestionsResponse>(
    `/ai/knowledge/${knowledgeId}/generate-questions`,
    {
      method: 'POST',
    },
  )
}

export function approveGeneratedQuestions(
  processingLogId: string,
) {
  return request<ApproveQuestionsResponse>(
    `/ai/processing/${processingLogId}/approve-questions`,
    {
      method: 'POST',
    },
  )
}

export function createQuizSession(
  learnerId: string,
) {
  return request<QuizSession>(
    '/quiz-sessions',
    {
      method: 'POST',
      body: JSON.stringify({
        learnerId,
      }),
    },
  )
}

export function getQuizQuestions(
  quizSessionId: string,
) {
  return request<Question[]>(
    `/quiz-sessions/${quizSessionId}/questions`,
  )
}

export function submitAnswer(
  quizSessionId: string,
  questionId: string,
  answer: QuizAnswerValue,
) {
  return request<Answer>('/answers', {
    method: 'POST',
    body: JSON.stringify({
      quizSessionId,
      questionId,
      answer,
    }),
  })
}

export function completeQuizSession(
  quizSessionId: string,
) {
  return request<CompletedQuizSession>(
    `/quiz-sessions/${quizSessionId}/complete`,
    {
      method: 'PATCH',
    },
  )
}

export interface LearningProgress {
  id: string
  learnerId: string
  knowledgeId: string
  repetition: number
  easinessFactor: number
  interval: number
  correctAnswers: number
  incorrectAnswers: number
  accuracy: number
  createdAt: string
  updatedAt: string

  knowledge: {
    id: string
    title: string
  }

  learner: {
    id: string
    name: string
  }
}

export type ReviewStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'

export interface ReviewSchedule {
  id: string
  learnerId: string
  knowledgeId: string
  nextReviewAt: string
  status: ReviewStatus
  createdAt: string
  updatedAt: string
}

export function getLearningProgress() {
  return request<LearningProgress[]>(
    '/learning-progress',
  )
}

export function getReviewSchedule() {
  return request<ReviewSchedule[]>(
    '/review-schedule',
  )
}