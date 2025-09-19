import { useState } from 'react'
import { Header } from './components/Header'
import { HomePage, CreatorPage, GuidePage, VisualizerPage } from './features'

function App() {
  const [activePage, setActivePage] = useState('home')

  const renderPage = () => {
    switch (activePage) {
      case 'guide':
        return <GuidePage />
      case 'creator':
        return <CreatorPage />
      case 'visualizer':
        return <VisualizerPage />
      case 'home':
      default:
        return <HomePage onCreate={() => setActivePage('creator')} />
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header activePage={activePage} onNavigate={setActivePage} />

      <main className="flex flex-1 items-center justify-center">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
