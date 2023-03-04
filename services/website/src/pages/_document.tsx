import { ColorModeScript } from '@chakra-ui/react';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';
import theme from '../theme';

export default class CarterDocument extends Document {
	public render() {
		return (
			<Html lang="en">
				<Head>
					<meta charSet="utf-8" />
					<link
						href="https://fonts.googleapis.com/css2?family=Assistant&family=Roboto:wght@400;700&display=swap"
						rel="stylesheet"
					/>
					<link href="/favicon.svg" rel="icon" />
				</Head>
				<body>
					<ColorModeScript initialColorMode={theme.config.initialColorMode} />
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
