import { extendTheme, theme as baseTheme, type Theme } from '@chakra-ui/react'
import 'focus-visible/dist/focus-visible'
import * as components from './components'
import * as foundations from './foundations'

export const proTheme: Partial<Theme> = extendTheme({
  ...foundations,
  components: { ...components },
  colors: { ...baseTheme.colors, brand: baseTheme.colors.blue },
  space: {
    '4.5': '1.125rem',
  },
})

const theme = extendTheme({
  fonts: {
    // heading: 'Space Mono , monospace',
    // body: 'Space Mono, monospace',
  },
  config: {
    useSystemColorMode: true,
  },
  styles: {
    global: {
      '#nprogress .bar': {
        background: 'radial-gradient(circle, #e9d8fd 0%, #805ad5 100%)',
      },
    },
  },
  colors: {
    brand: {
      50: '#4f5d73',
      100: '#4f5d73',
      200: '#4f5d73',
      300: '#4f5d73',
      400: '#4f5d73',
      500: '#4f5d73',
      600: '#4f5d73',
      700: '#4f5d73',
      800: '#4f5d73',
      900: '#4f5d73',
    },
  },
}, proTheme);

export default theme as Theme;
