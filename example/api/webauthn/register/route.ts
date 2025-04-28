import { PublicKeyCredentialCreationOptionsJSON } from "@/registry/new-york/blocks/biometric-login/lib/webauthn-types"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { username } = await request.json()

        // Generate a random challenge
        const challenge = crypto.getRandomValues(new Uint8Array(32))

        const options: PublicKeyCredentialCreationOptionsJSON = {
            challenge: Buffer.from(challenge).toString('base64url'),
            rp: {
                name: "Your App Name",
                id: process.env.NEXT_PUBLIC_RP_ID || "localhost"
            },
            user: {
                id: Buffer.from(username).toString('base64url'),
                name: username,
                displayName: username
            },
            pubKeyCredParams: [
                { type: "public-key", alg: -7 }, // ES256
                { type: "public-key", alg: -257 } // RS256
            ],
            timeout: 60000,
            attestation: "none",
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required"
            }
        }

        return NextResponse.json(options)
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Failed to generate registration options" },
            { status: 500 }
        )
    }
} 