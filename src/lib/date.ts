import type { DateKey } from '../types/question'

/**
 * KST(UTC+9) 기준 오늘의 날짜 키(YYYY-MM-DD)를 만든다.
 *
 * 주의: 실제 운영에서 날짜의 단일 진실은 **서버가 내려준 dateKey**다.
 * (기기 시계 조작·타임존 차이 방지) 이 함수는 백엔드가 없는 현재,
 * 목 API가 "오늘"을 흉내 내기 위해서만 사용한다.
 */
export function todayKeyKST(): DateKey {
  const now = new Date()
  // UTC epoch + 9시간 → KST 벽시계, 그 날짜 부분만 취한다.
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * 서버가 내려준 serviceDate(KST 자정의 UTC ISO)를 표시용 날짜 키(YYYY-MM-DD, KST)로 변환한다.
 * 예: '2026-06-18T15:00:00.000Z'(= 2026-06-19 00:00 KST) → '2026-06-19'.
 * 날짜의 단일 진실은 서버 serviceDate이며, 이 함수는 그 값을 KST 벽시계 날짜로 읽어낼 뿐이다.
 */
export function serviceDateToKey(serviceDate: string): DateKey {
  const kst = new Date(new Date(serviceDate).getTime() + KST_OFFSET_MS)
  return kst.toISOString().slice(0, 10)
}

/**
 * 다음 KST 자정(새 질문이 열리는 시각)의 **절대 시각**을 Date로 돌려준다.
 * "내일 새 질문까지" 카운트다운의 목표 시각으로 쓴다.
 *
 * 주의: `todayKeyKST`와 마찬가지로 날짜의 단일 진실은 **서버가 내려준 값**이다.
 * (기기 시계 조작·타임존 차이 방지) 이 함수는 백엔드 연동 전, 클라 기준으로
 * 목표 시각을 흉내 낼 때만 쓰고, 추후 서버 타임스탬프로 교체한다.
 */
export function nextKstMidnight(): Date {
  const now = Date.now()
  // KST 벽시계를 UTC인 것처럼 다뤄 자정 경계를 잡은 뒤, 다시 절대 시각(UTC)으로 환산.
  const kstNow = now + KST_OFFSET_MS
  const kstNextMidnight = Math.floor(kstNow / DAY_MS) * DAY_MS + DAY_MS
  return new Date(kstNextMidnight - KST_OFFSET_MS)
}
