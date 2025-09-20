// Color utility helpers shared across Creator states
// Minimal, focused on HEX <-> RGB <-> HSL conversion and harmony generation

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const componentToHex = (value) => {
  const hex = value.toString(16)
  return hex.length === 1 ? `0${hex}` : hex
}

export const rgbToHex = ({ r, g, b }) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`

export const hexToRgb = (hex) => {
  const trimmed = hex.replace('#', '')
  const bigint = parseInt(trimmed, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

export const rgbToHsl = ({ r, g, b }) => {
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

export const hslToRgb = ({ h, s, l }) => {
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

export const hslToHex = (hsl) => rgbToHex(hslToRgb(hsl))

export const normalizeHex = (value) => {
  const trimmed = value.trim().replace('#', '')
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toLowerCase()}`
  }
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed.split('')
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return null
}

const wrapHue = (h) => ((h % 360) + 360) % 360

// Return a map of 6 harmonies, each with 2-3 hues (kept to 2 or 3 per spec)
export function computeHarmonyHueSets(baseHue) {
  const H = wrapHue(baseHue)
  return {
    Analogous: [wrapHue(H - 30), H, wrapHue(H + 30)],
    Complementary: [H, wrapHue(H + 180)],
    'Split Complementary': [H, wrapHue(H + 150), wrapHue(H - 150)],
    Triadic: [H, wrapHue(H + 120), wrapHue(H - 120)],
    Tetradic: [H, wrapHue(H + 90), wrapHue(H + 180)], // trimmed to 3 for preview
    Square: [H, wrapHue(H + 90), wrapHue(H - 90)] // 3 for preview (orthogonal feel)
  }
}

export function generateHarmonyPalettes(baseHex) {
  const hsl = rgbToHsl(hexToRgb(baseHex))
  const { h, s, l } = hsl
  const hueSets = computeHarmonyHueSets(h)
  return Object.entries(hueSets).map(([name, hues]) => {
    const swatches = hues.map((hh) => hslToHex({ h: hh, s, l }))
    return {
      key: name,
      name,
      swatches
    }
  })
}

