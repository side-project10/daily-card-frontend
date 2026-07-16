import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Onboarding from './features/onboarding/Onboarding'
import TodayQuestion from './features/question/TodayQuestion'
import AnswerWrite from './features/answer/AnswerWrite'
import BackgroundSelect from './features/background/BackgroundSelect'
import { resolveBackground } from './features/background/backgrounds'
import { nextKstMidnightAfter } from './lib/date'
import CardResult from './features/result/CardResult'
import OtherAnswer from './features/others/OtherAnswer'
import type { Step } from './app/steps'
import type { AnswerCard } from './types/question'
import { saveTodayAnswer } from './api/questions'
import { ApiError } from './api/http'
import { useTodayQuestion } from './hooks/queries/useTodayQuestion'
import { useTodayAnswer } from './hooks/queries/useTodayAnswer'
import { useOtherAnswer } from './hooks/queries/useOtherAnswer'
import './App.css'

/** 디자인 프레임 고정 크기 (Figma iPhone 402×874). 모든 화면이 이 캔버스 위에 그려진다. */
const FRAME_WIDTH = 402
const FRAME_HEIGHT = 874

interface WizardProps {
  /** 재진입(오늘 이미 답변) 시 서버가 준 완료 카드. 없으면 신규 흐름(온보딩부터). */
  answered: AnswerCard | null
  /** 오늘의 질문 텍스트·날짜 키 — 재진입 완료 카드 시드에만 쓰인다(신규 흐름은 각 단계에서 채움). */
  todayText: string
  todayDateKey: string
  /** 오늘의 질문 ID(서버). 답변 저장(POST)·타인 답변 조회에 쓴다. 세션 내내 고정값이라 prop으로 받는다. */
  todayQuestionId: number
}

/**
 * 5단계 위저드 스텝 머신. 초기 스텝/시드는 **마운트 시점에 서버 데이터로 동기 결정**된다.
 * (App이 서버 응답이 준비된 뒤에만 이 컴포넌트를 마운트하므로, effect 없이 lazy useState로 시드한다.)
 */
function Wizard({ answered, todayText, todayDateKey, todayQuestionId }: WizardProps) {
  // 재진입이면 완료 카드(#4)로, 아니면 온보딩으로 시작. (마운트 시 서버 상태로 확정)
  const [step, setStep] = useState<Step>(answered ? 'card' : 'onboarding')
  // 완료(재진입) 여부 — CardResult의 완료 안내/카운트다운을 켜는 **명시적** 신호.
  // 저장 타이밍이 아니라 "이미 확정된 답을 다시 보는 중인가"로 판단한다.
  const [completed, setCompleted] = useState(answered !== null)

  // 카드에 노출할 데이터. 재진입이면 서버 답변으로 시드하고, 신규 흐름이면 각 단계에서 채운다.
  const [question, setQuestion] = useState(answered ? todayText : '')
  const [date, setDate] = useState(answered ? todayDateKey : '')
  const [answer, setAnswer] = useState(answered?.answer ?? '')
  // 배경의 정체성은 스와치 id 하나. CSS 값·밝기는 렌더 시점에 resolveBackground로 파생한다.
  const [background, setBackground] = useState(answered?.background ?? '')

  // 같은 질문의 타인 답변 1건 — 타인 답변(#5) 화면에서만 조회한다(본인 제외는 서버 담당).
  const others = useOtherAnswer(todayQuestionId, step === 'others')

  // 저장/전달되는 배경 id를 렌더용 { value, light }로 파생. 미선택(빈 id)이면 각 화면 기본 배경에 맡긴다.
  const bg = background ? resolveBackground(background) : null
  // 타인 답변의 배경도 A안 규약(bgValue=스와치 id)이라 동일하게 파생해 앞 카드에 반영한다.
  const otherBg = others.data ? resolveBackground(others.data.background) : null
  // 앞 카드에 보일 텍스트: 로딩·조회실패·0건은 상태별 안내 문구, 있으면 실제 타인 답변.
  // (실패를 "0건"과 구분해 오안내를 막고, onRetry로 재시도를 제공한다.)
  const otherAnswerText = others.isLoading
    ? '불러오는 중…'
    : others.isError
      ? '답변을 불러오지 못했어요.'
      : (others.data?.content ?? '아직 다른 사람의 답변이 없어요.')

  return (
    <>
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
          question={question}
          answer={answer}
          date={date}
          onBack={() => setStep('answer')}
          onCreate={async (bgId) => {
            setBackground(bgId)
            // "카드 만들기" = 저장 시점(POST /answers). 저장과 최소 로딩(1200ms)을 함께 기다려
            // 저장이 빨라도 로딩 모달이 깜빡이지 않게 한 뒤 결과(#4)를 완료 안내 없이 보여준다.
            // (실패는 Promise.all이 즉시 reject하므로 에러는 지연 없이 노출된다.)
            const minLoading = new Promise((resolve) => setTimeout(resolve, 1200))
            try {
              await Promise.all([
                saveTodayAnswer(todayQuestionId, { answer, background: bgId }),
                minLoading,
              ])
              setCompleted(false)
            } catch (err) {
              // 다른 탭·기기에서 오늘 이미 답변(409) → 완료 카드로 안내.
              // 그 외(400 금칙어·오늘의 질문 아님, 네트워크)는 되던져 BackgroundSelect가 에러를 노출한다.
              if (err instanceof ApiError && err.status === 409) {
                setCompleted(true)
              } else {
                throw err
              }
            }
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
          // 카운트다운 목표 = 서버 날짜(dateKey)에서 파생한 다음 KST 자정. (클라 시계 폴백은 CardResult가 담당)
          deadline={date ? nextKstMidnightAfter(date) : undefined}
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
          question={question}
          date={date}
          // 앞 카드 = 타인 답변 + 타인이 고른 배경. 로딩/실패/0건은 카드 안 안내 문구로 대체한다.
          answer={otherAnswerText}
          background={otherBg?.value}
          onLight={otherBg?.light}
          // 뒤 카드 = 내 카드(내 답변 + 내 배경, 장식용).
          myAnswer={answer}
          myBackground={bg?.value}
          myLight={bg?.light}
          // "내 카드보기" → 완료 카드(#4 재사용, completed)로 즉시 이동.
          onViewMyCard={() => {
            setCompleted(true)
            setStep('card')
          }}
        />
      )}
    </>
  )
}

