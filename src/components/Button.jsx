import { forwardRef } from 'react'
import './Button.css'

export const Button = forwardRef(function Button(
  {
    children,
    className = '',
    label = 'Add to cart',
    prefix = '+',
    type = 'button',
    ...props
  },
  ref
) {
  const content = children ?? label
  const displayText = prefix ? `${prefix} ${content}` : content

  return (
    <button
      ref={ref}
      type={type}
      className={['button', className].filter(Boolean).join(' ')}
      {...props}
    >
      <span className="cap">
        <span className="text">{displayText}</span>
      </span>
    </button>
  )
})
