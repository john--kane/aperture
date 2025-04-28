"use client"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { cn } from "@/lib/utils"
import type { AuthenticationStatus } from "@/registry/new-york/blocks/biometric-login/lib/webauthn-types"
import { LoginButton } from "@/registry/new-york/blocks/biometric-login/login-button"
import { RegisterButton } from "@/registry/new-york/blocks/biometric-login/register-button"
import NFCReader from "@/registry/new-york/blocks/nfc-reader/nfc-reader"
import { ShareButton } from "@/registry/new-york/blocks/share-button/share-button"
import WakeLockToggle from "@/registry/new-york/blocks/wake-lock-toggle/wake-lock-toggle"
import { Badge } from "@/registry/new-york/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/new-york/ui/card"
import { FingerprintIcon, Moon, Smartphone, Sun } from "lucide-react"
import { useState } from "react"
// This page displays items from the custom registry.
// You are free to implement this with your own design as needed.

export default function Home() {
  const [wakeLockActive, setWakeLockActive] = useState(false)
  const [wakeLockError, setWakeLockError] = useState<string | null>(null)
  const [wakeLockSupported, setWakeLockSupported] = useState<boolean | null>(null)

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Aperture
        </h1>
        <p className="text-muted-foreground">
          A collection of web components showcasing modern browser capabilities: NFC tag reading, biometric authentication (WebAuthn), system sharing, and wake lock control to prevent screen dimming.
        </p>
      </header>
      <main className="flex flex-col flex-1 gap-8">
        <ControlWrapper v0name="nfc-reader" description="NFC Reader">
          <Card className="w-full max-w-md mx-auto  shadow-none border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                NFC Reader
              </CardTitle>
              <CardDescription>Scan NFC tags to read their content</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <NFCReader
                onScanStart={() => console.log('Scanning started')}
                onScanStop={() => console.log('Scanning stopped')}
                onScanSuccess={(data) => console.log('NFC data:', data)}
                onError={(error) => console.error('NFC error:', error)}
              />
            </CardContent>
          </Card>
        </ControlWrapper>
        <ControlWrapper v0name="share-button" description="Share Button">
          <ShareButton title={"Share Button"} text={"Share Button"} url={"https://www.google.com"} className="w-fit" >
            Share
          </ShareButton>
        </ControlWrapper>

        <ControlWrapper v0name="biometric-login" description="Biometric Login">
          <Card className="w-full max-w-md mx-auto shadow-none border-none">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Biometric Authentication</CardTitle>
              <CardDescription>Sign in securely using your device&apos;s biometric sensors</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                <FingerprintIcon className="h-24 w-24 text-gray-400 mb-4" aria-hidden="true" />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2">
              <RegisterButton
                onStatusChange={(status: AuthenticationStatus) => console.log('Status changed:', status)}
                onRegistrationSuccess={(credential: Credential | null) => console.log('Registration successful:', credential)}
                onError={(error: Error) => console.error('Error occurred:', error)}
              />
              <LoginButton
                onStatusChange={(status: AuthenticationStatus) => console.log('Status changed:', status)}
                onAuthenticationSuccess={(credential: Credential | null) => console.log('Authentication successful:', credential)}
                onError={(error: Error) => console.error('Error occurred:', error)}
              />
            </CardFooter>
          </Card>
        </ControlWrapper>

        <ControlWrapper v0name="wake-lock-toggle" description="Wake Lock Toggle">
          <div className="flex flex-col space-y-4">
            {wakeLockError && (
              <p className="text-sm text-destructive" role="alert">
                {wakeLockError}
              </p>
            )}

            {wakeLockSupported === false && (
              <p className="text-sm text-muted-foreground" role="alert">
                Wake lock is not supported in your browser
              </p>
            )}

            <div className="flex justify-center">
              <WakeLockToggle
                activeControl={
                  <div className="flex items-center gap-2 p-2 bg-green-100 rounded">
                    <Moon className="h-4 w-4" />
                    <span>Screen is awake</span>
                  </div>
                }
                inactiveControl={
                  <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                    <Sun className="h-4 w-4" />
                    <span>Screen may sleep</span>
                  </div>
                }
                onActiveChange={(isActive) => {
                  console.log('Wake lock is now:', isActive)
                  setWakeLockActive(isActive)
                }}
                onError={(error) => {
                  console.error('Wake lock error:', error)
                  setWakeLockError(error)
                }}
                onSupportedChange={(isSupported) => {
                  console.log('Wake lock supported:', isSupported)
                  setWakeLockSupported(isSupported)
                }}
              />
            </div>

            <div className="flex items-center justify-center">
              <Badge className={cn(wakeLockActive ? "bg-green-500" : "bg-red-500")}>
                {wakeLockActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </ControlWrapper>
      </main>
    </div>
  )
}

function ControlWrapper({ children, description, v0name }: { children: React.ReactNode, description: string, v0name: string }) {
  return <div className="flex flex-col gap-4 border rounded-lg p-4 relative">
    <div className="flex items-center justify-between">
      <h2 className="text-sm text-muted-foreground sm:pl-3">
        {description}
      </h2>
      <OpenInV0Button name={v0name} className="w-fit" />
    </div>
    <div className="flex items-center justify-center relative">
      {children}
    </div>
  </div>
}