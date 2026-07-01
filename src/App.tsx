import { useState } from 'react'
import Onboarding from './features/onboarding/Onboarding'
import TodayQuestion from './features/question/TodayQuestion'
import AnswerWrite from './features/answer/AnswerWrite'
import type { Step } from './app/steps'
import './App.css'

function App() {
  const [step, setStep] = useState<Step>('onboarding')
  // 답변 작성 화면에 재노출할 질문. 오늘의 질문 로딩 완료 후 넘겨받는다.
  const [question, setQuestion] = useState('')

  return (
    <div className="app">
      {step === 'onboarding' && <Onboarding onComplete={() => setStep('today')} />}

      {step === 'today' && (
        <TodayQuestion
          onNext={(q) => {
            setQuestion(q)
            setStep('answer')
          }}
          onNavigate={setStep}
        />
      )}

      {step === 'answer' && (
        <AnswerWrite question={question} onSubmit={() => setStep('card')} />
      )}

      {/* TODO: 카드 결과(4번) 화면 구현 예정 — 현재는 플레이스홀더 */}
      {step === 'card' && (
        <div className="app__placeholder">
          <p>카드 결과 화면(4번)은 준비 중이에요.</p>
          <button type="button" onClick={() => setStep('today')}>
            돌아가기
          </button>
        </div>
      )}
    </div>
  )
}

export default App
