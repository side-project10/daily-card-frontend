import { useMemo, useState } from 'react'
import Onboarding from './features/onboarding/Onboarding'
import TodayQuestion from './features/question/TodayQuestion'
import AnswerWrite from './features/answer/AnswerWrite'
import BackgroundSelect from './features/background/BackgroundSelect'
import CardResult from './features/result/CardResult'
import OtherAnswer from './features/others/OtherAnswer'
import type { Step } from './app/steps'
import { getStoredAnswer, saveTodayAnswer } from './api/questions'
import { getAnonId } from './lib/anonId'
import './App.css'

function App() {
  // 마운트 시 1회만 저장된 오늘 답변을 읽어 초기 상태를 시드한다. (렌더 중 localStorage 재읽기 방지)
  const saved = useMemo(() => getStoredAnswer(), [])

  // 재진입(새로고침/재방문): 저장된 답변이 있으면 온보딩을 건너뛰고 완료 카드로 직행.
  const [step, setStep] = useState<Step>(saved ? 'card' : 'onboarding')
  // 완료(재진입) 여부 — CardResult의 완료 안내/카운트다운을 켜는 **명시적** 신호.
  // 저장 타이밍이 아니라 "이미 확정된 답을 다시 보는 중인가"로 판단한다.
  const [completed, setCompleted] = useState(saved !== null)

  // 카드에 노출할 데이터. 재진입 시 저장값으로 시드하고, 위저드 진행 중엔 각 단계에서 채운다.
  const [question, setQuestion] = useState(saved?.question ?? '')
  const [date, setDate] = useState(saved?.dateKey ?? '')
  const [answer, setAnswer] = useState(saved?.card.answer ?? '')
  const [background, setBackground] = useState(saved?.card.background ?? '')

  return (
    <div className="app">
      {step === 'onboarding' && <Onboarding onComplete={() => setStep('today')} />}

      {step === 'today' && (
        <TodayQuestion
          onNext={(q, d) => {
            setQuestion(q)
            setDate(d)
            setStep('answer')
          }}
        />
      )}

      {step === 'answer' && (
        <AnswerWrite
          question={question}
          onSubmit={(a) => {
            setAnswer(a)
            setStep('background')
          }}
        />
      )}

      {step === 'background' && (
        <BackgroundSelect
          question={question || undefined}
          answer={answer || undefined}
          onBack={() => setStep('answer')}
          onCreate={(bg) => {
            setBackground(bg)
            // "카드 만들기" = 저장 시점. 방금 만든 결과(#4)는 완료 안내 없이 보여준다(completed=false).
            void saveTodayAnswer(getAnonId(), question, { answer, background: bg })
            setCompleted(false)
            setStep('card')
          }}
        />
      )}

      {step === 'card' && (
        <CardResult
          question={question || undefined}
          answer={answer || undefined}
          background={background || undefined}
          date={date || undefined}
          // 재진입/내 카드보기(completed)면 완료 안내·카운트다운을 켠다.
          // 방금 만든 결과(#4)면 배경 선택으로 되돌아가고, 완료 화면은 돌아갈 곳이 없어 뒤로가기를 숨긴다.
          completed={completed}
          onBack={completed ? undefined : () => setStep('background')}
          onViewOthers={() => setStep('others')}
          // TODO: 다운로드는 html2canvas 등으로 추후 연동
        />
      )}

      {step === 'others' && (
        <OtherAnswer
          question={question || undefined}
          background={background || undefined}
          // TODO: 타인 답변은 API(같은 질문의 무작위 답변 1개) 연동 후 주입 — 지금은 샘플 기본값
          // "내 카드보기" → 완료 카드(#4 재사용, completed)로 즉시 이동. (서버조회 없음)
          onViewMyCard={() => {
            setCompleted(true)
            setStep('card')
          }}
        />
      )}
    </div>
  )
}

export default App
