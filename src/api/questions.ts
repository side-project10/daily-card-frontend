import { todayKeyKST } from '../lib/date'
import type { AnswerCard, DateKey, TodayAnswer, TodayQuestion } from '../types/question'

/**
 * ⚠️ 목(mock) API — 백엔드가 아직 없어 샘플 데이터를 지연과 함께 반환한다.
 * 서버 준비 시 각 함수 본문만 아래 주석의 실제 엔드포인트 호출로 교체하면 된다.
 * (React Query의 로딩/에러/캐싱 흐름은 목에서도 그대로 동작한다.)
 */

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms))

/**
 * 목(mock) 서버 저장소 — 백엔드 전이므로 오늘 저장한 답변을 localStorage에 흉내 낸다.
 * 실제 서버가 붙으면 아래 저장/조회 함수 본문만 엔드포인트 호출로 교체한다.
 * (서버가 `(익명ID, 날짜)` 유니크로 1일 1회를 강제하는 것을 로컬로 근사)
 */
const ANSWER_STORE_KEY = 'daily-card:today-answer'

/** 오늘 저장된 답변 한 건 (재진입 시 완료 카드 복원에 필요한 최소 정보). */
export interface StoredAnswer {
  dateKey: DateKey
  question: string
  card: AnswerCard
}

/**
 * 오늘 날짜로 저장된 답변을 **동기**로 반환. (날짜가 다르거나 없으면 null)
 * 초기 라우팅/완료 카드 시드에 쓰인다. 백엔드 전이므로 로컬 기록으로 근사하며,
 * 서버가 붙으면 `GET /answers/today` 응답으로 대체한다.
 */
export function getStoredAnswer(): StoredAnswer | null {
  try {
    const raw = localStorage.getItem(ANSWER_STORE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAnswer
    return parsed.dateKey === todayKeyKST() ? parsed : null
  } catch {
    return null
  }
}

/**
 * 오늘의 질문 조회.
 * 실제: `GET /questions/today` → { dateKey, questionId, text }
 * (서버가 KST 자정 기준으로 선정, 같은 날 모든 사용자 동일 질문)
 */
export async function fetchTodayQuestion(): Promise<TodayQuestion> {
  await delay()
  return {
    dateKey: todayKeyKST(),
    questionId: 'q-sample',
    text: '오늘 하루 가장 행복했던 순간은?',
  }
}

/**
 * 오늘 저장된 답변 존재 여부 조회. (사용자 식별은 anon_id 쿠키가 자동 처리)
 * 실제: `GET /answers/today` → 있으면 카드, 없으면 404/null.
 * 404/null 은 exists=false 로 매핑한다. (409 중복은 저장 화면 몫)
 */
export async function fetchTodayAnswer(): Promise<TodayAnswer> {
  await delay()
  const stored = getStoredAnswer()
  if (stored) {
    return { exists: true, card: stored.card }
  }
  return { exists: false }
}

/**
 * 답변 + 배경 저장 ("카드 만들기" 시점). (사용자 식별은 anon_id 쿠키가 자동 처리)
 * 실제: `POST /answers` — 서버가 `(익명ID, 날짜)` 유니크로 1일 1회 강제(중복 시 409).
 * 백엔드 전이므로 오늘 날짜로 localStorage에 기록해, 재진입 시 완료 화면(오늘 답변함)이 뜨게 한다.
 */
export async function saveTodayAnswer(
  question: string,
  card: AnswerCard,
): Promise<void> {
  await delay()
  try {
    const payload: StoredAnswer = { dateKey: todayKeyKST(), question, card }
    localStorage.setItem(ANSWER_STORE_KEY, JSON.stringify(payload))
  } catch {
    // 스토리지 접근 불가(시크릿 모드 등) 시 무시 — best-effort
  }
}
