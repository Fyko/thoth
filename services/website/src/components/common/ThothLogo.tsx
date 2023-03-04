import type { HTMLChakraProps } from '@chakra-ui/react';
import { chakra } from '@chakra-ui/react';

export const ThothLogo = (props?: HTMLChakraProps<'svg'>) => (
	<chakra.svg
		version="1.1"
		viewBox="0 0 64 64"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<g id="Layer_1">
			<g className="st1">
				<path d="M48,50c0,2.2-1.8,4-4,4H20c-2.2,0-4-1.8-4-4V18c0-2.2,1.8-4,4-4h24c2.2,0,4,1.8,4,4V50z" fill='#231F20' />
			</g>
			<g>
				<path
					className="st3"
					d="M48,48c0,2.2-1.8,4-4,4H20c-2.2,0-4-1.8-4-4V16c0-2.2,1.8-4,4-4h24c2.2,0,4,1.8,4,4V48z"
					fill="#4F5D73"
				/>
			</g>
			<g className="st1" fill="#231F20">
				<g>
					<path
						className="st2"
						d="M35,14v7.8c0,0.3,0.2,0.5,0.4,0.6c0.1,0,0.2,0,0.3,0c0.2,0,0.3-0.1,0.5-0.2l2.9-2.8l2.9,2.8
					c0.1,0.1,0.3,0.2,0.5,0.2c0.1,0,0.2,0,0.3,0c0.2-0.1,0.4-0.3,0.4-0.6V14H35z"
					/>
				</g>
			</g>
			<g>
				<g>
					<path
						className="st4"
						d="M35,12v7.8c0,0.3,0.2,0.5,0.4,0.6c0.1,0,0.2,0,0.3,0c0.2,0,0.3-0.1,0.5-0.2l2.9-2.8l2.9,2.8
					c0.1,0.1,0.3,0.2,0.5,0.2c0.1,0,0.2,0,0.3,0c0.2-0.1,0.4-0.3,0.4-0.6V12H35z"
						fill="#C75C5C"
					/>
				</g>
			</g>
			<g>
				<rect className="st5" fill="#E0E0D1" height="40" width="3" x="20" y="12" />
			</g>
		</g>
		<g id="Layer_2" />
	</chakra.svg>
);
