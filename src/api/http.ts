/**
 * 서버 통신 fetch 래퍼. 실 백엔드 연동 시 API 모듈에서 사용한다.
 *
 * 현재는 백엔드가 없어 `api/*`가 목(mock) 데이터를 반환하므로 직접 쓰이지
 * 않지만, 실 서버 전환 대비 골격으로 둔다. (엔드포인트 형태·에러 규약 고정)
 *
 * **인증은 쿠키 전용(cookie-only)이다.** 백엔드는 서명된 httpOnly 쿠키
 * `anon_id` 하나로 사용자를 식별하며, 클라이언트는 익명ID를 만들거나 헤더로
 * 보내지 않는다. 브라우저가 쿠키를 자동 전송/저장하도록 모든 요청에
 * `credentials: 'include'`를 준다.
 */

/**
 * API 베이스 경로. 언제나 same-origin `/api`로 고정한다(환경변수 불필요).
 * 이 `/api`는 프록시로 백엔드행 요청을 골라내는 표식이며, 실제 백엔드 도메인은
 * 프록시가 뒤에서 처리한다:
 *  - 로컬(dev): vite.config.ts 프록시가 /api → http://localhost:3000
 *  - 배포(prod): vercel.json rewrite가 /api → 백엔드 Vercel 도메인
 * 브라우저는 프론트 오리진하고만 통신(same-origin)하므로 anon_id 쿠키가
 * 퍼스트파티로 동작한다(CORS·서드파티 쿠키 문제 없음).
 */
const BASE_URL = '/api'

/** 서버 통신 실패를 표준화한 에러. status가 있으면 HTTP 상태 코드. */
export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      // 쿠키 전용 인증: anon_id 쿠키 자동 전송·저장을 위해 필수.
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
  } catch {
    throw new ApiError('네트워크 연결을 확인해주세요.')
  }
  if (!res.ok) {
    throw new ApiError(`요청에 실패했어요. (${res.status})`, res.status)
  }
  return res.json() as Promise<T>
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      // 쿠키 전용 인증: anon_id 쿠키 자동 전송·저장을 위해 필수.
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('네트워크 연결을 확인해주세요.')
  }
  if (!res.ok) {
    throw new ApiError(`요청에 실패했어요. (${res.status})`, res.status)
  }
  return res.json() as Promise<T>
}
