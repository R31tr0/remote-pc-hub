import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import Register from './Register.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Оборачиваем всё приложение в BrowserRouter один раз здесь */}
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  </StrictMode>,
)
