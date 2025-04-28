import { PublicKeyCredentialRequestOptionsJSON } from "@/registry/new-york/blocks/biometric-login/lib/webauthn-types"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { username } = await request.json()

        // Generate a random challenge
        const challenge = crypto.getRandomValues(new Uint8Array(32))

        const options: PublicKeyCredentialRequestOptionsJSON = {
            challenge: Buffer.from(challenge).toString('base64url'),
            timeout: 60000,
            rpId: process.env.NEXT_PUBLIC_RP_ID || "localhost",
            userVerification: "required"
        }

        return NextResponse.json(options)
    } catch (error) {
        console.error("Authentication error:", error)
        return NextResponse.json(
            { error: "Failed to generate authentication options" },
            { status: 500 }
        )
    }
} 