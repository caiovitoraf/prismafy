import { GlassPanel } from '../../components/GlassPanel'
import { useMemo, useState } from 'react'
import { PrimaryColorPicker } from './components/PrimaryColorPicker'
import { HarmonySelection } from './components/HarmonySelection'
import { Button } from '../../components/Button'
import { IconArrowNarrowLeft, IconCopy, IconExternalLink, IconDownload } from '../../icons'
import { buildFullPalette, contrastRatio, paletteToCssVars, paletteToJson, wcagRating } from './utils/color'

function PaletteDisplay({ baseHex = '#7f5af0', harmony = null, onBack = () => {}, onVisualize = () => {} }) {
  const palette = useMemo(() => buildFullPalette(baseHex, harmony), [baseHex, harmony])
  const neutralScale = palette.roles.neutral.scale
  const lightBg = neutralScale[0] // 100
  const darkBg = neutralScale[8] // 900

  const [showExport, setShowExport] = useState(false)

  const copy = async (text) => {
    try { await navigator.clipboard?.writeText(text) } catch { /* noop */ }
  }

  const Row = ({ roleKey, label }) => {
    const scale = palette.roles[roleKey].scale
    const names = ['100','200','300','400','500','600','700','800','900']
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-200">{label}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 xl:grid-cols-9">
          {scale.map((hex, idx) => {
            const rLight = contrastRatio(hex, lightBg)
            const rDark = contrastRatio(hex, darkBg)
            const badgeLight = wcagRating(rLight)
            const badgeDark = wcagRating(rDark)
            return (
              <button
                key={`${roleKey}-${idx}`}
                type="button"
                onClick={() => copy(hex)}
                title={`Copy ${hex.toUpperCase()}`}
                className="group relative h-16 rounded-xl border border-white/10 p-2 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),_0_10px_18px_rgba(0,0,0,0.35)] transition-transform hover:scale-[1.02]"
                style={{ background: hex }}
              >
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/20" />
                <div className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/90">
                  {names[idx]}
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1">
                  <span className="rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white/90">
                    {hex.toUpperCase()}
                  </span>
                  <span className="flex gap-1">
                    <span className={`rounded px-1 text-[9px] font-bold ${badgeLight === 'Fail' ? 'bg-black/40 text-white/70' : badgeLight === 'AAA' ? 'bg-emerald-500 text-black' : 'bg-emerald-300 text-black'}`}>{badgeLight}</span>
                    <span className={`rounded px-1 text-[9px] font-bold ${badgeDark === 'Fail' ? 'bg-black/40 text-white/70' : badgeDark === 'AAA' ? 'bg-amber-400 text-black' : 'bg-amber-200 text-black'}`}>{badgeDark}</span>
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const handleVisualize = () => {
    const payload = paletteToJson(palette)
    try { localStorage.setItem('prismafy.palette', payload) } catch { /* noop */ }
    onVisualize()
  }

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[320px,1fr]">
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
          <span className="text-sm uppercase tracking-[0.35em] text-neutral-400">State 3</span>
          <h2 className="font-display text-4xl font-semibold">Palette preview</h2>
          <p className="text-base text-neutral-300">Copy, export, or visualize your full system.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 text-sm font-semibold text-neutral-300">Selection</div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 text-sm text-neutral-300">
              <span className="h-5 w-5 rounded-full border border-white/10" style={{ background: baseHex }} />
              Seed: <strong className="text-white">{baseHex.toUpperCase()}</strong>
            </span>
            {harmony && (
              <span className="inline-flex items-center gap-2 text-sm text-neutral-300">
                Harmony: <strong className="text-white">{harmony.name}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <Row roleKey="primary" label="Primary" />
        <Row roleKey="success" label="Success" />
        <Row roleKey="warning" label="Warning" />
        <Row roleKey="error" label="Error" />
        <Row roleKey="info" label="Info" />
        <Row roleKey="neutral" label="Neutral" />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm text-neutral-300">
          <Button
            prefix={null}
            className="button--icon"
            aria-label="Back"
            onClick={onBack}
          >
            <IconArrowNarrowLeft stroke={1.6} />
          </Button>

          <div className="ml-auto flex items-center gap-3">
            <Button
              prefix={null}
              className="button--icon"
              aria-label="Export palette"
              onClick={() => setShowExport(true)}
              title="Export palette"
            >
              <IconDownload stroke={1.6} />
            </Button>
            <Button
              prefix={null}
              className="button--icon"
              aria-label="Visualize"
              onClick={handleVisualize}
              title="Visualize this palette"
            >
              <IconExternalLink stroke={1.5} />
            </Button>
          </div>
        </div>
      </div>

      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-[rgba(18,18,18,0.9)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Export palette</h3>
              <button
                type="button"
                className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-300 hover:text-white"
                onClick={() => setShowExport(false)}
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-300">CSS variables</span>
                  <button
                    type="button"
                    className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white"
                    onClick={() => copy(paletteToCssVars(palette))}
                  >
                    Copy
                  </button>
                </div>
                <pre className="max-h-[360px] overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-[12px] leading-relaxed text-neutral-200">
{paletteToCssVars(palette)}
                </pre>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-300">JSON</span>
                  <button
                    type="button"
                    className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white"
                    onClick={() => copy(paletteToJson(palette))}
                  >
                    Copy
                  </button>
                </div>
                <pre className="max-h-[360px] overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-[12px] leading-relaxed text-neutral-200">
{paletteToJson(palette)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function CreatorPage({ onVisualize = () => {} }) {
  const [accentColor, setAccentColor] = useState('#7f5af0')
  const [step, setStep] = useState(1) // 1: seed, 2: harmony, 3: palette
  const [selectedHarmony, setSelectedHarmony] = useState(null)

  return (
    <section className="flex w-full flex-1 flex-col items-center gap-16 bg-black px-6 py-16 text-white">
      <GlassPanel className="relative mx-auto w-full max-w-6xl rounded-[28px] p-6" style={{ '--glass-radius': '28px' }}>
        <span
          className="pointer-events-none absolute inset-4 -z-10 rounded-[30px] opacity-70 blur-[55px] transition duration-500"
          style={{ background: accentColor }}
        />
        <div className="rounded-[22px] border border-white/10 bg-[rgba(10,10,10,0.88)] p-10">
          {step === 1 && (
            <PrimaryColorPicker
              defaultColor={accentColor}
              onColorChange={(hex) => setAccentColor(hex)}
              onContinue={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <HarmonySelection
              baseHex={accentColor}
              onBack={() => setStep(1)}
              onNext={(opt) => {
                setSelectedHarmony(opt)
                setStep(3)
              }}
            />
          )}
          {step === 3 && (
            <PaletteDisplay
              baseHex={accentColor}
              harmony={selectedHarmony}
              onBack={() => setStep(2)}
              onVisualize={onVisualize}
            />
          )}
        </div>
      </GlassPanel>
    </section>
  )
}
