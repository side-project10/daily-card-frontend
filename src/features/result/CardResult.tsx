import { useEffect, useRef, useState } from 'react'
import { nextKstMidnight } from '../../lib/date'
import { captureAndSaveCard } from '../../lib/downloadCard'
import CardPreview from '../../components/CardPreview/CardPreview'
import Button from '../../components/Button/Button'
import BackButton from '../../components/BackButton/BackButton'
import Toast from '../../components/Toast/Toast'
import './CardResult.css'

interface CardResultProps {
  /** 카드에 재노출할 오늘의 질문. */
  question?: string
  /** 카드에 표시할 사용자의 답변. (줄바꿈 `\n` 반영) */
  answer?: string
  /** 카드 상단 날짜 라벨 (Figma: 2026-12-05). */
  date?: string
  /** 3번에서 선택한 카드 배경(CSS 값). 미지정 시 Figma 샘플 보라 그라데이션. */
  background?: string
  /** 배경이 밝은지(글자 반전). 이미지 배경은 CSS로 밝기를 못 재므로 선택 시점의 판정을 전달받는다. */
  onLight?: boolean
  /**
   * 완료(재진입) 상태 여부. 저장된 값이 있으면(오늘 이미 답변) true로 켜서
   * "오늘 답변은 완료했어요" + 카운트다운을 추가로 노출한다. (별도 화면 없이 bool로 분기)
   */
  completed?: boolean
  /**
   * "내일 새 질문까지" 카운트다운의 **목표 시각**(새 질문이 열리는 다음 KST 자정). completed일 때만 노출.
   * App이 서버 날짜(dateKey=serviceDate)에서 파생해 주입한다. 미지정 시 클라 기준 다음 KST 자정으로 폴백.
   * duration이 아니라 절대 시각이라 낡지 않으며, 이 시각까지 매초 감소한다. (도달 시 00:00:00에서 멈춤)
   */
  deadline?: Date
  /** 헤더 "뒤로가기" */
  onBack?: () => void
  /**
   * "카드 다운하기" 저장이 성공(공유/다운로드)한 뒤 호출되는 알림 훅(선택).
   * 실제 캡쳐·저장은 이 컴포넌트가 카드 영역(cardRef)을 이미지로 잡아 직접 수행한다.
   */
  onDownload?: () => void
  /** "다른 사람이 남긴 답변 보기" — 타인 답변(5번)으로 이동. */
  onViewOthers?: () => void
}

// Figma iPhone 17-9가 보여주는 샘플 배경(보라 그라데이션).
// 실제 흐름에서는 3번(배경 선택)에서 고른 값이 주입되어 이 기본값을 덮는다.
const SAMPLE_BG = 'linear-gradient(155deg, #E9E1F4 0%, #9A6AC6 100%)'

/** 목표 시각까지 남은 초 (음수는 0으로 클램프). */
function secondsUntil(target: number): number {
  return Math.max(0, Math.round((target - Date.now()) / 1000))
}

