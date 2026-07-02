import './LoadingModal.css'

interface LoadingModalProps {
  /** 로딩 타이틀. (Figma: "카드를 만들고 있어요") */
  title?: string
  /** 보조 안내 문구. (Figma: "잠시만 기다려주세요") */
  description?: string
}

/**
 * 카드 생성 로딩 모달 (Figma: iPhone 17 - 20).
 * 배경 선택(#3)에서 "카드 만들기"를 누른 뒤, 답변+배경이 저장/생성되는 동안
 * 화면 위에 덮이는 딤 오버레이 + 중앙 카드(스피너 + 안내 문구). UI 전용.
 */
function LoadingModal({
  title = '카드를 만들고 있어요',
  description = '잠시만 기다려주세요',
}: LoadingModalProps) {
  return (
    <div className="loading" role="alert" aria-busy="true" aria-live="assertive">
      <div className="loading__card">
        <span className="loading__spinner" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle className="loading__track" cx="16" cy="16" r="14.5" strokeWidth="3" />
            <circle
              className="loading__progress"
              cx="16"
              cy="16"
              r="14.5"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div className="loading__text">
          <p className="loading__title">{title}</p>
          <p className="loading__desc">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingModal
