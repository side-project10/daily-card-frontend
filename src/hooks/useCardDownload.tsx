import { useState, type ReactNode, type RefObject } from 'react'
import { captureAndSaveCard } from '../lib/downloadCard'
import Toast from '../components/Toast/Toast'

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

interface CardDownload {
  /** 캡쳐 진행 중 여부 → 다운로드 버튼 비활성(중복 클릭 방지). */
  busy: boolean
  /** "카드 다운하기" 클릭 핸들러 (캡쳐 → 저장 → 결과 토스트). */
  handleDownload: () => void
  /** 하단 결과 토스트 엘리먼트 (없으면 null). 화면 하단에 그대로 렌더한다. */
  toastElement: ReactNode
}

/**
 * 카드 영역을 PNG로 캡쳐해 저장하는 공용 훅. 내 카드(#4)·타인 카드(#5)가 동일하게 사용한다.
 * - `cardRef`: 캡쳐 대상 `.card` 요소 ref (CardPreview → Card로 전달된 것).
 * - `filename`: 저장 파일명 (예: `haru-hana-2026-07-16.png`).
 * - `onSuccess`: 저장 성공(공유/다운로드) 뒤 호출되는 알림 훅(선택).
 *
 * 결과 처리: 성공 → 완료 토스트, 실패 → 경고 토스트 + `console.error`, 공유 취소(cancelled) → 무시.
 * 캡쳐/공유 실패 시에도 `finally`에서 busy를 풀어 즉시 재시도할 수 있다.
 */
export function useCardDownload(
  cardRef: RefObject<HTMLDivElement | null>,
  filename: string,
  onSuccess?: () => void,
): CardDownload {
  const [busy, setBusy] = useState(false)
  // id는 매번 증가시켜 key로 Toast를 remount(애니메이션/타이머 재시작), variant로 성공/실패를 분기.
  const [toast, setToast] = useState<{ id: number; variant: 'success' | 'error' } | null>(null)

  const handleDownload = async () => {
    if (busy || !cardRef.current) return
    setBusy(true)
    try {
      const result = await captureAndSaveCard(cardRef.current, filename)
      // 사용자가 공유 시트를 닫은 경우(cancelled)는 토스트를 띄우지 않는다.
      if (result === 'cancelled') return
      onSuccess?.()
      setToast((t) => ({ id: (t?.id ?? 0) + 1, variant: 'success' }))
    } catch (err) {
      // 캡쳐/공유 실패 원인을 프로덕션에서 추적할 수 있게 남긴다(사용자엔 에러 토스트).
      console.error('카드 저장 실패:', err)
      setToast((t) => ({ id: (t?.id ?? 0) + 1, variant: 'error' }))
    } finally {
      setBusy(false)
    }
  }

  const toastElement = toast ? (
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
  ) : null

  return { busy, handleDownload, toastElement }
}
