import { useState } from 'react'
import Button from '../../components/Button/Button'
import Logo from '../../components/Logo/Logo'
import { SLIDES } from './slides'
import './Onboarding.css'

interface OnboardingProps {
  /** 마지막 슬라이드에서 "다음"을 누르면 호출된다. (아직 미연결) */
  onComplete?: () => void
}

function Onboarding({ onComplete }: OnboardingProps) {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete?.()
      return
    }
    setIndex((i) => i + 1)
  }

  return (
    <div className="screen onboarding">
      {/* 히어로 그래픽 — 402x874 프레임 비율로 절대 배치 */}
      {slide.heroes.map((hero, i) => (
        <img
          key={`${slide.id}-${i}`}
          className="onboarding__hero"
          src={hero.src}
          alt={hero.alt}
          aria-hidden="true"
          style={{
            width: `${hero.width}%`,
            left: `${hero.left}%`,
            top: `${hero.top}%`,
          }}
        />
      ))}

      <div className="onboarding__content" style={{ gap: `${slide.contentGap}px` }}>
        <Logo />
        <h1 className="onboarding__title">{slide.title}</h1>
        {slide.subtitle && <p className="onboarding__subtitle">{slide.subtitle}</p>}
      </div>

      <div className="onboarding__footer">
        <div className="onboarding__dots">
          {SLIDES.map((s, i) => (
            <span
              key={s.id}
              className={`onboarding__dot${i === index ? ' is-active' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
        <Button onClick={handleNext}>다음</Button>
      </div>
    </div>
  )
}

export default Onboarding
