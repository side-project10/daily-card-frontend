import { useState } from 'react'
import CardPreview from '../../components/CardPreview/CardPreview'
import Button from '../../components/Button/Button'
import BackButton from '../../components/BackButton/BackButton'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { ApiError } from '../../api/http'
import { isLight } from '../../lib/color'
import { BG_TABS, SWATCHES, TAB_KIND } from './backgrounds'
import type { BgTab } from './backgrounds'
import './BackgroundSelect.css'

interface BackgroundSelectProps {
  /** 카드에 재노출할 오늘의 질문. (상위가 서버 값으로 채워 전달) */
  question: string
  /** 카드에 표시할 사용자의 답변. */
  answer: string
  /** 카드 상단 날짜 라벨 (서버 기준 KST dateKey). */
  date: string
  /** 헤더 "뒤로가기" */
  onBack?: () => void
  /**
   * "카드 만들기" — 선택한 배경의 스와치 id를 넘긴다. (value/light는 id에서 파생)
   * 저장(POST /answers)이 async라 Promise를 반환할 수 있으며, reject되면 로딩을 풀고 에러를 노출한다.
   */
  onCreate?: (backgroundId: string) => void | Promise<void>
}

/**
 * 화면 #3 배경 선택 (Figma: iPhone 17 - 19).
 * 카드 프리뷰 + 컬러/그라데이션/이미지 탭 + 배경 스와치 + "카드 만들기".
 * 질문·답변·날짜는 상위(App)가 서버 값으로 채워 전달한다(필수 prop). 배경 선택/탭 전환은
 * 로컬 상태로만 반영하고, "카드 만들기"는 저장을 onCreate에 위임한 뒤 로딩/실패 안내만 담당한다.
 */
function BackgroundSelect({
  question,
  answer,
  date,
  onBack,
  onCreate,
}: BackgroundSelectProps) {
  const [tab, setTab] = useState<BgTab>('컬러')
  const [selected, setSelected] = useState(SWATCHES[0].id)
  // "카드 만들기" 후 저장/생성되는 동안 로딩 모달(iPhone 17-20)을 덮는다.
  const [creating, setCreating] = useState(false)
  // 저장 실패(금칙어 400·네트워크 등) 시 CTA 위에 노출할 안내. 성공/재시도 시 초기화한다.
  const [error, setError] = useState<string | null>(null)

  const selectedSwatch = SWATCHES.find((s) => s.id === selected) ?? SWATCHES[0]
  const selectedBg = selectedSwatch.value
  // 배경이 밝은지: 스와치가 명시(light)하면 그 값, 아니면 hex에서 자동 판별. → 카드 글자 반전
  const selectedLight = selectedSwatch.light ?? isLight(selectedSwatch.value)
  // 활성 탭에 해당하는 스와치만 노출. (그라데이션/이미지는 데이터 추가 시 자동 노출)
  const visible = SWATCHES.filter((s) => s.kind === TAB_KIND[tab])

  // "카드 만들기": 저장(onCreate) 동안 로딩 모달을 덮는다. 성공하면 상위(App)가 결과(#4)로
  // 전환해 이 화면이 언마운트되고, 실패하면 로딩을 풀고 원인별 안내를 노출한다.
  // (최소 로딩 노출 시간은 전환을 소유한 App이 저장과 병렬로 gate한다. 409 중복도 App이 완료 카드로 흡수.)
  const handleCreate = async () => {
    if (creating) return
    setError(null)
    setCreating(true)
    try {
      await onCreate?.(selected)
    } catch (err) {
      setCreating(false)
      setError(
        err instanceof ApiError && err.status === 400
          ? '사용할 수 없는 표현이 있어요. 답변을 다시 확인해주세요.'
          : '저장에 실패했어요. 잠시 후 다시 시도해주세요.',
      )
    }
  }

  return (
    <div className="screen bg">
      {/* 헤더: < 뒤로가기 */}
      <BackButton onClick={onBack} />

      <div className="bg__content">
        {/* 카드 프리뷰 — 선택한 배경 즉시 반영 */}
        <CardPreview question={question} answer={answer} date={date} background={selectedBg} onLight={selectedLight} />

        <div className="bg__section">
          <p className="bg__helper">
            <svg className="bg__helper-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1" />
              <path d="M7 6v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="7" cy="4" r="0.7" fill="currentColor" />
            </svg>
            아래 중 내 문구와 가장 어울리는 배경을 하나 골라주세요
          </p>

          <div className="bg__controls">
            <div className="bg__picker">
              {/* 탭: 컬러 / 그라데이션 / 이미지 */}
              <div className="bg__tabs" role="tablist">
                {BG_TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={tab === t}
                    className={`bg__tab${tab === t ? ' is-active' : ''}`}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* 스와치 그리드 (활성 탭 기준) */}
              {visible.length > 0 ? (
                <div className="bg__swatches">
                  {visible.map((s) => {
                    const light = s.light ?? isLight(s.value)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        aria-label={s.label}
                        aria-pressed={selected === s.id}
                        className={[
                          'bg__swatch',
                          selected === s.id && 'is-selected',
                          s.border && 'is-bordered',
                          light && 'is-light',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={{ background: s.value }}
                        onClick={() => setSelected(s.id)}
                      >
                        {selected === s.id && (
                          <svg className="bg__check" width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                            <path d="M1 5.2 4.3 8.5 11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="bg__empty">아직 준비 중인 배경이에요</p>
              )}
            </div>

            <div className="bg__cta">
              {error && (
                <p className="bg__error" role="alert">
                  {error}
                </p>
              )}
              <Button onClick={() => void handleCreate()}>카드 만들기</Button>
            </div>
          </div>
        </div>
      </div>

      {creating && <LoadingModal />}
    </div>
  )
}

export default BackgroundSelect
