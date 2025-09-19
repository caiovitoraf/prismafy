import './GlassPanel.css'

export function GlassPanel({ as: Component = 'div', variant = 'default', className = '', children, style, ...props }) {
  const variantClass = variant !== 'default' ? `glass-panel--${variant}` : ''
  const combinedClassName = ['glass-panel', variantClass, className].filter(Boolean).join(' ')

  return (
    <Component className={combinedClassName} style={style} {...props}>
      {children}
    </Component>
  )
}
