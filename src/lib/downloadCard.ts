import { toBlob } from 'html-to-image'

/** 카드 저장 결과. `cancelled`는 사용자가 공유 시트를 닫은 경우(성공/실패 아님). */
export type SaveResult = 'shared' | 'downloaded' | 'cancelled'

/** blob을 `<a download>`로 저장한다(데스크톱/공유 미지원 폴백). */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // 일부 브라우저는 click 후 비동기로 다운로드를 시작하므로, 같은 tick에 revoke하면
  // 시작 전에 URL이 무효화돼 다운로드가 취소될 수 있다. 다음 tick으로 미뤄 방지한다.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/**
 * 카드 노드를 PNG로 캡쳐해 저장한다.
 * - 모바일 등 파일 공유 가능 환경: Web Share 공유 시트(사진 저장/카톡 공유 등).
 * - 그 외(데스크톱): `<a download>` 다운로드.
 *
 * html-to-image는 노드를 SVG foreignObject로 직렬화해 브라우저가 실제 렌더하므로
 * gradient·`url()` 배경·aspect-ratio가 그대로 재현되고, 노드 offsetWidth 기준으로 클론해
 * 조상의 `transform:scale`(레터박스) 영향 없이 원본 해상도로 캡쳐된다.
 * 배경 이미지는 로컬 에셋(same-origin), 폰트(Pretendard)는 CORS 허용 CDN이라 인라인이 가능하다.
 */
export async function captureAndSaveCard(node: HTMLElement, filename: string): Promise<SaveResult> {
  const blob = await toBlob(node, { pixelRatio: 3, cacheBust: true })
  if (!blob) throw new Error('카드 이미지를 생성하지 못했어요.')

  const file = new File([blob], filename, { type: 'image/png' })

  // 파일 공유를 지원하면(모바일 대부분) 네이티브 공유 시트를 시도.
  // 공유 가능한 환경에서는 `<a download>` 폴백을 신뢰할 수 없다(특히 iOS Safari는 download 속성을
  // 무시해 저장이 안 되면서도 성공처럼 보인다). 그래서 공유 실패를 다운로드로 조용히 대체하지 않고:
  //  - 사용자가 시트를 닫음(AbortError) → 취소(토스트 없음)
  //  - 그 외(NotAllowedError 등 제스처 활성화 만료) → 되던져 호출부가 에러로 안내(새 제스처로 재시도 가능)
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return 'shared'
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
      throw err
    }
  }

  // 공유 미지원(데스크톱 등) → 다운로드.
  downloadBlob(blob, filename)
  return 'downloaded'
}
