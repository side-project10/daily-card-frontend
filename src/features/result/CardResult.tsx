import CardPreview from '../../components/CardPreview/CardPreview'
import Button from '../../components/Button/Button'
import BackButton from '../../components/BackButton/BackButton'
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
  /** 헤더 "뒤로가기" */
  onBack?: () => void
  /** "카드 다운하기" — 카드 영역을 이미지로 변환/다운로드 (추후 연동). */
  onDownload?: () => void
  /** "다른 사람이 남긴 답변 보기" — 타인 답변(5번)으로 이동. */
  onViewOthers?: () => void
}

// Figma iPhone 17-9가 보여주는 샘플 배경(보라 그라데이션).
// 실제 흐름에서는 3번(배경 선택)에서 고른 값이 주입되어 이 기본값을 덮는다.
const SAMPLE_BG = 'linear-gradient(155deg, #E9E1F4 0%, #9A6AC6 100%)'

/**
 * 화면 #4 내 카드 결과 (Figma: iPhone 17 - 9).
 * 헤더(뒤로가기) + 완성 카드 프리뷰 + [카드 다운하기 / 다른 사람이 남긴 답변 보기].
 * (UI 전용 — 다운로드·타인 답변 이동은 콜백으로 위임하며 저장 로직 없음)
 */
function CardResult({
  question = '무인도에 딱 한권의 책만 가져갈수 있다면 어떤 책인가요?',
  answer = '‘세이노의 가르침’.\n곱씹을수록 새로운 문장을 발견하게 되는 책.',
  date = '2026-12-05',
  background = SAMPLE_BG,
  onBack,
  onDownload,
  onViewOthers,
}: CardResultProps) {
  return (
    <div className="screen result">
      {/* 헤더: < 뒤로가기 (Figma Frame 48/46) */}
      <BackButton onClick={onBack} />

      <div className="result__content">
        {/* 완성 카드 — 배경 선택 결과 반영 (#3/#4/#5 공용 프리뷰) */}
        <CardPreview question={question} answer={answer} date={date} background={background} />

        {/* 액션: 다운로드(primary) / 타인 답변(secondary) — Figma Frame 3 */}
        <div className="result__actions">
          <Button onClick={onDownload}>카드 다운하기</Button>
          <Button variant="secondary" onClick={onViewOthers}>
            다른 사람이 남긴 답변 보기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CardResult
