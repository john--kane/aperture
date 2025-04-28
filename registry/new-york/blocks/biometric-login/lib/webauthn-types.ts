// WebAuthn related types
export type AuthenticationStatus = "idle" | "authenticating" | "success" | "error"

export interface PublicKeyCredentialCreationOptions {
    challenge: BufferSource
    rp: {
        name: string
        id?: string
    }
    user: {
        id: BufferSource
        name: string
        displayName: string
    }
    pubKeyCredParams: {
        type: "public-key"
        alg: number
    }[]
    timeout?: number
    excludeCredentials?: {
        id: BufferSource
        type: "public-key"
        transports?: string[]
    }[]
    authenticatorSelection?: {
        authenticatorAttachment?: "platform" | "cross-platform"
        requireResidentKey?: boolean
        userVerification?: "required" | "preferred" | "discouraged"
    }
    attestation?: "none" | "indirect" | "direct"
}

export interface PublicKeyCredentialRequestOptions {
    challenge: BufferSource
    timeout?: number
    rpId?: string
    allowCredentials?: {
        id: BufferSource
        type: "public-key"
        transports?: string[]
    }[]
    userVerification?: "required" | "preferred" | "discouraged"
}

export interface PublicKeyCredentialCreationOptionsJSON {
    challenge: string
    rp: {
        name: string
        id?: string
    }
    user: {
        id: string
        name: string
        displayName: string
    }
    pubKeyCredParams: Array<{
        type: "public-key"
        alg: number
    }>
    timeout?: number
    attestation?: "none" | "indirect" | "direct"
    authenticatorSelection?: {
        authenticatorAttachment?: "platform" | "cross-platform"
        requireResidentKey?: boolean
        userVerification?: "required" | "preferred" | "discouraged"
    }
}

export interface PublicKeyCredentialRequestOptionsJSON {
    challenge: string
    timeout?: number
    rpId?: string
    allowCredentials?: Array<{
        type: "public-key"
        id: string
        transports?: Array<"usb" | "nfc" | "ble" | "internal">
    }>
    userVerification?: "required" | "preferred" | "discouraged"
}

export interface CredentialCreationResponse {
    id: string
    rawId: string
    response: {
        attestationObject: string
        clientDataJSON: string
    }
    type: "public-key"
}

export interface CredentialRequestResponse {
    id: string
    rawId: string
    response: {
        authenticatorData: string
        clientDataJSON: string
        signature: string
        userHandle?: string
    }
    type: "public-key"
}
