import { useEffect, useRef, useState } from 'react'
import CardPreview from '../../components/CardPreview/CardPreview'
import Button from '../../components/Button/Button'
import BackButton from '../../components/BackButton/BackButton'
import LoadingModal from '../../components/LoadingModal/LoadingModal'
import { isLight } from '../../lib/color'
import { BG_TABS, SWATCHES, TAB_KIND } from './backgrounds'
import type { BgTab } from './backgrounds'
import './BackgroundSelect.css'

interface BackgroundSelectProps {
  /** 카드에 재노출할 오늘의 질문. */
  question?: string
  /** 카드에 표시할 사용자의 답변. */
  answer?: string
  /** 카드 상단 날짜 라벨 (Figma: 2026-12-05). */
  date?: string
  /** 헤더 "뒤로가기" */
  onBack?: () => void
  /** "카드 만들기" — 선택한 배경(CSS 값)과 함께 결과(4번)로. */
  onCreate?: (background: string) => void
}

/**
 * 화면 #3 배경 선택 (Figma: iPhone 17 - 19).
 * 카드 프리뷰 + 컬러/그라데이션/패턴 탭 + 배경 스와치 + "카드 만들기".
 * (UI 전용 — 배경 선택/탭 전환은 로컬 상태로만 반영, 저장 로직 없음)
 */
function BackgroundSelect({
  question = '무인도에 딱 한권의 책만 가져갈수 있다면 어떤 책인가요?',
  answer = '‘세이노의 가르침’.\n곱씹을수록 새로운 문장을 발견하게 되는 책.',
  date = '2026-12-05',
  onBack,
  onCreate,
}: BackgroundSelectProps) {
  const [tab, setTab] = useState<BgTab>('컬러')
  const [selected, setSelected] = useState(SWATCHES[0].id)
  // "카드 만들기" 후 저장/생성되는 동안 로딩 모달(iPhone 17-20)을 덮는다.
  const [creating, setCreating] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  const selectedBg = SWATCHES.find((s) => s.id === selected)?.value ?? SWATCHES[0].value
  // 활성 탭에 해당하는 스와치만 노출. (그라데이션/패턴은 데이터 추가 시 자동 노출)
  const visible = SWATCHES.filter((s) => s.kind === TAB_KIND[tab])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  // UI 전용: 로딩 모달을 잠깐 보여준 뒤 결과(4번)로 이동. (실제 저장 로직은 추후 연동)
  const handleCreate = () => {
    if (creating) return
    setCreating(true)
    timerRef.current = window.setTimeout(() => onCreate?.(selectedBg), 1200)
  }

  return (
    <div className="screen bg">
      {/* 헤더: < 뒤로가기 */}
      <BackButton onClick={onBack} />

      <div className="bg__content">
        {/* 카드 프리뷰 — 선택한 배경 즉시 반영 */}
        <CardPreview question={question} answer={answer} date={date} background={selectedBg} />

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
              {/* 탭: 컬러 / 그라데이션 / 패턴 */}
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
                    const light = s.kind === 'color' && isLight(s.value)
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
              <Button onClick={handleCreate}>카드 만들기</Button>
            </div>
          </div>
        </div>
      </div>

      {creating && <LoadingModal />}
    </div>
  )
}

export default BackgroundSelect
