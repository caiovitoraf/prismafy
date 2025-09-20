import LogoWhite from '../../assets/LogoWhite.svg'
import { Button } from '../../components/Button'

export function HomePage({ onCreate = () => {} }) {
  return (
    <section className="relative flex w-full min-h-screen flex-col items-center justify-center gap-12 overflow-hidden text-white">
      {/* Top centralized animated light */}
      <span aria-hidden className="home-top-light" />
      <div className="flex flex-col items-center gap-6 text-center">
        <img
          src={LogoWhite}
          alt="Prismafy logo"
          className="h-56 w-56 sm:h-72 sm:w-72 md:h-96 md:w-96 lg:h-[28rem] lg:w-[28rem]"
        />
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[0.08em] text-white">
          Prismafy it
        </h1>
      </div>

      <Button prefix={null} label="Create" onClick={onCreate} />
    </section>
  )
}
