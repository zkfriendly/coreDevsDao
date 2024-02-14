import { ChakraProvider, Container, HStack, Icon, IconButton, Link, Spinner, Stack, Text } from "@chakra-ui/react"
import { SupportedNetwork } from "@semaphore-protocol/data"
import type { AppProps } from "next/app"
import getNextConfig from "next/config"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FaGithub } from "react-icons/fa"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import useSemaphore from "../hooks/useSemaphore"
import theme from "../styles/index"
import { providers } from "ethers"
import { Web3ReactProvider } from "@web3-react/core"
import ConnectWallet from "../components/ConnectWallet"

const { publicRuntimeConfig: env } = getNextConfig()

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const semaphore = useSemaphore()
    const [_logs, setLogs] = useState<string>("")

    useEffect(() => {
        semaphore.refreshUsers()
        semaphore.refreshFeedback()
    }, [])

    return (
        <>
            <Head>
                <title>Semaphore boilerplate</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#ebedff" />
            </Head>
            <Web3ReactProvider getLibrary={(provider) => new providers.Web3Provider(provider)}>
                <ChakraProvider theme={theme}>
                    <HStack align="center" justify="right" p="2">
                        <ConnectWallet />
                    </HStack>

                    <Container maxW="lg" flex="1" display="flex" alignItems="center">
                        <Stack py="8" display="flex" width="100%">
                            <SemaphoreContext.Provider value={semaphore}>
                                <LogsContext.Provider
                                    value={{
                                        _logs,
                                        setLogs
                                    }}
                                >
                                    <Component {...pageProps} />
                                </LogsContext.Provider>
                            </SemaphoreContext.Provider>
                        </Stack>
                    </Container>

                    <HStack
                        flexBasis="56px"
                        borderTop="1px solid #8f9097"
                        backgroundColor="#DAE0FF"
                        align="center"
                        justify="center"
                        spacing="4"
                        p="4"
                    >
                        {_logs.endsWith("...") && <Spinner color="primary.400" />}
                        <Text fontWeight="bold">{_logs || `Current step: ${router.route}`}</Text>
                    </HStack>
                </ChakraProvider>
            </Web3ReactProvider>
        </>
    )
}
