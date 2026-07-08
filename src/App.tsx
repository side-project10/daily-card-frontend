import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import Onboarding from './features/onboarding/Onboarding'
import TodayQuestion from './features/question/TodayQuestion'
import AnswerWrite from './features/answer/AnswerWrite'
import BackgroundSelect from './features/background/BackgroundSelect'
import { resolveBackground } from './features/background/backgrounds'
import CardResult from './features/result/CardResult'
import OtherAnswer from './features/others/OtherAnswer'
import type { Step } from './app/steps'
import { getStoredAnswer, saveTodayAnswer } from './api/questions'
import { getAnonId } from './lib/anonId'
import './App.css'

/** 디자인 프레임 고정 크기 (Figma iPhone 402×874). 모든 화면이 이 캔버스 위에 그려진다. */
const FRAME_WIDTH = 402
const FRAME_HEIGHT = 874

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
  // 배경의 정체성은 스와치 id 하나. CSS 값·밝기는 렌더 시점에 resolveBackground로 파생한다.
  const [background, setBackground] = useState(saved?.card.background ?? '')

  // 레터박스 스케일: 402×874 고정 프레임을 실제 가용 영역(.app content-box)에 맞춰 균일 축소한다.
  // 짧은 모바일 뷰포트·데스크톱 공통 — 스크롤/리플로우 없이 디자인 비율 그대로 유지.
  // .app이 height:100svh + safe-area 패딩이라 content-box엔 브라우저 UI·노치가 이미 빠져 있고,
  // svh라 주소창 유동·소프트 키보드에도 배율이 흔들리지 않는다. (1 초과 확대는 안 함)
  const appRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = appRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width <= 0 || height <= 0) return
      setScale(Math.min(width / FRAME_WIDTH, height / FRAME_HEIGHT, 1))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 저장/전달되는 배경 id를 렌더용 { value, light }로 파생. 미선택(빈 id)이면 각 화면 기본 배경에 맡긴다.
  const bg = background ? resolveBackground(background) : null

  return (
    <div className="app" ref={appRef}>
      <div className="frame" style={{ '--fit': scale } as CSSProperties}>
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
            onCreate={(bgId) => {
              setBackground(bgId)
              // "카드 만들기" = 저장 시점. 방금 만든 결과(#4)는 완료 안내 없이 보여준다(completed=false).
              void saveTodayAnswer(getAnonId(), question, { answer, background: bgId })
              setCompleted(false)
              setStep('card')
            }}
          />
        )}

        {step === 'card' && (
          <CardResult
            question={question || undefined}
            answer={answer || undefined}
            background={bg?.value}
            onLight={bg?.light}
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
            background={bg?.value}
            onLight={bg?.light}
            // TODO: 타인 답변은 API(같은 질문의 무작위 답변 1개) 연동 후 주입 — 지금은 샘플 기본값
            // "내 카드보기" → 완료 카드(#4 재사용, completed)로 즉시 이동. (서버조회 없음)
            onViewMyCard={() => {
              setCompleted(true)
              setStep('card')
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App
