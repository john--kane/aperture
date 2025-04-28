"use client"
import { cn } from "@/lib/utils";
import { Button } from "@/registry/new-york/ui/button";
import { useState } from "react";

type ShareButtonProps = {
    title: string;
    text: string;
    url: string;
    children?: React.ReactNode;
    className?: string;
}

export function ShareButton({ title, text, url, className, children }: ShareButtonProps) {
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        if (isSharing) return;

        if (navigator.share && navigator.canShare({ title, text, url })) {
            try {
                setIsSharing(true);
                await navigator.share({ title, text, url });
            } catch (error) {
                // Only log actual errors, not user cancellations
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error("Error sharing:", error);
                }
            } finally {
                setIsSharing(false);
            }
        } else {
            alert("Sharing is not supported in this browser.");
        }
    };

    return <>
        <Button onClick={handleShare}
            type="button"
            disabled={isSharing}
            className={cn(className)}
            aria-label={`Share ${title}`}>
            {children || "Share"}
        </Button>
    </>
}