function App() {
  // 서버 상태(React Query): 오늘의 질문 + 오늘 본인 답변 여부. 초기 라우팅의 단일 진실.
  // 둘 다 처음 로드되기 전(pending)엔 로딩을 덮고, 준비되면 Wizard를 시드와 함께 마운트한다.
  const todayQuestion = useTodayQuestion()
  const myAnswer = useTodayAnswer()
  const booting = todayQuestion.isPending || myAnswer.isPending
  const dateKey = todayQuestion.data?.dateKey

  // 일 넘어감(rollover) 자동 반영: 서버 dateKey로 다음 KST 자정(새 질문 시각)을 잡아 그 시각에
  // 모든 쿼리를 리셋한다. resetQueries가 booting을 다시 켜 → 로딩 후 Wizard가 새 날 시드로 재마운트
  // (수동 새로고침 불필요). 질문/내답변이 함께 pending→success를 거치므로 데이터 불일치 창이 없다.
  // 목표가 이미 지났으면(경계·클라 시계 앞섬) 60초 간격으로 재확인해 서버가 실제 롤오버될 때까지 기다린다.
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!dateKey) return
    const target = nextKstMidnightAfter(dateKey).getTime()
    const now = Date.now()
    const delay = target > now ? target - now + 1000 : 60_000
    const id = window.setTimeout(() => void queryClient.resetQueries(), delay)
    return () => window.clearTimeout(id)
  }, [dateKey, queryClient])

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

  // 오늘 본인 답변이 있으면(재진입) 완료 카드로 시드. 없으면 null → 신규 흐름(온보딩부터).
  const answered = myAnswer.data?.exists ? myAnswer.data.card ?? null : null

  return (
    <div className="app" ref={appRef}>
      <div className="frame" style={{ '--fit': scale } as CSSProperties}>
        {booting ? (
          <div className="screen app__booting">불러오는 중…</div>
        ) : (
          <Wizard
            answered={answered}
            todayText={todayQuestion.data?.text ?? ''}
            todayDateKey={todayQuestion.data?.dateKey ?? ''}
            todayQuestionId={todayQuestion.data?.questionId ?? 0}
          />
        )}
      </div>
    </div>
  )
}

export default App
