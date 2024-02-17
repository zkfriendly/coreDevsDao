import { Box, Button, Divider, Heading, Highlight, Link, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react"
import { Identity } from "@semaphore-protocol/identity"
import { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAccount, useSignMessage } from "wagmi"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import IconAddCircleFill from "../icons/IconAddCircleFill"
import useRepositoryName from "../hooks/useRepositoryName"

export default function IdentitiesPage() {
    const navigate = useNavigate()
    const { setLogs } = useContext(LogsContext)
    const [_identity, setIdentity] = useState<Identity>()
    const { isConnected: active } = useAccount()
    const { signMessageAsync } = useSignMessage()
    const repositoryName = useRepositoryName()

    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (identityString) {
            const identity = new Identity(identityString)

            setIdentity(identity)

            setLogs("Your Semaphore identity was retrieved from the browser cache 👌🏽")
        } else {
            setLogs("Create your Semaphore identity 👆🏽")
        }
    }, [])

    const createIdentity = useCallback(async () => {
        if (active) {
            const message = `Sign this message to generate your Semaphore identity.`
            const identity = new Identity(await signMessageAsync({ message }))

            setIdentity(identity)

            localStorage.setItem("identity", identity.toString())

            setLogs("Your new Semaphore identity was just created 🎉")
        } else {
            setLogs("Connect your wallet to create a Semaphore identity 👆🏽")
        }
    }, [active])

    return (
        <>
            <Heading as="h2" size="xl">
                Welcom to Git Perks! 🎉
            </Heading>

            <Text color="primary.900" fontSize="lg">
                Join the{" "}
                {repositoryName && (
                    <a
                        href={`https://github.com/${repositoryName}`}
                        target="_blank"
                        style={{ fontWeight: "bold", fontSize: "1.2em" }}
                    >
                        {repositoryName}
                    </a>
                )}{" "}
                contributors club to enjoy all the available perks and benefits. You can{" "}
                <Highlight query={["anonymously"]} styles={{ px: "2", py: "1", rounded: "full", bg: "teal.100" }}>
                    anonymously
                </Highlight>{" "}
                claim reimbursements on event tickets, travel expenses, and much more. 💰
            </Text>

            <Divider pt="5" borderColor="gray.500" />

            <Stack pt="5" justify="space-between">
                <Text fontSize="lg" color="primary">
                    Let's get you started by creating your Semaphore identity. This will allow you to join the
                    contributors club and later claim your perks anonymously. 🕵🏽‍♂️
                </Text>
                <Text fontWeight="bold" fontSize="lg">
                    Identity Generated Based on Your Wallet
                </Text>
            </Stack>

            {_identity ? (
                <Box py="6" whiteSpace="nowrap">
                    <Box p="5" borderWidth={1} borderColor="gray.500" borderRadius="4px">
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Trapdoor: {_identity.trapdoor.toString()}
                        </Text>
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Nullifier: {_identity.nullifier.toString()}
                        </Text>
                        <Text textOverflow="ellipsis" overflow="hidden">
                            Commitment: {_identity.commitment.toString()}
                        </Text>
                    </Box>
                </Box>
            ) : (
                <Box py="6">
                    <Button
                        w="100%"
                        fontWeight="bold"
                        justifyContent="left"
                        px="4"
                        disabled={!active}
                        onClick={createIdentity}
                        leftIcon={<IconAddCircleFill />}
                    >
                        {active ? "Create identity" : "Connect Metamask"}
                    </Button>
                </Box>
            )}

            <Divider pt="3" borderColor="gray" />

            <Stepper step={1} onNextClick={_identity && (() => navigate("/groups"))} />
        </>
    )
}
