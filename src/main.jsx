import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { CursiFyProvider } from './context/CursiFyContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CursiFyProvider>
      <App />
    </CursiFyProvider>
  </StrictMode>,
)
