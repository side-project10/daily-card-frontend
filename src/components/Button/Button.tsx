import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 디자인시스템 변형 (Figma Button variant). 기본 primary. */
  variant?: 'primary' | 'secondary'
}

/**
 * 공용 CTA 버튼. 모바일 풀폭 CTA를 기본으로 하며, 화면별로 재사용한다.
 * (Figma component set 5:1260 — Default_Primary / Secondary)
 */
function Button({ variant = 'primary', className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button--${variant}${className ? ` ${className}` : ''}`}
      {...rest}
    />
  )
}

export default Button
