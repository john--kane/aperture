"use client"

import { Button } from "@/registry/new-york/ui/button"
import { Smartphone } from "lucide-react"
import { useEffect, useState } from "react"

interface NFCTag {
    serialNumber?: string
    recordCount?: number
    records?: Array<{
        recordType: string
        mediaType?: string
        data?: any
        encoding?: string
        lang?: string
    }>
    message?: string
}

interface NFCReaderProps {
    onScanStart?: () => void
    onScanStop?: () => void
    onScanSuccess?: (data: NFCTag) => void
    onError?: (error: string) => void
}

export default function NFCReader({ onScanStart, onScanStop, onScanSuccess, onError }: NFCReaderProps) {
    const [isNFCSupported, setIsNFCSupported] = useState<boolean | null>(null)
    const [isScanning, setIsScanning] = useState(false)

    // Check if NFC is supported
    useEffect(() => {
        if ("NDEFReader" in window) {
            setIsNFCSupported(true)
        } else {
            setIsNFCSupported(false)
        }
    }, [])

    const startScan = async () => {
        if (!isNFCSupported) return

        setIsScanning(true)
        onScanStart?.()

        try {
            // @ts-ignore - TypeScript doesn't know about NDEFReader yet
            const ndef = new window.NDEFReader()

            await ndef.scan()

            ndef.addEventListener("reading", ({ message, serialNumber }: { message: any; serialNumber: string }) => {
                const records = Array.from(message.records).map((record: any) => {
                    let data
                    try {
                        if (record.recordType === "text") {
                            const textDecoder = new TextDecoder(record.encoding)
                            data = textDecoder.decode(record.data)
                        } else if (record.recordType === "url") {
                            const textDecoder = new TextDecoder()
                            data = textDecoder.decode(record.data)
                        } else {
                            data = "Data in unsupported format"
                        }
                    } catch (e) {
                        data = "Error decoding data"
                    }

                    return {
                        recordType: record.recordType,
                        mediaType: record.mediaType,
                        data,
                        encoding: record.encoding,
                        lang: record.lang,
                    }
                })

                const nfcData = {
                    serialNumber,
                    recordCount: message.records.length,
                    records,
                }

                onScanSuccess?.(nfcData)
                setIsScanning(false)
                onScanStop?.()
            })

            ndef.addEventListener("error", (error: Error) => {
                onError?.(error.message)
                setIsScanning(false)
                onScanStop?.()
            })
        } catch (error) {
            onError?.(error instanceof Error ? error.message : "Unknown error occurred")
            setIsScanning(false)
            onScanStop?.()
        }
    }

    const stopScan = () => {
        setIsScanning(false)
        onScanStop?.()
    }

    return (
        <Button
            onClick={isScanning ? stopScan : startScan}
            disabled={isNFCSupported === false}
            className="w-full"
            aria-label={isScanning ? "Stop scanning" : "Start scanning for NFC tags"}
        >
            <Smartphone className="mr-2 h-4 w-4" />
            {isScanning ? "Stop Scanning" : "Scan NFC Tag"}
        </Button>
    )
}
