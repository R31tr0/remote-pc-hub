import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import Register from './Register.jsx'
import { LazyMotion, domAnimation } from 'framer-motion';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LazyMotion features={domAnimation}>
    {/* Оборачиваем всё приложение в BrowserRouter один раз здесь */}
    <BrowserRouter>
      <Register />
    </BrowserRouter>
    </LazyMotion>
  </StrictMode>,
)
