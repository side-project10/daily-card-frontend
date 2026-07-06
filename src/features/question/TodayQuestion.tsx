import { useEffect, useState } from 'react'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import Toast from '../../components/Toast/Toast'
import { useTodayQuestion } from '../../hooks/queries/useTodayQuestion'
import { getLastSeenDate, setLastSeenDate } from '../../lib/lastSeen'
import cardHero from '../../assets/question/card-hero.png'
import './TodayQuestion.css'

interface TodayQuestionProps {
  /** "답변하기" → 답변 작성(2번) 화면으로. 현재 질문 텍스트와 날짜 키를 함께 넘긴다. */
  onNext?: (question: string, date: string) => void
}

/**
 * 화면 #1 오늘의 질문 (Figma iPhone 17-3).
 * 오늘 답변한 사용자는 App 라우팅이 완료 카드(#4)로 직행시키므로, 이 화면은 **미답변 상태 전용**이다.
 * (재진입 완료 화면은 CardResult가 담당 — 여기선 질문 노출 + "새 질문 도착" 토스트만.)
 */
function TodayQuestion({ onNext }: TodayQuestionProps) {
  const question = useTodayQuestion()
  // 마운트 시점의 "마지막 본 날짜"를 고정 스냅샷 (렌더 중 파생 계산에 사용)
  const [lastSeenAtMount] = useState(getLastSeenDate)
  const [toastDismissed, setToastDismissed] = useState(false)

  const dateKey = question.data?.dateKey

  // 재진입 체크 1 — 새 질문 도착: 마지막 본 날짜와 오늘이 다르면 토스트.
  const isNewQuestion = !!dateKey && lastSeenAtMount !== dateKey && !toastDismissed

  // "마지막 본 날짜"를 오늘로 갱신 (localStorage 쓰기만; setState 아님).
  useEffect(() => {
    if (dateKey && lastSeenAtMount !== dateKey) {
      setLastSeenDate(dateKey)
    }
  }, [dateKey, lastSeenAtMount])

  if (question.isPending) {
    return <div className="screen today--center">불러오는 중…</div>
  }

  if (question.isError) {
    return (
      <div className="screen today--center">
        <p className="today__error">질문을 불러오지 못했어요.</p>
        <Button onClick={() => question.refetch()}>다시 시도</Button>
      </div>
    )
  }

  const q = question.data

  return (
    <div className="screen today">
      {isNewQuestion && (
        <Toast message="새로운 질문이 도착했어요" onDismiss={() => setToastDismissed(true)} />
      )}

      <p className="today__date">{`[${q.dateKey}] 오늘의 질문`}</p>

      <div className="today__prompt">
        <p className="today__hint">간단하게 작성해주세요.</p>
        <h1 className="today__question">{`“${q.text}”`}</h1>
      </div>

      <div className="today__card">
        <Card image={cardHero} />
      </div>

      <div className="today__footer">
        <Button onClick={() => onNext?.(q.text, q.dateKey)}>답변하기</Button>
      </div>
    </div>
  )
}

export default TodayQuestion
