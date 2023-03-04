import { mode, GlobalStyleProps } from '@chakra-ui/theme-tools'

export default {
  global: (props: GlobalStyleProps) => ({
    body: {
      color: 'default',
      bg: 'bg-canvas',
    },
    '*::placeholder': {
      opacity: 1,
      color: 'muted',
    },
    '*, *::before, &::after': {
      borderColor: mode('gray.200', 'gray.700')(props),
    },
  }),
}
