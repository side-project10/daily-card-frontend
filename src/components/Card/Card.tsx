import type { ReactNode } from 'react'
import './Card.css'

interface CardProps {
  /** 카드 배경(컬러/그라디언트 CSS 값). 기본 핑크. (Figma #FFECEC) */
  background?: string
  /** 카드 그래픽 이미지 URL */
  image?: string
  imageAlt?: string
  /** 카드 내부 콘텐츠(질문/답변 등). 배경 위 오버레이로 렌더. */
  children?: ReactNode
  /** `.card`에 추가할 클래스 (테마/명암 모디파이어 등). */
  className?: string
}

/**
 * 정사각 카드 프리뷰 (Figma 29:1587 — 319x319, radius 20).
 * 배경 위에 이미지 또는 콘텐츠를 얹은 형태로, 배경 선택(3번)·결과(4번)에서도 재사용.
 */
function Card({ background = '#FFECEC', image, imageAlt = '', children, className }: CardProps) {
  return (
    <div className={`card${className ? ` ${className}` : ''}`} style={{ background }}>
      {image && <img className="card__graphic" src={image} alt={imageAlt} aria-hidden={!imageAlt} />}
      {children && <div className="card__content">{children}</div>}
    </div>
  )
}

export default Card
