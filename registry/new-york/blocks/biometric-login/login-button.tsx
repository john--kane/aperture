"use client"

import type { AuthenticationStatus } from "@/registry/new-york/blocks/biometric-login/lib/webauthn-types"
import { Button } from "@/registry/new-york/ui/button"
import { FingerprintIcon, LoaderCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { handleAuthentication, isWebAuthnSupported } from "./lib/webauthn"

type LoginButtonProps = {
    authenticateUrl?: string
    verifyUrl?: string
    username?: string
    onStatusChange?: (status: AuthenticationStatus) => void
    onAuthenticationSuccess?: (credential: Credential | null) => void
    onError?: (error: Error) => void
    disabled?: boolean
    showNotifications?: boolean
}

export function LoginButton({
    authenticateUrl = "/api/webauthn/authenticate",
    verifyUrl = "/api/webauthn/verify",
    username = "user@example.com",
    onStatusChange,
    onAuthenticationSuccess,
    onError,
    disabled = false,
    showNotifications = true
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

                if (showNotifications) {
                    if (supported) {
                        toast.success("Biometric authentication is supported")
                    } else {
                        toast.error("Biometric authentication is not supported in your browser")
                    }
                }

                if (!supported) {
                    const error = new Error("Biometric authentication is not supported in your browser. Please try a different browser or device.")
                    onError?.(error)
                }
            } finally {
                setIsCheckingSupport(false)
            }
        }

        checkSupport()
    }, [onError, showNotifications])

    const handleClick = async () => {
        if (!isSupported) return

        try {
            setIsAuthenticating(true)
            if (showNotifications) {
                toast.loading("Waiting for biometric verification...")
            }

            await handleAuthentication(
                authenticateUrl,
                verifyUrl,
                username,
                (status) => {
                    onStatusChange?.(status)
                    if (showNotifications) {
                        switch (status) {
                            case "authenticating":
                                toast.loading("Verifying your identity...")
                                break
                            case "success":
                                toast.success("Authentication successful!")
                                break
                            case "error":
                                toast.error("Authentication failed")
                                break
                        }
                    }
                },
                (credential) => {
                    onAuthenticationSuccess?.(credential)
                    if (showNotifications) {
                        toast.success("Biometric verification complete")
                    }
                },
                (error) => {
                    onError?.(error)
                    if (showNotifications) {
                        toast.error(error.message)
                    }
                }
            )
        } catch (error) {
            console.error("Authentication error:", error)
            if (showNotifications) {
                toast.error("An unexpected error occurred during authentication")
            }
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