import { useState } from 'react'
import Button from '../../components/Button/Button'
import './AnswerWrite.css'

/** 답변 최대 글자수 (Figma 카운터 "0/40"). */
const MAX = 40

interface AnswerWriteProps {
  /** 재노출할 오늘의 질문 텍스트. (상위에서 로딩 완료 후 전달) */
  question: string
  /** "색상 선택하기" → 배경/색상 선택(3번) 화면으로 */
  onSubmit?: (answer: string) => void
}

/** 화면 #2 답변 작성 (Figma: iPhone 17 - 5, node 4:236). */
function AnswerWrite({ question, onSubmit }: AnswerWriteProps) {
  const [value, setValue] = useState('')
  const isEmpty = value.trim().length === 0

  return (
    <div className="screen answer">
      <div className="answer__content">
        <div className="answer__upper">
          <div className="answer__question-row">
            <h1 className="answer__question">{`“${question}”`}</h1>
          </div>

          <div className="answer__field">
            <textarea
              className="answer__input"
              placeholder="답변을 입력해 주세요"
              maxLength={MAX}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <p className="answer__count">
              {value.length}/{MAX}
            </p>
          </div>
        </div>

        <div className="answer__footer">
          <Button disabled={isEmpty} onClick={() => onSubmit?.(value.trim())}>
            색상 선택하기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AnswerWrite
