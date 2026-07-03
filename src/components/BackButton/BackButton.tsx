import './BackButton.css'

interface BackButtonProps {
  /** 클릭 시 이전 화면으로 이동. */
  onClick?: () => void
  /** 버튼 라벨. 기본 "뒤로가기". */
  label?: string
  /** 위치/여백 조정용 추가 클래스 (화면별 오버라이드). */
  className?: string
}

/**
 * 공용 화면 헤더의 "< 뒤로가기" 버튼.
 * 위저드 화면(배경 선택 #3·카드 결과 #4 등) 상단 좌측에서 공통 사용한다.
 * (Figma: chevron-left + 뒤로가기, Pretendard 500 / 14 / #B0B0B0, gap 8)
 */
function BackButton({ onClick, label = '뒤로가기', className }: BackButtonProps) {
  return (
    <button
      type="button"
      className={`back-button${className ? ` ${className}` : ''}`}
      onClick={onClick}
    >
      <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
        <path
          d="M7 1 1 7l6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{label}</span>
    </button>
  )
}

export default BackButton
