import { GlassPanel } from '../../components/GlassPanel'
import { useState } from 'react'
import { PrimaryColorPicker } from './components/PrimaryColorPicker'
import { HarmonySelection } from './components/HarmonySelection'

function PaletteDisplay({ baseHex = '#7f5af0', harmony = null, onBack = () => {} }) {
  return (
    <div className="grid w-full gap-8 lg:grid-cols-[320px,1fr]">
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
          <span className="text-sm uppercase tracking-[0.35em] text-neutral-400">State 3</span>
          <h2 className="font-display text-4xl font-semibold">Palette preview</h2>
          <p className="text-base text-neutral-300">Full palette generation coming next.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 text-sm font-semibold text-neutral-300">Selection</div>
          <div className="flex items-center gap-4">
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
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 text-sm font-semibold text-neutral-300">Coming soon</div>
          <p className="text-neutral-400">
            We’ll render 9-step shade scales for each role (Primary, Success,
            Warning, Error, Info) and a tinted Neutral scale, plus export options.
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm text-neutral-300">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Back to harmony
          </button>
          <span className="text-neutral-500">Export and Visualize actions will appear here.</span>
        </div>
      </div>
    </div>
  )
}

export function CreatorPage() {
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
            />
          )}
        </div>
      </GlassPanel>
    </section>
  )
}
