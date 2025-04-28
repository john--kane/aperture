import type { AuthenticationStatus, PublicKeyCredentialRequestOptions } from "./webauthn-types"

/**
 * Convert a base64 string to an ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64.replace(/-/g, "+").replace(/_/g, "/"))
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
}

/**
 * Convert an ArrayBuffer to a base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

/**
 * Convert a base64url string to Uint8Array
 */
export function base64UrlToUint8Array(base64Url: string): Uint8Array {
    const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
    const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

/**
 * Check if WebAuthn is supported in the current browser
 */
export function isWebAuthnSupported(): boolean {
    return typeof window !== 'undefined' &&
        typeof window.PublicKeyCredential !== 'undefined' &&
        typeof navigator.credentials !== 'undefined' &&
        typeof navigator.credentials.create !== 'undefined' &&
        typeof navigator.credentials.get !== 'undefined'
}

/**
 * Authenticate with biometrics using WebAuthn
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
    try {
        // In a real application, this would be fetched from your server
        // The server would generate a random challenge for security
        const mockAuthenticationOptions: PublicKeyCredentialRequestOptions = {
            challenge: new Uint8Array([
                21, 31, 105, 25, 8, 175, 238, 100, 55, 69, 37, 79, 138, 42, 5, 128, 28, 38, 93, 143, 85, 196, 125, 94, 242, 27,
                211, 33, 88, 55, 41, 73,
            ]),
            timeout: 60000,
            rpId: window.location.hostname,
            userVerification: "preferred",
            // In a real app, this would include the user's registered credentials
            allowCredentials: [],
        }

        // Start the authentication process
        const credential = (await navigator.credentials.get({
            publicKey: {
                ...mockAuthenticationOptions,
                allowCredentials: mockAuthenticationOptions.allowCredentials as PublicKeyCredentialDescriptor[]
            },
        })) as PublicKeyCredential

        if (!credential) {
            throw new Error("No credentials returned")
        }

        // In a real application, you would send this response to your server for verification
        const authenticatorData = credential.response as AuthenticatorAssertionResponse

        // For demo purposes, we'll just log the credential ID
        console.log("Authentication successful with credential ID:", arrayBufferToBase64(credential.rawId))

        // In a real app, you would verify the assertion with your server
        // const verificationResponse = await fetch('/api/auth/verify-assertion', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     id: arrayBufferToBase64(credential.rawId),
        //     rawId: arrayBufferToBase64(credential.rawId),
        //     type: credential.type,
        //     response: {
        //       authenticatorData: arrayBufferToBase64(authenticatorData.authenticatorData),
        //       clientDataJSON: arrayBufferToBase64(authenticatorData.clientDataJSON),
        //       signature: arrayBufferToBase64(authenticatorData.signature),
        //       userHandle: authenticatorData.userHandle ? arrayBufferToBase64(authenticatorData.userHandle) : null
        //     }
        //   })
        // })

        // Return success
        return true
    } catch (error) {
        console.error("WebAuthn authentication error:", error)
        throw error
    }
}

/**
 * Register a new biometric credential (for reference, not used in the login component)
 */
export async function registerBiometricCredential(username: string): Promise<boolean> {
    try {
        // In a real application, this would be fetched from your server
        const userId = new Uint8Array(16)
        window.crypto.getRandomValues(userId)

        const mockCreationOptions = {
            challenge: new Uint8Array([
                21, 31, 105, 25, 8, 175, 238, 100, 55, 69, 37, 79, 138, 42, 5, 128, 28, 38, 93, 143, 85, 196, 125, 94, 242, 27,
                211, 33, 88, 55, 41, 73,
            ]),
            rp: {
                name: "Your Application",
                id: window.location.hostname,
            },
            user: {
                id: userId,
                name: username,
                displayName: username,
            },
            pubKeyCredParams: [
                { type: "public-key", alg: -7 }, // ES256
                { type: "public-key", alg: -257 }, // RS256
            ],
            timeout: 60000,
            attestation: "none",
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "preferred",
            },
        }

        // Start the registration process
        const credential = (await navigator.credentials.create({
            publicKey: mockCreationOptions as PublicKeyCredentialCreationOptions,
        })) as PublicKeyCredential

        if (!credential) {
            throw new Error("No credentials returned")
        }

        // In a real application, you would send this response to your server
        console.log("Registration successful with credential ID:", arrayBufferToBase64(credential.rawId))

        return true
    } catch (error) {
        console.error("WebAuthn registration error:", error)
        throw error
    }
}

/**
 * Handle registration with biometrics
 */
export async function handleRegistration(
    registerUrl: string,
    verifyUrl: string,
    username: string,
    onStatusChange?: (status: AuthenticationStatus) => void,
    onRegistrationSuccess?: (credential: Credential | null) => void,
    onError?: (error: Error) => void
): Promise<void> {
    try {
        onStatusChange?.("authenticating")

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
        throw err
    }
}

/**
 * Handle authentication with biometrics
 */
export async function handleAuthentication(
    authenticateUrl: string,
    verifyUrl: string,
    username: string,
    onStatusChange?: (status: AuthenticationStatus) => void,
    onAuthenticationSuccess?: (credential: Credential | null) => void,
    onError?: (error: Error) => void
): Promise<void> {
    try {
        onStatusChange?.("authenticating")

        const response = await fetch(authenticateUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
        })

        if (!response.ok) throw new Error("Failed to get authentication options")

        const options = await response.json()

        const credential = await navigator.credentials.get({
            publicKey: {
                ...options,
                challenge: base64UrlToUint8Array(options.challenge)
            }
        })

        if (!credential) throw new Error("Failed to get credential")

        const verifyResponse = await fetch(verifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                credential,
                type: "authentication"
            })
        })

        if (!verifyResponse.ok) throw new Error("Failed to verify credential")

        onStatusChange?.("success")
        onAuthenticationSuccess?.(credential)
    } catch (error) {
        const err = error instanceof Error ? error : new Error("Authentication failed")
        onStatusChange?.("error")
        onError?.(err)
        throw err
    }
}
