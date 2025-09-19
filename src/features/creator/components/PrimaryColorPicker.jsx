import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../../../components/Button'
import { IconArrowNarrowRight, IconChevronCompactRight, IconCopy, IconClick } from '../../../icons'
import './PrimaryColorPicker.css'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const componentToHex = (value) => {
  const hex = value.toString(16)
  return hex.length === 1 ? `0${hex}` : hex
}

const rgbToHex = ({ r, g, b }) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`

const hexToRgb = (hex) => {
  const trimmed = hex.replace('#', '')
  const bigint = parseInt(trimmed, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

const rgbToHsl = ({ r, g, b }) => {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
        break
      case gNorm:
        h = (bNorm - rNorm) / d + 2
        break
      case bNorm:
        h = (rNorm - gNorm) / d + 4
        break
      default:
        break
    }
    h /= 6
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

const hslToRgb = ({ h, s, l }) => {
  const hue = h / 360
  const saturation = s / 100
  const lightness = l / 100

  if (saturation === 0) {
    const value = Math.round(lightness * 255)
    return { r: value, g: value, b: value }
  }

  const hueToRgb = (p, q, t) => {
    let temp = t
    if (temp < 0) temp += 1
    if (temp > 1) temp -= 1
    if (temp < 1 / 6) return p + (q - p) * 6 * temp
    if (temp < 1 / 2) return q
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6
    return p
  }

  const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation
  const p = 2 * lightness - q

  const r = hueToRgb(p, q, hue + 1 / 3)
  const g = hueToRgb(p, q, hue)
  const b = hueToRgb(p, q, hue - 1 / 3)

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

const hslToHex = (hsl) => rgbToHex(hslToRgb(hsl))

const getPerceivedLightness = ({ r, g, b }) => {
  const [rn, gn, bn] = [r, g, b].map((value) => {
    const normalized = value / 255
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rn + 0.7152 * gn + 0.0722 * bn
}

const normalizeHex = (value) => {
  const trimmed = value.trim().replace('#', '')
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toLowerCase()}`
  }
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    // Expand 3-digit HEX to 6-digit
    const [r, g, b] = trimmed.split('')
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return null
}

const FALLBACK_HEX = '#ffffff'

const getLabelShadeHex = (hex) => {
  try {
    const rgb = hexToRgb(hex)
    const hsl = rgbToHsl(rgb)
    const lightness = getPerceivedLightness(rgb)
    const targetL = lightness > 0.55 ? 18 : 88
    const targetS = Math.min(85, Math.max(45, hsl.s))
    return hslToHex({ h: hsl.h, s: targetS, l: targetL })
  } catch (e) {
    return '#ffffff'
  }
}

