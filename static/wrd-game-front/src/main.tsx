import { render } from 'preact'
import './index.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { createTelegramTheme } from './shared/ui/theme'
import { App } from './app/App'

const colorScheme = (typeof window !== 'undefined' && window.Telegram?.WebApp?.colorScheme === 'light') ? 'light' : 'dark'
const theme = createTheme(createTelegramTheme(colorScheme));

render(<ThemeProvider theme={theme}><App /></ThemeProvider>, document.getElementById('app')!)
