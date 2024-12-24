import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from '@emotion/react'
import themeConfig from './config/theme-config'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={themeConfig}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
