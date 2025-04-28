"use client"

import { WakeLockManager, type WakeLockState } from "@/registry/new-york/blocks/wake-lock-toggle/lib/wake-lock-utils"
import { Button } from "@/registry/new-york/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

type WakeLockToggleProps = {
    onActiveChange?: (isActive: boolean) => void
    onError?: (error: string | null) => void
    onSupportedChange?: (isSupported: boolean) => void
    activeControl?: React.ReactNode
    inactiveControl?: React.ReactNode
}

export default function WakeLockToggle({
    onActiveChange,
    onError,
    onSupportedChange,
    activeControl,
    inactiveControl
}: WakeLockToggleProps) {
    const [wakeLockManager] = useState(() => new WakeLockManager())
    const [state, setState] = useState<WakeLockState>(wakeLockManager.getState())

    // Update state when wake lock manager state changes
    useEffect(() => {
        setState(wakeLockManager.getState())
    }, [])

    // Handle visibility change events
    useEffect(() => {
        const handleVisibilityChange = async () => {
            const newState = await wakeLockManager.handleVisibilityChange()
            setState(newState)
            if (newState.error) {
                onError?.(newState.error.message)
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            wakeLockManager.releaseWakeLock()
        }
    }, [onError])

    // Notify parent components of state changes
    useEffect(() => {
        onActiveChange?.(state.isActive)
        onSupportedChange?.(state.isSupported)
        if (state.error) {
            onError?.(state.error.message)
        }
    }, [state, onActiveChange, onSupportedChange, onError])

    const toggleWakeLock = async () => {
        const newState = state.isActive
            ? await wakeLockManager.releaseWakeLock()
            : await wakeLockManager.requestWakeLock()
        setState(newState)
    }

    if (state.isSupported === false) {
        return <Button disabled>Not Supported</Button>
    }

    if (activeControl && inactiveControl) {
        return (
            <div onClick={toggleWakeLock} style={{ cursor: 'pointer' }}>
                {state.isActive ? activeControl : inactiveControl}
            </div>
        )
    }

    return (
        <Button
            variant={state.isActive ? "outline" : "default"}
            size="lg"
            onClick={toggleWakeLock}
            className="gap-2"
            aria-pressed={state.isActive}
        >
            {state.isActive ? (
                <>
                    <Moon className="h-4 w-4" />
                    <span>Allow Screen to Sleep</span>
                </>
            ) : (
                <>
                    <Sun className="h-4 w-4" />
                    <span>Keep Screen Awake</span>
                </>
            )}
        </Button>
    )
}
