import { type StyleFunctionProps } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const baseStyle = (props: StyleFunctionProps) => ({
  content: {
    borderWidth: '1px',
    boxShadow: mode('lg', 'lg-dark')(props),
    borderRadius: 'lg',
    background: 'bg-surface',
    overflow: 'hidden',
  },
})

export default {
  baseStyle,
}
