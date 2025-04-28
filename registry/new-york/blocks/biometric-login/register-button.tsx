"use client"

import { handleRegistration, isWebAuthnSupported } from "@/registry/new-york/blocks/biometric-login/lib/webauthn"
import type { AuthenticationStatus } from "@/registry/new-york/blocks/biometric-login/lib/webauthn-types"
import { Button } from "@/registry/new-york/ui/button"
import { FingerprintIcon, LoaderCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"

type RegisterButtonProps = {
    registerUrl?: string
    verifyUrl?: string
    username?: string
    displayName?: string
    onStatusChange?: (status: AuthenticationStatus) => void
    onRegistrationSuccess?: (credential: Credential | null) => void
    onError?: (error: Error) => void
    disabled?: boolean
}

export function RegisterButton({
    registerUrl,
    verifyUrl,
    username = "user@example.com",
    displayName = "User",
    onStatusChange,
    onRegistrationSuccess,
    onError,
    disabled = false
}: RegisterButtonProps) {
    const [isRegistering, setIsRegistering] = useState(false)
    const [isSupported, setIsSupported] = useState<boolean>(false)
    const [isCheckingSupport, setIsCheckingSupport] = useState(true)

    useEffect(() => {
        const checkSupport = async () => {
            try {
                setIsCheckingSupport(true)
                const supported = isWebAuthnSupported()
                setIsSupported(supported)

                if (!supported) {
                    const error = new Error("Biometric authentication is not supported in your browser. Please try a different browser or device.")
                    onError?.(error)
                }
            } finally {
                setIsCheckingSupport(false)
            }
        }

        checkSupport()
    }, [onError])

    const handleClick = async () => {
        if (!isSupported) return

        try {
            setIsRegistering(true)

            if (registerUrl && verifyUrl) {
                await handleRegistration(
                    registerUrl,
                    verifyUrl,
                    username,
                    onStatusChange,
                    onRegistrationSuccess,
                    onError
                )
            } else {
                // Direct registration without challenge
                const credential = await navigator.credentials.create({
                    publicKey: {
                        rp: {
                            name: "WebAuthn Demo",
                            id: window.location.hostname,
                        },
                        user: {
                            id: new Uint8Array(16),
                            name: username,
                            displayName: displayName,
                        },
                        pubKeyCredParams: [
                            { type: "public-key", alg: -7 },  // ES256
                            { type: "public-key", alg: -257 }, // RS256
                        ],
                        authenticatorSelection: {
                            authenticatorAttachment: "platform",
                            userVerification: "required",
                            requireResidentKey: false,
                        },
                        attestation: "none",
                        challenge: new Uint8Array(32),
                    }
                })
                onStatusChange?.("success")
                onRegistrationSuccess?.(credential)
            }
        } catch (error) {
            console.error("Registration error:", error)
            onStatusChange?.("error")
            onError?.(error instanceof Error ? error : new Error("An unexpected error occurred during registration"))
        } finally {
            setIsRegistering(false)
        }
    }

    return (
        <Button
            onClick={handleClick}
            className="w-full"
            disabled={disabled || !isSupported || isCheckingSupport}
            aria-label="Register biometric credentials"
        >
            {isCheckingSupport ? (
                <>
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    Checking support...
                </>
            ) : isRegistering ? (
                <>
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                </>
            ) : (
                <>
                    <FingerprintIcon className="mr-2 h-4 w-4" />
                    Register Biometrics
                </>
            )}
        </Button>
    )
} 