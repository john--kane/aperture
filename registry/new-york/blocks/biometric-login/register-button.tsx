"use client"

import type { AuthenticationStatus } from "@/registry/new-york/blocks/biometric-login/lib/webauthn-types"
import { Button } from "@/registry/new-york/ui/button"
import { FingerprintIcon, LoaderCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"

type RegisterButtonProps = {
    registerUrl?: string
    verifyUrl?: string
    username?: string
    onStatusChange?: (status: AuthenticationStatus) => void
    onRegistrationSuccess?: (credential: Credential | null) => void
    onError?: (error: Error) => void
    disabled?: boolean
}

// Helper function to convert base64url to Uint8Array
function base64UrlToUint8Array(base64Url: string): Uint8Array {
    const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
    const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function RegisterButton({
    registerUrl = "/api/webauthn/register",
    verifyUrl = "/api/webauthn/verify",
    username = "user@example.com",
    onStatusChange,
    onRegistrationSuccess,
    onError,
    disabled = false
}: RegisterButtonProps) {
    const [isRegistering, setIsRegistering] = useState(false)
    const [isSupported, setIsSupported] = useState<boolean>(false)

    useEffect(() => {
        const isWebAuthnSupported =
            typeof window !== 'undefined' &&
            typeof window.PublicKeyCredential !== 'undefined' &&
            typeof navigator.credentials !== 'undefined' &&
            typeof navigator.credentials.create !== 'undefined'

        setIsSupported(isWebAuthnSupported)

        if (!isWebAuthnSupported) {
            const error = new Error("Biometric authentication is not supported in your browser. Please try a different browser or device.")
            onError?.(error)
        }
    }, [onError])

    const handleRegistration = async () => {
        if (!isSupported) return

        try {
            onStatusChange?.("authenticating")
            setIsRegistering(true)

            const response = await fetch(registerUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username })
            })

            if (!response.ok) throw new Error("Failed to get registration options")

            const options = await response.json()

            const credential = await navigator.credentials.create({
                publicKey: {
                    ...options,
                    challenge: base64UrlToUint8Array(options.challenge),
                    user: {
                        ...options.user,
                        id: base64UrlToUint8Array(options.user.id)
                    }
                }
            })

            if (!credential) throw new Error("Failed to create credential")

            const verifyResponse = await fetch(verifyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    credential,
                    type: "registration"
                })
            })

            if (!verifyResponse.ok) throw new Error("Failed to verify credential")

            onStatusChange?.("success")
            onRegistrationSuccess?.(credential)
        } catch (error) {
            const err = error instanceof Error ? error : new Error("Registration failed")
            onStatusChange?.("error")
            onError?.(err)
            console.error("Registration error:", error)
        } finally {
            setIsRegistering(false)
        }
    }

    return (
        <Button
            onClick={handleRegistration}
            className="w-full"
            disabled={disabled || !isSupported}
            aria-label="Register biometric credentials"
        >
            {isRegistering ? (
                <>
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                </>
            ) : (
                <>
                    <FingerprintIcon className="mr-2 h-4 w-4" />
                    Register Biometric Credentials
                </>
            )}
        </Button>
    )
} 