"use client"

import { handleAuthentication, isWebAuthnSupported } from "@/registry/new-york/blocks/biometric-login/lib/webauthn"
import type { AuthenticationStatus } from "@/registry/new-york/blocks/biometric-login/lib/webauthn-types"
import { Button } from "@/registry/new-york/ui/button"
import { FingerprintIcon, LoaderCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"

type LoginButtonProps = {
    authenticateUrl?: string
    verifyUrl?: string
    username?: string
    onStatusChange?: (status: AuthenticationStatus) => void
    onAuthenticationSuccess?: (credential: Credential | null) => void
    onError?: (error: Error) => void
    disabled?: boolean
}

export function LoginButton({
    authenticateUrl,
    verifyUrl,
    username = "user@example.com",
    onStatusChange,
    onAuthenticationSuccess,
    onError,
    disabled = false
}: LoginButtonProps) {
    const [isAuthenticating, setIsAuthenticating] = useState(false)
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
            setIsAuthenticating(true)

            if (authenticateUrl && verifyUrl) {
                await handleAuthentication(
                    authenticateUrl,
                    verifyUrl,
                    username,
                    (status) => {
                        onStatusChange?.(status)
                    },
                    (credential) => {
                        onAuthenticationSuccess?.(credential)
                    },
                    (error) => {
                        onError?.(error)
                    }
                )
            } else {
                // Direct authentication without challenge
                const credential = await navigator.credentials.get({
                    publicKey: {
                        challenge: new Uint8Array(32),
                        rpId: window.location.hostname,
                        allowCredentials: [],
                        userVerification: "required",
                    }
                })
                onAuthenticationSuccess?.(credential)
            }
        } catch (error) {
            console.error("Authentication error:", error)
            onError?.(error instanceof Error ? error : new Error("An unexpected error occurred during authentication"))
        } finally {
            setIsAuthenticating(false)
        }
    }

    return (
        <Button
            onClick={handleClick}
            className="w-full"
            disabled={disabled || !isSupported || isCheckingSupport}
            aria-label="Sign in with biometrics"
        >
            {isCheckingSupport ? (
                <>
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    Checking support...
                </>
            ) : isAuthenticating ? (
                <>
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                </>
            ) : (
                <>
                    <FingerprintIcon className="mr-2 h-4 w-4" />
                    Sign in with Biometrics
                </>
            )}
        </Button>
    )
} 