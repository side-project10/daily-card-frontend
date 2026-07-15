import { useQuery } from '@tanstack/react-query'
import { fetchTodayAnswer } from '../../api/questions'

/**
 * 오늘 저장된 답변 존재 여부 조회. (재진입 체크 2 — 완료 모달 판정)
 * 사용자 식별은 anon_id 쿠키가 자동 처리하며, 서버 기록이 단일 진실이다.
 */
export function useTodayAnswer() {
  return useQuery({
    queryKey: ['today-answer'],
    queryFn: () => fetchTodayAnswer(),
  })
}
