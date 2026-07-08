import { isLight } from '../../lib/color'
import grad1 from '../../assets/gradation_1.png'
import grad2 from '../../assets/gradation_2.png'
import grad3 from '../../assets/gradation_3.png'
import grad4 from '../../assets/gradation_4.png'
import grad5 from '../../assets/gradation_5.png'
import grad6 from '../../assets/gradation_6.png'
import grad7 from '../../assets/gradation_7.png'

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
  /**
   * 배경이 밝아 카드 글자를 어둡게 반전해야 하는지. 이미지(그라데이션)는 `url()` 문자열이라
   * `isLight()`로 휘도를 계산할 수 없으므로 여기서 명시한다. 컬러는 미지정 시 hex에서 자동 판별.
   */
  light?: boolean
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
  // 그라데이션 (assets/gradation_1~7.png) — url()/cover 단축으로 스와치·카드 모두 채움.
  // 7장 모두 밝은 파스텔이라 카드 글자를 어둡게 반전(light: true).
  { id: 'grad-1', kind: 'gradient', label: '그라데이션 1', value: `url(${grad1}) center / cover no-repeat`, light: true },
  { id: 'grad-2', kind: 'gradient', label: '그라데이션 2', value: `url(${grad2}) center / cover no-repeat`, light: true },
  { id: 'grad-3', kind: 'gradient', label: '그라데이션 3', value: `url(${grad3}) center / cover no-repeat`, light: true },
  { id: 'grad-4', kind: 'gradient', label: '그라데이션 4', value: `url(${grad4}) center / cover no-repeat`, light: true },
  { id: 'grad-5', kind: 'gradient', label: '그라데이션 5', value: `url(${grad5}) center / cover no-repeat`, light: true },
  { id: 'grad-6', kind: 'gradient', label: '그라데이션 6', value: `url(${grad6}) center / cover no-repeat`, light: true },
  { id: 'grad-7', kind: 'gradient', label: '그라데이션 7', value: `url(${grad7}) center / cover no-repeat`, light: true },
]

/** 렌더에 필요한 배경의 파생 정보 (스와치 id로부터 resolve). */
export interface ResolvedBackground {
  /** 카드에 적용할 CSS 배경 값. */
  value: string
  /** 밝은 배경이라 카드 글자를 어둡게 반전해야 하는지. */
  light: boolean
}

/**
 * 저장/전달되는 **정체성은 스와치 id** 하나이고, 렌더 시점에 이 함수로 `{ value, light }`를 파생한다.
 * (해시가 바뀌는 이미지 URL이나 value/light 병렬 상태를 들고 다니지 않기 위함 — 단일 진실은 카탈로그.)
 * id가 없거나 카탈로그에서 사라졌으면 첫 스와치로 폴백한다.
 */
export function resolveBackground(id: string): ResolvedBackground {
  const s = SWATCHES.find((sw) => sw.id === id) ?? SWATCHES[0]
  return { value: s.value, light: s.light ?? isLight(s.value) }
}
