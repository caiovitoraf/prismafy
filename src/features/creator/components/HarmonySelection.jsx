import { useMemo, useState } from 'react'
import { Button } from '../../../components/Button'
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconCheck } from '../../../icons'
import { generateHarmonyPalettes } from '../utils/color'

export function HarmonySelection({
  baseHex = '#7f5af0',
  onBack = () => {},
  onNext = () => {},
}) {
  const options = useMemo(() => generateHarmonyPalettes(baseHex), [baseHex])
  const [selected, setSelected] = useState(options[0]?.key ?? null)

  const selectedOption = useMemo(
    () => options.find((o) => o.key === selected) || null,
    [options, selected]
  )

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[320px,1fr]">
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
          <span className="text-sm uppercase tracking-[0.35em] text-neutral-400">State 2</span>
          <h2 className="font-display text-4xl font-semibold">Pick a harmony</h2>
          <p className="text-base text-neutral-300">We built six combinations from your seed color.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelected(opt.key)}
                className={[
                  'group relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition',
                  'bg-[rgba(18,18,18,0.6)] hover:bg-[rgba(24,24,24,0.7)]',
                  selected === opt.key ? 'border-white/40' : 'border-white/12 hover:border-white/24',
                ].join(' ')}
                style={{
                  boxShadow: selected === opt.key ? '0 16px 32px rgba(0,0,0,0.45)' : '0 10px 22px rgba(0,0,0,0.35)'
                }}
                aria-pressed={selected === opt.key}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-neutral-200">{opt.name}</div>
                  <span
                    className={[
                      'inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs',
                      selected === opt.key ? 'border-white/50 text-white' : 'border-white/20 text-white/70',
                    ].join(' ')}
                  >
                    {selected === opt.key ? <IconCheck size={16} stroke={2} /> : ' '}
                  </span>
                </div>

                <div className="flex gap-2">
                  {opt.swatches.map((hex) => (
                    <span
                      key={hex}
                      className="h-10 flex-1 rounded-xl border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),_0_10px_18px_rgba(0,0,0,0.35)] transition-transform group-hover:scale-[1.02]"
                      style={{ background: hex }}
                      title={hex.toUpperCase()}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 text-sm font-semibold text-neutral-300">Preview</div>
          <div className="flex items-center gap-3">
            {selectedOption?.swatches.map((hex) => (
              <div key={hex} className="flex flex-col items-center gap-2">
                <span
                  className="h-14 w-14 rounded-xl border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),_0_10px_18px_rgba(0,0,0,0.35)]"
                  style={{ background: hex }}
                />
                <span className="text-[12px] font-semibold tracking-[0.08em] text-neutral-300">{hex.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm text-neutral-300">
          <Button
            prefix={null}
            className="button--icon"
            aria-label="Back"
            onClick={onBack}
            style={{
              '--button-glow': 'radial-gradient(70% 70% at 50% 50%, rgba(130,130,130,1) 0%, transparent 85%)',
              '--button-glow-blur': '18px',
              '--button-glow-opacity': '0.65',
              '--button-glow-inset': '-10px',
              '--button-glow-animation': 'none'
            }}
          >
            <IconArrowNarrowLeft stroke={1.6} />
          </Button>

          <div className="flex flex-1 items-center justify-end gap-4">
            <span className="text-sm text-neutral-400">Continue to Palette</span>
            <Button
              prefix={null}
              className="button--icon"
              aria-label="Continue"
              onClick={() => onNext(selectedOption)}
              style={{
                '--button-glow': `radial-gradient(70% 70% at 50% 50%, ${baseHex} 0%, transparent 85%)`,
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
    </div>
  )
}

