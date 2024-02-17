import { Button, Divider, Heading, Highlight, HStack, Stack, Text, VStack } from "@chakra-ui/react"
import { Identity } from "@semaphore-protocol/identity"
import { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { prepareWriteContract, waitForTransaction, writeContract } from "@wagmi/core"
import AppButton from "../components/AppButton"
import { useContractAddress } from "../hooks/useContractAddress"
import { GATEKEEPER_CONTRACT_ADDRESS_MAP } from "../constants/addresses"
import Stepper from "../components/Stepper"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import IconRefreshLine from "../icons/IconRefreshLine"
import { getBillProofInputs, getPrProofInputs } from "../lib/input"
import { PR_CIRCUIT_ID, ZKBILL_CIRCUIT_ID } from "../constants"
import { gateKeeperABI } from "../abis/types/generated"
import { TransactionState, ZkProofStatus } from "../types"
import useZkEmail from "../hooks/useZkEmail"
import EmailInput from "../components/EmailInput"
import useRepositoryName from "../hooks/useRepositoryName"

export default function GroupsPage() {
    const navigate = useNavigate()
    const { setLogs } = useContext(LogsContext)
    const { _users, refreshUsers } = useContext(SemaphoreContext)
    const [_identity, setIdentity] = useState<Identity>()
    const gateKeeperAddress = useContractAddress(GATEKEEPER_CONTRACT_ADDRESS_MAP)
    const repositoryName = useRepositoryName()
    useEffect(() => {
        const identityString = localStorage.getItem("identity")

        if (!identityString) {
            navigate("/")
            return
        }
        setIdentity(new Identity(identityString))
    }, [])

    useEffect(() => {
        if (_users.length > 0) {
            setLogs(`${_users.length} user${_users.length > 1 ? "s" : ""} retrieved from the group 🤙🏽`)
        }
    }, [_users])
    const userHasJoined = useCallback((identity: Identity) => _users.includes(identity.commitment.toString()), [_users])

    const [emailFull, setEmailFull] = useState("")

    const { generateProof, processedProof, status } = useZkEmail({
        circuitId: PR_CIRCUIT_ID,
        getProofInputs: getPrProofInputs,
        identity: _identity!
    })

    const [txState, setTxState] = useState(TransactionState.INITIAL)
    const joinContributors = useCallback(async () => {
        if (txState !== TransactionState.INITIAL || !gateKeeperAddress || !processedProof) return
        try {
            setTxState(TransactionState.PREPARING_TRANSACTION)
            const { request } = await prepareWriteContract({
                address: gateKeeperAddress,
                abi: gateKeeperABI,
                functionName: "joinContributors",
                args: [processedProof]
            })
            setTxState(TransactionState.AWAITING_USER_APPROVAL)
            const { hash } = await writeContract(request)
            setTxState(TransactionState.AWAITING_TRANSACTION)
            await waitForTransaction({
                hash
            })
            alert("transaction completed!")
        } catch (e) {
            console.log(e)
            alert(`Error: ${String(e)}`)
        }
        setTxState(TransactionState.INITIAL)
    }, [txState, gateKeeperAddress, processedProof])

    return (
        <>
            <Heading as="h2" size="xl">
                Contributors Club 💻
            </Heading>
            <Stack spacing={2}>
                <Text color="green.900">
                    Join the{" "}
                    {repositoryName && (
                        <a href={`https://github.com/${repositoryName}`} target="_blank" style={{ color: "#0072f0" }}>
                            {repositoryName}
                        </a>
                    )}{" "}
                    contributors club to enjoy all the available perks and benefits. You can{" "}
                    <Highlight query={["anonymously"]} styles={{ px: "2", py: "1", rounded: "full", bg: "teal.100" }}>
                        anonymously
                    </Highlight>
                    claim reimbursements on event tickets, travel expenses, and much more. 💰
                </Text>
                <Text color="blue.500">
                    But first you need to prove your a contributor. upload an email you rceived that shows your PR was
                    merged into main. 📧
                </Text>
            </Stack>
            <Divider pt="5" borderColor="gray.500" />
            <HStack py="5" justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    Total Contributors ({_users.length})
                </Text>
                <Button leftIcon={<IconRefreshLine />} variant="link" color="text.700" onClick={refreshUsers}>
                    Refresh
                </Button>
            </HStack>
            <EmailInput emailFull={emailFull} setEmailFull={setEmailFull} />
            <AppButton
                disabled={status === ZkProofStatus.GENERATING || txState === TransactionState.AWAITING_TRANSACTION}
                onClick={() => {
                    if (processedProof) {
                        if (txState === TransactionState.INITIAL) {
                            joinContributors()
                        }
                    } else if (status === ZkProofStatus.INITIAL) {
                        generateProof(emailFull)
                    }
                }}
            >
                {status === ZkProofStatus.INITIAL && "Generate Proof"}
                {status === ZkProofStatus.GENERATING && "Preparing ZK proof..."}
                {status === ZkProofStatus.READY && "Proof ready! click to join"}
                {txState === TransactionState.AWAITING_USER_APPROVAL && "Confirm transaction"}
                {txState === TransactionState.AWAITING_TRANSACTION && "Waiting for transaction"}
            </AppButton>
            {_users.length > 0 && (
                <VStack spacing="3" px="3" align="left" maxHeight="300px" overflowY="scroll">
                    {_users.map((user, i) => (
                        <HStack key={i} p="3" borderWidth={1} whiteSpace="nowrap">
                            <Text textOverflow="ellipsis" overflow="hidden">
                                {user}
                            </Text>
                        </HStack>
                    ))}
                </VStack>
            )}
            <Divider pt="6" borderColor="gray" />
            <Stepper
                step={2}
                onPrevClick={() => navigate("/")}
                onNextClick={_identity && userHasJoined(_identity) ? () => navigate("/proofs") : undefined}
            />
        </>
    )
}
