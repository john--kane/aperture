export interface WakeLockError {
    message: string;
    code?: string;
}

export interface WakeLockState {
    isActive: boolean;
    isSupported: boolean;
    error: WakeLockError | null;
}

export class WakeLockManager {
    private wakeLock: any = null;
    private state: WakeLockState = {
        isActive: false,
        isSupported: false,
        error: null
    };

    constructor() {
        this.checkSupport();
    }

    private checkSupport() {
        this.state.isSupported = "wakeLock" in navigator && typeof navigator.wakeLock?.request === "function";
    }

    public getState(): WakeLockState {
        return { ...this.state };
    }

    public async requestWakeLock(): Promise<WakeLockState> {
        if (!this.state.isSupported) {
            this.state.error = {
                message: "Wake Lock API is not supported in this browser"
            };
            return this.getState();
        }

        try {
            if (!navigator.wakeLock) {
                throw new Error("Wake Lock API is not available");
            }

            const lock = await navigator.wakeLock.request("screen");
            if (!lock) {
                throw new Error("Wake lock request failed");
            }

            this.wakeLock = lock;
            this.state.isActive = true;
            this.state.error = null;

            lock.addEventListener("release", () => {
                this.state.isActive = false;
                this.wakeLock = null;
            });

            return this.getState();
        } catch (err) {
            this.state.isActive = false;
            this.state.error = {
                message: err instanceof Error
                    ? err.message.includes("Permission was denied")
                        ? "Please allow screen wake lock in your browser settings"
                        : `Wake lock request failed: ${err.message}`
                    : "Wake lock request failed with an unknown error"
            };
            return this.getState();
        }
    }

    public async releaseWakeLock(): Promise<WakeLockState> {
        if (!this.wakeLock) {
            return this.getState();
        }

        try {
            await this.wakeLock.release();
            this.state.isActive = false;
            this.wakeLock = null;
            this.state.error = null;
            return this.getState();
        } catch (err) {
            this.state.error = {
                message: err instanceof Error
                    ? `Failed to release wake lock: ${err.message}`
                    : "Failed to release wake lock with an unknown error"
            };
            return this.getState();
        }
    }

    public async handleVisibilityChange(): Promise<WakeLockState> {
        if (this.state.isActive && document.visibilityState === "visible") {
            try {
                return await this.requestWakeLock();
            } catch (err) {
                this.state.error = {
                    message: err instanceof Error ? err.message : "Failed to re-acquire wake lock"
                };
                return this.getState();
            }
        }
        return this.getState();
    }
} 