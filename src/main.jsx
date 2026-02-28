import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GameModeProvider } from './context/GameModeContext.jsx'
import { SoundProvider } from './context/SoundContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <GameModeProvider>
        <SoundProvider>
          <App />
        </SoundProvider>
      </GameModeProvider>
    </AuthProvider>
  </StrictMode>,
)

