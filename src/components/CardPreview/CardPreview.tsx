import Card from '../Card/Card'
import { isLight } from '../../lib/color'
import './CardPreview.css'

interface CardPreviewProps {
  /** 카드에 재노출할 질문. */
  question: string
  /** 카드에 표시할 답변. (줄바꿈 `\n` 반영) */
  answer: string
  /** 상단 날짜 라벨 (서버 기준 KST, Figma: 2026-12-05). */
  date: string
  /** 카드 배경 CSS 값(색/그라데이션/이미지). 미지정 시 Figma 기본 검정. */
  background?: string
}

/** Figma 카드 기본 배경(검정). 톤 판별과 실제 배경이 항상 같은 값을 보도록 여기서 소유. */
const DEFAULT_BG = '#191919'

/**
 * 질문·답변을 얹은 카드 프리뷰 (Figma iPhone 17-19 카드).
 * 배경 선택(#3)·내 카드 결과(#4)·타인 답변(#5)에서 공통으로 재사용한다.
 * 컨테이너(정사각/라운드/배경)는 Card, 내부 콘텐츠 조합만 여기서 담당.
 */
function CardPreview({ question, answer, date, background = DEFAULT_BG }: CardPreviewProps) {
  // 배경이 밝으면(상대 휘도 높음) 흰 글자가 안 보이므로 어두운 글자로 반전한다.
  // (hex가 아닌 값 — 그라데이션/이미지 등 — 은 어두운 배경으로 간주해 흰 글자 유지)
  const onLight = isLight(background)

  return (
    <Card background={background} className={onLight ? 'card-preview--on-light' : undefined}>
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
