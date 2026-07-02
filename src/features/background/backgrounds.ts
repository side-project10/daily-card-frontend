/** 배경 선택(3번) 탭 (Figma: 컬러 / 그라데이션 / 패턴). */
export const BG_TABS = ['컬러', '그라데이션', '패턴'] as const
export type BgTab = (typeof BG_TABS)[number]

/** 배경 종류. 탭과 1:1로 매핑된다. */
export type BgKind = 'color' | 'gradient' | 'pattern'

/** 탭 → 배경 종류 매핑. */
export const TAB_KIND: Record<BgTab, BgKind> = {
  컬러: 'color',
  그라데이션: 'gradient',
  패턴: 'pattern',
}

/** 배경 스와치 한 칸. */
export interface Swatch {
  id: string
  kind: BgKind
  /** 스크린리더용 한글 라벨. */
  label: string
  /** 카드 배경에 적용할 CSS 값(색/그라데이션/이미지 url 등). */
  value: string
  /** 흰 배경과 구분이 어려운 밝은 색은 테두리를 그린다. */
  border?: boolean
}

/**
 * 배경 스와치 목록 — Figma iPhone 17-19.
 * 현재는 "컬러"만(2행 × 6열, 각 44×44 radius 4). 그라데이션/패턴은 데이터만 추가하면
 * 해당 탭에 자동 노출된다. 색상 hex는 Figma에서 직접 확인한 값.
 */
export const SWATCHES: Swatch[] = [
  // 1행 (진한 색)
  { id: 'black', kind: 'color', label: '검정', value: '#000000' },
  { id: 'gray', kind: 'color', label: '회색', value: '#636363' },
  { id: 'navy', kind: 'color', label: '네이비', value: '#1F274C' },
  { id: 'maroon', kind: 'color', label: '마룬', value: '#702222' },
  { id: 'teal', kind: 'color', label: '청록', value: '#0D4F47' },
  { id: 'brown', kind: 'color', label: '브라운', value: '#433832' },
  // 2행 (파스텔)
  { id: 'white', kind: 'color', label: '흰색', value: '#FFFFFF', border: true },
  { id: 'mint', kind: 'color', label: '민트', value: '#C5ECE8' },
  { id: 'lilac', kind: 'color', label: '라일락', value: '#E1BEE7' },
  { id: 'yellow', kind: 'color', label: '옐로', value: '#FFF9C4' },
  { id: 'pink', kind: 'color', label: '핑크', value: '#FFCEE3' },
  { id: 'skyblue', kind: 'color', label: '하늘', value: '#B3E5FC' },
]
