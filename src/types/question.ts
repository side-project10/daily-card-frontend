/** 서버 기준(KST 자정) 날짜 키. 예: '2026-12-05' */
export type DateKey = string

/** 오늘의 질문 (서버가 날짜별로 선정해 내려줌) */
export interface TodayQuestion {
  dateKey: DateKey
  questionId: string
  text: string
}

/** 카드 결과(4번 화면)에서 필요한 최소 정보 */
export interface AnswerCard {
  answer: string
  /**
   * 배경 스와치 id (예: 'black', 'grad-1'). 렌더 시점에 `resolveBackground(id)`로
   * CSS 값·밝기를 파생한다. (해시가 바뀌는 이미지 URL을 저장하지 않아 재배포에도 안 깨짐)
   */
  background: string
}

/**
 * 오늘(익명ID 기준) 저장된 답변 존재 여부.
 * exists=true 이면 1번 화면에서 완료 모달을 띄운다.
 */
export interface TodayAnswer {
  exists: boolean
  card?: AnswerCard
}
