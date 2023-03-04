import {
	Box,
	Button,
	ButtonGroup,
	chakra,
	Container,
	Flex, HStack,
	Icon,
	IconButton,
	Image, Stack,
	Text,
	useBreakpointValue,
	useColorMode,
	useColorModeValue,
} from '@chakra-ui/react';
import { FaMoon, FaPaperPlane, FaSun } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import Typist from 'react-typist-component';

export default function Home() {
	const isDesktop = useBreakpointValue({ base: false, lg: true });
	const { colorMode, toggleColorMode } = useColorMode();

	return (
		<Box as="section" h="100%" pb={{ base: '12', md: '24' }}>
			<Box as="nav" bg="bg-surface" boxShadow={useColorModeValue('sm', 'sm-dark')} h="80px">
				<Container py={{ base: '3', lg: '4' }}>
					<Flex justify="space-between">
						<HStack spacing="4">
							{/* link the svg */}
						</HStack>
						<HStack spacing="4">
							<ButtonGroup spacing="1" variant="ghost">
								<Button>Features</Button>
							</ButtonGroup>
						</HStack>
						{isDesktop ? (
							<HStack spacing="4">
								<ButtonGroup spacing="1" variant="ghost">
									<Button onClick={toggleColorMode}>
										<Icon as={colorMode === 'light' ? FaMoon : FaSun} />
									</Button>
									<Button variant="primary">Dashboard</Button>
								</ButtonGroup>
							</HStack>
						) : (
							<IconButton aria-label="Open Menu" icon={<FiMenu fontSize="1.25rem" />} variant="ghost" />
						)}
					</Flex>
				</Container>
			</Box>
			<Box mx="auto" px={8} py={24}>
				<Box
					mx="auto"
					textAlign={{
						base: 'left',
						md: 'center',
					}}
					w={{
						base: 'full',
						md: 11 / 12,
						xl: 9 / 12,
					}}
				>
					<chakra.h1
						_dark={{
							color: 'gray.100',
						}}
						color="gray.900"
						fontSize={{
							base: '4xl',
							md: '6xl',
						}}
						fontWeight="bold"
						letterSpacing={{
							base: 'normal',
							md: 'tight',
						}}
						lineHeight="none"
						mb={6}
					>
						<Text
							bgClip="text"
							bgColor="#4f5d73"
							display={{
								base: 'block',
								lg: 'inline',
							}}
							fontWeight="extrabold"
							w="full"
						>
							<Typist loop typingDelay={150}>
								<span />
								{['Definitions', 'Adjectives', 'Rhymes', 'Hyponyms', 'Homophones'].map((word) => (
									// eslint-disable-next-line react/jsx-key
									<>
										<span>{word}</span>
										<Typist.Delay ms={1_000} />
										<Typist.Backspace count={word.length} />
									</>
								))}
							</Typist>
							{' '} at your fingertips.
						</Text>
					</chakra.h1>
					<chakra.p
						_dark={{
							color: 'gray.300',
						}}
						color="gray.600"
						fontSize={{
							base: 'lg',
							md: 'xl',
						}}
						mb={6}
						px={{
							base: 0,
							lg: 24,
						}}
					>
						Motto here
					</chakra.p>
					<Stack
						direction={{
							base: 'column',
							sm: 'row',
						}}
						justifyContent={{
							sm: 'left',
							md: 'center',
						}}
						mb={{
							base: 4,
							md: 8,
						}}
						spacing={2}
					>
						<Button
							alignItems="center"
							colorScheme="brand"
							cursor="pointer"
							display="inline-flex"
							justifyContent="center"
							mb={{
								base: 2,
								sm: 0,
							}}
							size="lg"
							variant="solid"
							w={{
								base: 'full',
								sm: 'auto',
							}}
						>
							<Icon as={FaPaperPlane} mr="2" /> Invite Thoth
						</Button>
					</Stack>
				</Box>
				<Box mt={20} mx="auto" textAlign="center" w="65%">
					<Image
						alt="preview of DayAway admin platform"
						border="1px"
						borderColor={useColorModeValue('gray.300', 'gray.300')}
						overflow="hidden"
						rounded="lg"
						shadow="2xl"
						src="/preview.png"
						w="full"
					/>
				</Box>
			</Box>
		</Box>
	);
}
