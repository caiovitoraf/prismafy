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

// --- Palette generation engine for State 3 ---

const hueDistance = (a, b) => {
  const diff = Math.abs(((a % 360) + 360) % 360 - ((b % 360) + 360) % 360)
  return Math.min(diff, 360 - diff)
}

const pickNearestHue = (candidates, target, used = new Set()) => {
  if (!candidates.length) return target
  let best = candidates[0]
  let bestDist = Infinity
  for (const h of candidates) {
    if (used.has(h)) continue
    const d = hueDistance(h, target)
    if (d < bestDist) {
      bestDist = d
      best = h
    }
  }
  return best
}

export function assignSupportRoles(baseHex, harmony) {
  const base = rgbToHsl(hexToRgb(baseHex))
  const baseHue = base.h
  const baseSat = base.s
  const baseLight = base.l

  // Extract candidate hues from selected harmony (fallback to base if missing)
  const harmonyHues = Array.isArray(harmony?.swatches)
    ? harmony.swatches.map((hex) => rgbToHsl(hexToRgb(hex)).h)
    : []
  const candidateHues = Array.from(new Set([baseHue, ...harmonyHues])).map((h) => ((h % 360) + 360) % 360)

  // Target hues per role
  const TARGETS = {
    success: 130,
    warning: 40,
    error: 0,
    info: 200
  }

  const used = new Set([baseHue]) // reserve base for primary
  const roles = { primary: { h: baseHue, s: baseSat, l: baseLight } }

  for (const role of Object.keys(TARGETS)) {
    let chosenHue = pickNearestHue(candidateHues, TARGETS[role], used)
    // If the chosen hue is already used (or candidate list was empty), fallback to target directly
    if (used.has(chosenHue) && hueDistance(chosenHue, TARGETS[role]) > 0) {
      chosenHue = TARGETS[role]
    }
    used.add(chosenHue)
    roles[role] = { h: chosenHue, s: baseSat, l: baseLight }
  }

  return roles
}

// Smooth 9-step scale with dynamic lightness curve around the base (500)
export function generate9StepScale({ h, s, l }) {
  const clamp01 = (v) => Math.min(1, Math.max(0, v))
  const toPct = (v) => Math.round(Math.min(100, Math.max(0, v)))

  // Targets for extremes; tuned for good contrast in dark UIs
  const L_LIGHT = 96
  const L_DARK = 26

  const lighten = (t) => l + (L_LIGHT - l) * t // move toward light
  const darken = (t) => l - (l - L_DARK) * t // move toward dark

  const lightnesses = [
    toPct(lighten(0.92)), // 100
    toPct(lighten(0.75)), // 200
    toPct(lighten(0.55)), // 300
    toPct(lighten(0.30)), // 400
    toPct(l),             // 500
    toPct(darken(0.22)),  // 600
    toPct(darken(0.45)),  // 700
    toPct(darken(0.68)),  // 800
    toPct(darken(0.84)),  // 900
  ]

  const sat = s / 100
  const satAdjust = (idx) => {
    // Reduce saturation near lights, increase slightly in darks
    const adjustments = [0.15, 0.3, 0.45, 0.65, 1.0, 1.05, 1.12, 1.18, 1.22]
    const base = sat * adjustments[idx]
    return toPct(clamp(base * 100, 2, 98))
  }

  return lightnesses.map((L, idx) => hslToHex({ h, s: satAdjust(idx), l: L }))
}

// Neutral scale subtly tinted with primary hue
export function generateNeutralScale(primaryHue) {
  const base = { h: ((primaryHue % 360) + 360) % 360, s: 8, l: 50 }
  return generate9StepScale(base)
}

// Contrast utilities (WCAG 2.1)
const relativeLuminance = ({ r, g, b }) => {
  const toLin = (u) => {
    const s = u / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const rl = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b)
  return rl
}

export function contrastRatio(hex1, hex2) {
  const L1 = relativeLuminance(hexToRgb(hex1))
  const L2 = relativeLuminance(hexToRgb(hex2))
  const light = Math.max(L1, L2)
  const dark = Math.min(L1, L2)
  const ratio = (light + 0.05) / (dark + 0.05)
  return Math.round(ratio * 100) / 100
}

export function wcagRating(ratio, { large = false } = {}) {
  if (ratio >= 7) return 'AAA'
  if (ratio >= (large ? 3 : 4.5)) return 'AA'
  return 'Fail'
}

// Build a full structured palette ready for export
export function buildFullPalette(baseHex, harmony) {
  const roles = assignSupportRoles(baseHex, harmony)
  const primaryHue = roles.primary.h

  const scales = {
    primary: generate9StepScale(roles.primary),
    success: generate9StepScale(roles.success),
    warning: generate9StepScale(roles.warning),
    error: generate9StepScale(roles.error),
    info: generate9StepScale(roles.info),
    neutral: generateNeutralScale(primaryHue)
  }

  return {
    roles: {
      primary: { base: hslToHex(roles.primary), scale: scales.primary },
      success: { base: hslToHex(roles.success), scale: scales.success },
      warning: { base: hslToHex(roles.warning), scale: scales.warning },
      error: { base: hslToHex(roles.error), scale: scales.error },
      info: { base: hslToHex(roles.info), scale: scales.info },
      neutral: { base: hslToHex({ h: primaryHue, s: 8, l: 50 }), scale: scales.neutral }
    },
    order: ['primary', 'success', 'warning', 'error', 'info', 'neutral']
  }
}

export function paletteToCssVars(palette) {
  const lines = []
  for (const role of palette.order) {
    const scale = palette.roles[role].scale
    const names = ['100','200','300','400','500','600','700','800','900']
    names.forEach((step, i) => {
      lines.push(`  --${role}-${step}: ${scale[i]};`)
    })
  }
  return `:root{\n${lines.join('\n')}\n}`
}

export function paletteToJson(palette) {
  const obj = {}
  for (const role of palette.order) {
    const names = ['100','200','300','400','500','600','700','800','900']
    const scale = palette.roles[role].scale
    obj[role] = Object.fromEntries(names.map((n, i) => [n, scale[i]]))
  }
  return JSON.stringify(obj, null, 2)
}