export function PrimaryColorPicker({ defaultColor = '#7f5af0', onColorChange = () => {} }) {
  const [colorHex, setColorHex] = useState(defaultColor)
  const [hexInput, setHexInput] = useState(defaultColor)
  const [rgbInputs, setRgbInputs] = useState(['127', '90', '240'])
  const [hslInputs, setHslInputs] = useState(['257', '82', '65'])
  const [mode, setMode] = useState('HEX')

  const syncFromHex = useCallback((hex) => {
    setHexInput(hex)
    const validHex = normalizeHex(hex)
    const target = validHex ?? FALLBACK_HEX
    const rgb = hexToRgb(target)
      setRgbInputs([rgb.r.toString(), rgb.g.toString(), rgb.b.toString()])
    const hsl = rgbToHsl(rgb)
    setHslInputs([hsl.h.toString(), hsl.s.toString(), hsl.l.toString()])
    onColorChange(target)
  }, [onColorChange])

  useEffect(() => {
    syncFromHex(colorHex)
  }, [colorHex, syncFromHex])

  const updateColor = useCallback((hex) => {
    setColorHex(hex)
  }, [])

  const handleHexChange = (event) => {
    const raw = event.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
    const normalized = raw.length ? `#${raw}` : '#'
    setHexInput(normalized)
  }

  const handleHexBlur = () => {
    const normalized = normalizeHex(hexInput)
    if (normalized) {
      updateColor(normalized)
    } else {
      setHexInput(FALLBACK_HEX)
      updateColor(FALLBACK_HEX)
    }
  }

  const handleHexPaste = (event) => {
    const text = event.clipboardData?.getData('text') ?? ''
    const raw = text.trim().replace(/[^0-9a-fA-F]/g, '')
    if (raw.length === 0) return
    event.preventDefault()
    let candidate = raw.slice(0, 6)
    // If exactly 3 hex digits were pasted, expand to 6
    if (raw.length === 3) candidate = raw
    const withHash = `#${candidate}`
    setHexInput(withHash)
    const validHex = normalizeHex(withHash)
    if (validHex) updateColor(validHex)
  }

  const applyRgb = (values) => {
    const parsed = values.map((value) => {
      if (value === '') return null
      const numeric = Number(value)
      if (!Number.isFinite(numeric)) return null
      return clamp(Math.round(numeric), 0, 255)
    })
    if (parsed.every((value) => value !== null)) {
      updateColor(rgbToHex({ r: parsed[0], g: parsed[1], b: parsed[2] }))
    }
  }

  const handleRgbChange = (index, value) => {
    const next = [...rgbInputs]
    next[index] = value
    setRgbInputs(next)
    applyRgb(next)
  }

  const handleRgbBlur = (index) => {
    const next = [...rgbInputs]
    const numeric = Number(next[index])
    if (Number.isFinite(numeric)) {
      next[index] = clamp(Math.round(numeric), 0, 255).toString()
      setRgbInputs(next)
      applyRgb(next)
    } else {
      syncFromHex(colorHex)
    }
  }

  const applyHsl = (values) => {
    const parsed = values.map((value, idx) => {
      if (value === '') return null
      const numeric = Number(value)
      if (!Number.isFinite(numeric)) return null
      const limit = idx === 0 ? 360 : 100
      return clamp(Math.round(numeric), 0, limit)
    })
    if (parsed.every((value) => value !== null)) {
      updateColor(hslToHex({ h: parsed[0], s: parsed[1], l: parsed[2] }))
    }
  }

  const handleHslChange = (index, value) => {
    const next = [...hslInputs]
    next[index] = value
    setHslInputs(next)
    applyHsl(next)
  }

  const handleHslBlur = (index) => {
    const next = [...hslInputs]
    const numeric = Number(next[index])
    if (Number.isFinite(numeric)) {
      const limit = index === 0 ? 360 : 100
      next[index] = clamp(Math.round(numeric), 0, limit).toString()
      setHslInputs(next)
      applyHsl(next)
    } else {
      syncFromHex(colorHex)
    }
  }

  const baseHsl = useMemo(() => rgbToHsl(hexToRgb(colorHex)), [colorHex])
  const baseRgb = useMemo(() => hexToRgb(colorHex), [colorHex])

  const shadeItems = useMemo(() => {
    const { h, s, l } = baseHsl
    const baseLightness = clamp(l, 0, 100)
    const baseIndex = clamp(Math.round((100 - baseLightness) / 25), 0, 4)

    const lightenOffsets = [12, 24, 36, 48]
    const darkOffsets = [-12, -24, -36, -48]

    const colors = new Array(5)
    const lightnesses = new Array(5)
    colors[baseIndex] = hslToHex({ h, s, l: baseLightness })
    lightnesses[baseIndex] = baseLightness

    let lightenIndex = 0
    for (let i = baseIndex - 1; i >= 0; i -= 1) {
      const offset = lightenOffsets[lightenIndex] ?? lightenOffsets[lightenOffsets.length - 1]
      const nextLightness = clamp(baseLightness + offset, 0, 100)
      colors[i] = hslToHex({ h, s, l: nextLightness })
      lightnesses[i] = nextLightness
      lightenIndex += 1
    }

    let darkIndex = 0
    for (let i = baseIndex + 1; i < 5; i += 1) {
      const offset = darkOffsets[darkIndex] ?? darkOffsets[darkOffsets.length - 1]
      const nextLightness = clamp(baseLightness + offset, 0, 100)
      colors[i] = hslToHex({ h, s, l: nextLightness })
      lightnesses[i] = nextLightness
      darkIndex += 1
    }

    return { items: colors, lightnesses, activeIndex: baseIndex }
  }, [baseHsl])

  // Slider track backgrounds
  const rgbTrackGradient = (channelIndex) => {
    const [rStr, gStr, bStr] = rgbInputs
    const r = clamp(Number(rStr) || 0, 0, 255)
    const g = clamp(Number(gStr) || 0, 0, 255)
    const b = clamp(Number(bStr) || 0, 0, 255)
    if (channelIndex === 0) {
      return { background: `linear-gradient(to right, rgb(0, ${g}, ${b}), rgb(255, ${g}, ${b}))` }
    }
    if (channelIndex === 1) {
      return { background: `linear-gradient(to right, rgb(${r}, 0, ${b}), rgb(${r}, 255, ${b}))` }
    }
    return { background: `linear-gradient(to right, rgb(${r}, ${g}, 0), rgb(${r}, ${g}, 255))` }
  }

  const hueTrackGradient = 'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,40%), hsl(180,100%,40%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))'
  const satTrackGradient = useMemo(() => {
    const { h, l } = baseHsl
    return { background: `linear-gradient(to right, hsl(${h},0%,${l}%), hsl(${h},100%,${l}%))` }
  }, [baseHsl])
  const lightTrackGradient = useMemo(() => {
    const { h, s } = baseHsl
    return { background: `linear-gradient(to right, hsl(${h},100%,0%), hsl(${h},${s}%,50%), hsl(${h},100%,100%))` }
  }, [baseHsl])

  return (
    <div className="picker grid w-full gap-8 lg:grid-cols-[320px,1fr]">
      <div className="picker_left flex w-full flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
          <span className="text-sm uppercase tracking-[0.35em] text-neutral-400">State 1</span>
          <h2 className="font-display text-4xl font-semibold">Seed your palette</h2>
          <p className="text-base text-neutral-300">Pick your seed color. You’ll refine harmony next.</p>
        </div>

        <div className="dial-shades grid gap-4 lg:grid-cols-[minmax(260px,340px)_1fr]">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-neutral-200">Your Color:</div>
            <div className="dial-square relative">
              <div className="seed-wheel" style={{ '--seed': colorHex }}>
                <input
                  type="color"
                  value={colorHex}
                  onChange={(event) => updateColor(event.target.value)}
                  className="primary-color-picker_color"
                  aria-label="Pick primary color"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-neutral-200">Shades:</div>
            <div className="shades-box relative">
              <span
                className="shade-pointer"
                style={{ transform: `translateY(${shadeItems.activeIndex * 100}%)` }}
              >
                <IconChevronCompactRight stroke={1.5} color="#fff" />
              </span>
              <div className="shades-list">
              {shadeItems.items.map((tone, index) => (
                <button
                  key={index}
                  type="button"
                  className="shade-row"
                  style={{ background: tone }}
                  onClick={() => {
                    const { h, s } = baseHsl
                    const l = shadeItems.lightnesses[index]
                    updateColor(hslToHex({ h, s, l }))
                  }}
                >
                  <span className="shade-row_label" style={{ color: getLabelShadeHex(tone) }}>
                    {tone.toUpperCase()}
                  </span>
                  <span className="shade-row_actions">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Select this shade"
                      onClick={(e) => {
                        e.stopPropagation()
                        const { h, s } = baseHsl
                        const l = shadeItems.lightnesses[index]
                        updateColor(hslToHex({ h, s, l }))
                      }}
                    >
                      <IconClick stroke={1.5} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Copy HEX"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard?.writeText(tone)
                      }}
                    >
                      <IconCopy stroke={1.5} />
                    </button>
                  </span>
                </button>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>

      <div className="picker_right flex w-full flex-col gap-6">
        <div className="segmented" role="tablist" aria-label="Color input mode">
          {['HEX', 'RGB', 'HSL'].map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              className={['segmented_btn', mode === m ? 'is-active' : ''].join(' ')}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === 'HEX' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-neutral-200" htmlFor="hex-input">
              HEX value
            </label>
            <span className="text-xs text-neutral-500">Paste or type a HEX code.</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 primary-color-picker_hex-field">
              <span className="text-sm text-neutral-400">#</span>
              <input
                id="hex-input"
                className="w-full bg-transparent text-lg font-semibold uppercase tracking-[0.25em] text-white placeholder:text-neutral-500 focus:outline-none"
                value={hexInput.replace('#', '')}
                onChange={handleHexChange}
                onPaste={handleHexPaste}
                onBlur={handleHexBlur}
                spellCheck={false}
              />
              <button
                type="button"
                aria-label="Copy HEX"
                onClick={() => {
                  const valid = normalizeHex(hexInput) ?? FALLBACK_HEX
                  navigator.clipboard?.writeText(valid)
                }}
                className="rounded-md p-1 text-neutral-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>
        )}

        {mode === 'RGB' && (
          <fieldset className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
            <legend className="px-2 text-xs uppercase tracking-[0.4em] text-neutral-400">RGB</legend>
            {['R', 'G', 'B'].map((label, index) => (
              <label key={label} className="flex items-center gap-3 text-sm text-neutral-300">
                <span className="inline-flex w-6 items-center justify-center text-xs font-semibold text-white/70">
                  {label}
                </span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgbInputs[index]}
                  onChange={(event) => handleRgbChange(index, event.target.value)}
                  onBlur={() => handleRgbBlur(index)}
                  className="color-slider flex-grow"
                  style={rgbTrackGradient(index)}
                />
                <span className="w-10 text-right text-sm font-semibold">{rgbInputs[index]}</span>
              </label>
            ))}
          </fieldset>
        )}

        {mode === 'HSL' && (
          <fieldset className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
            <legend className="px-2 text-xs uppercase tracking-[0.4em] text-neutral-400">HSL</legend>
            {['H', 'S', 'L'].map((label, index) => (
              <label key={label} className="flex items-center gap-3 text-sm text-neutral-300">
                <span className="inline-flex w-6 items-center justify-center text-xs font-semibold text-white/70">
                  {label}
                </span>
                <input
                  type="range"
                  min="0"
                  max={index === 0 ? 360 : 100}
                  value={hslInputs[index]}
                  onChange={(event) => handleHslChange(index, event.target.value)}
                  onBlur={() => handleHslBlur(index)}
                  className="color-slider flex-grow"
                  style={index === 0 ? { background: hueTrackGradient } : index === 1 ? satTrackGradient : lightTrackGradient}
                />
                <span className="w-10 text-right text-sm font-semibold">{hslInputs[index]}</span>
                <span className="text-xs text-neutral-500">{index === 0 ? '°' : '%'}</span>
              </label>
            ))}
          </fieldset>
        )}

        <div className="picker_footer mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm text-neutral-300">
          <p className="text-sm text-neutral-400">Continue to Harmony selection</p>
          <Button
            prefix={null}
            className="button--icon"
            aria-label="Continue"
            onClick={() => {}}
            style={{
              '--button-glow': `radial-gradient(70% 70% at 50% 50%, ${colorHex} 0%, transparent 85%)`,
              '--button-glow-blur': '28px',
              '--button-glow-opacity': '0.9',
              '--button-glow-inset': '-14px',
              '--button-glow-animation': 'none'
            }}
          >
            <IconArrowNarrowRight stroke={1.5} />
          </Button>
        </div>
      </div>
    </div>
  )
}