/** 총 초를 `HH:MM:SS`로 포맷. */
function formatHms(total: number): string {
  const t = Math.max(0, total)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`
}

/**
 * `deadline`(목표 시각)까지 매초 감소하는 남은 시간 문자열을 돌려준다.
 * setInterval 누적이 아니라 매 틱 `deadline - now`로 재계산하므로 탭이 백그라운드로
 * 스로틀링돼도 드리프트 없이 자기보정된다. 도달 시 00:00:00에서 멈춘다.
 * `active`가 false면(카운트다운 미노출) 타이머를 돌리지 않는다.
 */
function useCountdown(deadline: Date, active: boolean): string {
  const target = deadline.getTime()
  const [remaining, setRemaining] = useState(() => secondsUntil(target))

  useEffect(() => {
    if (!active) return
    const tick = () => {
      const next = secondsUntil(target)
      setRemaining(next)
      return next
    }
    tick() // 마운트/목표 변경 즉시 반영 (첫 1초를 기다리지 않음)
    const id = setInterval(() => {
      if (tick() <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [target, active])

  return formatHms(remaining)
}

/** 다운로드 완료 토스트의 체크 아이콘 (Figma check-contained 20×20 — 흰 원 + 진한 체크). */
function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path
        d="M5.8 10.4 8.6 13.1 14.2 7.2"
        stroke="#303030"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 다운로드 실패 토스트의 경고 아이콘 (Figma toast Variant2 20×20 — 둥근 삼각형 + 느낌표 아웃라인, 흰색). */
function WarningTriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * 카드 결과 화면. 완성 카드 + [카드 다운하기 / 다른 사람이 남긴 답변 보기].
 * 같은 컴포넌트가 `completed` bool로 두 상태를 겸한다:
 * - **방금 만든 결과(#4, Figma iPhone 17-9)**: `completed=false`. `onBack`으로 배경 선택 복귀.
 * - **재진입/내 카드보기 완료 화면(Figma "…다시 들어왔을때")**: `completed=true` → 완료 안내 + 카운트다운.
 *   돌아갈 곳이 없어 `onBack` 미전달 시 헤더(뒤로가기)는 숨긴다.
 * "카드 다운하기"는 카드 영역 이미지 캡쳐 방식(추후 구현)이며, 지금은 완료 토스트만 노출한다.
 */
function CardResult({
  question = '무인도에 딱 한권의 책만 가져갈수 있다면 어떤 책인가요?',
  answer = '‘세이노의 가르침’.\n곱씹을수록 새로운 문장을 발견하게 되는 책.',
  date = '2026-12-05',
  background = SAMPLE_BG,
  onLight,
  completed = false,
  deadline,
  onBack,
  onDownload,
  onViewOthers,
}: CardResultProps) {
  // 캡쳐 대상 = 실제 카드(.card) 요소. CardPreview → Card로 ref가 전달된다.
  const cardRef = useRef<HTMLDivElement>(null)

  // 저장 결과 토스트. id는 매번 증가시켜 key로 Toast를 remount(애니메이션/타이머 재시작),
  // variant로 성공/실패 메시지·아이콘을 분기한다. null이면 미노출.
  const [toast, setToast] = useState<{ id: number; variant: 'success' | 'error' } | null>(null)

  // 캡쳐 진행 중 여부 → 버튼 비활성(중복 클릭 방지).
  const [busy, setBusy] = useState(false)

  // deadline 미지정 시 다음 KST 자정을 한 번만 계산 (매 렌더 새 Date 생성 방지).
  const [fallbackDeadline] = useState(nextKstMidnight)

  // completed일 때만 카운트다운을 매초 갱신 (미노출 시 타이머 미가동).
  const remaining = useCountdown(deadline ?? fallbackDeadline, completed)

  // 카드 영역을 PNG로 캡쳐해 저장(모바일 공유 시트 / 데스크톱 다운로드).
  const handleDownload = async () => {
    if (busy || !cardRef.current) return
    setBusy(true)
    try {
      const result = await captureAndSaveCard(cardRef.current, `daily-card-${date}.png`)
      // 사용자가 공유 시트를 닫은 경우(cancelled)는 토스트를 띄우지 않는다.
      if (result === 'cancelled') return
      onDownload?.()
      setToast((t) => ({ id: (t?.id ?? 0) + 1, variant: 'success' }))
    } catch (err) {
      // 캡쳐/공유 실패 원인을 프로덕션에서 추적할 수 있게 남긴다(사용자엔 에러 토스트).
      console.error('카드 저장 실패:', err)
      setToast((t) => ({ id: (t?.id ?? 0) + 1, variant: 'error' }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen result">
      {/* 헤더: < 뒤로가기 (Figma Frame 48/46). 돌아갈 곳이 있을 때(onBack 전달)만 노출. */}
      {onBack && <BackButton onClick={onBack} />}

      <div className="result__content">
        {/* 완성 카드 — 배경 선택 결과 반영 (#3/#4/#5 공용 프리뷰). ref로 이 카드만 캡쳐한다. */}
        <CardPreview ref={cardRef} question={question} answer={answer} date={date} background={background} onLight={onLight} />

        <div className="result__footer">
          {/* 액션: 다운로드(primary) / 타인 답변(secondary) — Figma Frame 3 */}
          <div className="result__actions">
            <Button onClick={handleDownload} disabled={busy}>카드 다운하기</Button>
            <Button variant="secondary" onClick={onViewOthers}>
              다른 사람이 남긴 답변 보기
            </Button>
          </div>

          {/* 완료(재진입) 상태에서만: 완료 안내 + 다음 질문까지 카운트다운 */}
          {completed && (
            <div className="result__status">
              <p className="result__notice">오늘 답변은 완료했어요</p>
              {/* Figma Frame 57: 타이머 박스 + 캡션 그룹 (gap 8). status(gap 12)와 별도 그룹. */}
              <div className="result__timer-group">
                <div className="result__timer">
                  <span className="result__timer-label">내일 새 질문까지</span>
                  <span className="result__timer-value">{remaining}</span>
                </div>
                <p className="result__caption">매일 자정 새로운 질문이 열려요</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 저장 결과 토스트 (Figma iPhone 17-10) — 하단. 성공은 체크 아이콘, 실패는 아이콘 없이 안내. */}
      {toast && (
        <Toast
          key={toast.id}
          position="bottom"
          icon={toast.variant === 'success' ? <CheckCircleIcon /> : <WarningTriangleIcon />}
          message={
            toast.variant === 'success'
              ? '카드가 성공적으로 다운로드 되었어요.'
              : '카드를 다운로드 하지 못했어요.'
          }
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default CardResult
