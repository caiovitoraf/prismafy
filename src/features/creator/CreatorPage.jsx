import { GlassPanel } from '../../components/GlassPanel'
import { useState } from 'react'
import { PrimaryColorPicker } from './components/PrimaryColorPicker'

export function CreatorPage() {
  const [accentColor, setAccentColor] = useState('#7f5af0')

  return (
    <section className="flex w-full flex-1 flex-col items-center gap-16 bg-black px-6 py-16 text-white">
      <GlassPanel className="relative mx-auto w-full max-w-6xl rounded-[28px] p-6" style={{ '--glass-radius': '28px' }}>
        <span
          className="pointer-events-none absolute inset-4 -z-10 rounded-[30px] opacity-70 blur-[55px] transition duration-500"
          style={{ background: accentColor }}
        />
        <div className="rounded-[22px] border border-white/10 bg-[rgba(10,10,10,0.88)] p-10">
          <PrimaryColorPicker onColorChange={setAccentColor} />
        </div>
      </GlassPanel>
    </section>
  )
}
