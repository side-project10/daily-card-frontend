import { useEffect, useState } from 'react'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import Modal from '../../components/Modal/Modal'
import Toast from '../../components/Toast/Toast'
import { useTodayQuestion } from '../../hooks/queries/useTodayQuestion'
import { useTodayAnswer } from '../../hooks/queries/useTodayAnswer'
import { getLastSeenDate, setLastSeenDate } from '../../lib/lastSeen'
import type { Step } from '../../app/steps'
import cardHero from '../../assets/question/card-hero.png'
import './TodayQuestion.css'

interface TodayQuestionProps {
  /** "답변하기" → 답변 작성(2번) 화면으로. 현재 질문 텍스트를 함께 넘긴다. */
  onNext?: (question: string) => void
  /** 완료 모달 "카드 다시보기" 등 임의 스텝 이동 */
  onNavigate?: (step: Step) => void
}

/** 화면 #1 오늘의 질문 (Figma iPhone 17-3). */
function TodayQuestion({ onNext, onNavigate }: TodayQuestionProps) {
  const question = useTodayQuestion()
  const answer = useTodayAnswer()
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
  // 재진입 체크 2 — 오늘 답변 기록이 있으면 완료 모달. (서버 기록이 단일 진실)
  const showCompletion = answer.data?.exists === true

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
        <Button onClick={() => onNext?.(q.text)}>답변하기</Button>
      </div>

      {showCompletion && (
        <Modal
          title="오늘은 이미 답변했어요"
          description="하루에 한 번만 답변할 수 있어요. 완성한 카드를 다시 볼 수 있어요."
          actionLabel="카드 다시보기"
          onAction={() => onNavigate?.('card')}
        />
      )}
    </div>
  )
}

export default TodayQuestion
