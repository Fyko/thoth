import { ChakraProvider } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Router } from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import '@fontsource/inter/variable.css';
import theme from '../theme';

NProgress.configure({ showSpinner: false });
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function App({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>Thoth</title>
				<meta content="width=device-width, initial-scale=1.0" name="viewport" />
				<meta content="Powerful ELA Tools your Discord server." name="description" />
				<meta content="green.400" name="theme-color" />
				<meta content="Thoth" property="og:title" />
				<meta content="Powerful ELA Tools your Discord server." property="og:description" />
				<meta content="/favicon.svg" property="og:image" />
			</Head>
			<ChakraProvider theme={theme}>
				<Component {...pageProps} />
			</ChakraProvider>
		</>
	);
}
