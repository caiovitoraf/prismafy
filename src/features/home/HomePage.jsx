import LogoWhite from '../../assets/LogoWhite.svg'
import { Button } from '../../components/Button'

export function HomePage({ onCreate = () => {} }) {
  return (
    <section className="flex w-full min-h-screen flex-col items-center justify-center gap-10 text-white">
      <div className="flex flex-col items-center gap-6 text-center">
        <img src={LogoWhite} alt="Prismafy logo" className="h-24 w-24" />
        <h1 className="font-display text-5xl font-semibold tracking-[0.08em] text-white">
          Prismafy it
        </h1>
      </div>

      <Button prefix={null} label="Create" onClick={onCreate} />
    </section>
  )
}
