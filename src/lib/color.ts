/** 색상 유틸. */

/**
 * 상대 휘도가 높은(밝은) 색인지 판별. 밝은 배경 위엔 어두운 오버레이(체크 등)를,
 * 어두운 배경 위엔 흰 오버레이를 얹기 위해 사용한다.
 * 6자리 hex(`#RRGGBB`)만 지원하며, 그 외(그라데이션/이미지 등)는 false로 간주한다.
 */
export function isLight(value: string): boolean {
  const v = value.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return false
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}
