import { apiGet, apiPost } from './http'
import { backgroundKind } from '../features/background/backgrounds'
import { serviceDateToKey } from '../lib/date'
import type { AnswerCard, TodayAnswer, TodayQuestion } from '../types/question'

/**
 * 서버 연동 API. 인증은 쿠키 전용(anon_id) — apiGet/apiPost가 `credentials: 'include'`로 자동 처리한다.
 * 로딩/에러/캐싱은 React Query(hooks/queries)가 각 함수의 Promise 위에서 담당한다.
 */

/** `GET /questions/today` 응답. question은 운영자 미등록일이면 null. */
interface TodayQuestionResponse {
  question: { id: number; body: string } | null
  answeredToday: boolean
  /** KST 자정 기준 서비스 날짜 (UTC ISO-8601). */
  serviceDate: string
}

/** `GET /answers/me` 응답(본인 오늘 답변). 없으면 null. */
interface MyAnswerResponse {
  id: number
  questionId: number
  content: string
  bgType: string
  bgValue: string
}

/**
 * 오늘의 질문 조회. `GET /questions/today`
 * (서버가 KST 자정 기준으로 선정하며, 같은 날 모든 사용자 동일 질문)
 * 날짜의 단일 진실은 서버 serviceDate이며, 클라 표시용 dateKey(KST)로 변환한다.
 * 운영자 미등록일(question=null)이면 text=''·questionId=0으로 내린다.
 */
export async function fetchTodayQuestion(): Promise<TodayQuestion> {
  const res = await apiGet<TodayQuestionResponse>('/questions/today')
  return {
    dateKey: serviceDateToKey(res.serviceDate),
    questionId: res.question?.id ?? 0,
    text: res.question?.body ?? '',
  }
}

/**
 * 오늘 본인 답변 조회 (재진입 시 완료 카드 복원용). `GET /answers/me`
 * 사용자 식별은 anon_id 쿠키가 자동 처리하며, 서버 기록이 단일 진실이다.
 * 없으면 200 + null 본문 → exists=false 로 매핑. (배경은 A안이라 bgValue가 곧 스와치 id)
 */
export async function fetchTodayAnswer(): Promise<TodayAnswer> {
  const res = await apiGet<MyAnswerResponse | null>('/answers/me')
  if (!res) return { exists: false }
  return { exists: true, card: { answer: res.content, background: res.bgValue } }
}

/**
 * 답변 + 배경 저장 ("카드 만들기" 시점). 사용자 식별은 anon_id 쿠키가 자동 처리한다.
 * `POST /answers` — 서버가 `(익명ID, 날짜)` 유니크로 1일 1회를 강제한다.
 *   - 오늘 이미 답변: 409
 *   - 금칙어 / 오늘의 질문 아님: 400
 * 실패 시 ApiError(status 포함)를 던지므로 호출부가 분기한다.
 *
 * 배경은 A안: bgValue에 **스와치 id**를 그대로 싣고, bgType(종류)은 카탈로그에서 파생한다.
 * (컬러/그라데이션/이미지 일관 — 빌드마다 바뀌는 이미지 URL을 저장하지 않아 재배포에도 안 깨짐.)
 */
export async function saveTodayAnswer(
  questionId: number,
  card: AnswerCard,
): Promise<void> {
  await apiPost('/answers', {
    questionId,
    content: card.answer,
    bgType: backgroundKind(card.background),
    bgValue: card.background,
  })
}
