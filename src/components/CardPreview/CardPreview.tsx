import Card from '../Card/Card'
import './CardPreview.css'

interface CardPreviewProps {
  /** 카드에 재노출할 질문. */
  question: string
  /** 카드에 표시할 답변. (줄바꿈 `\n` 반영) */
  answer: string
  /** 상단 날짜 라벨 (서버 기준 KST, Figma: 2026-12-05). */
  date: string
  /** 카드 배경 CSS 값(색/그라데이션/이미지). 미지정 시 Card 기본값. */
  background?: string
}

/**
 * 질문·답변을 얹은 카드 프리뷰 (Figma iPhone 17-19 카드).
 * 배경 선택(#3)·내 카드 결과(#4)·타인 답변(#5)에서 공통으로 재사용한다.
 * 컨테이너(정사각/라운드/배경)는 Card, 내부 콘텐츠 조합만 여기서 담당.
 */
function CardPreview({ question, answer, date, background }: CardPreviewProps) {
  return (
    <Card background={background}>
      <div className="card-preview__top">
        <span className="card-preview__badge">Q</span>
        <span className="card-preview__date">{date}</span>
        <p className="card-preview__question">{`“${question}”`}</p>
      </div>
      <div className="card-preview__bottom">
        <span className="card-preview__divider" aria-hidden="true" />
        <p className="card-preview__answer">{answer}</p>
      </div>
    </Card>
  )
}

export default CardPreview
