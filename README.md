# Shadcn Registry

A collection of modern, accessible, and customizable React components built on top of shadcn/ui. This registry extends the base shadcn/ui components with additional functionality and specialized components.

## Components

### Biometric Login
A secure authentication component that supports biometric authentication (fingerprint, face recognition) using the Web Authentication API.

#### Features
- Biometric registration and login
- Fallback to traditional authentication methods
- Secure credential management
- Cross-browser compatibility

#### Installation
```bash
pnpm dlx shadcn@latest add https://aperture.kaneleuc.com/r/biometric-login.json
```

#### Usage
```tsx
import { BiometricLogin } from "@/registry/new-york/blocks/biometric-login"

// Registration
<BiometricLogin.RegisterButton
  onSuccess={(credential) => console.log("Registration successful", credential)}
  onError={(error) => console.error("Registration failed", error)}
/>

// Login
<BiometricLogin.LoginButton
  onSuccess={(credential) => console.log("Login successful", credential)}
  onError={(error) => console.error("Login failed", error)}
/>
```

### Wake Lock Toggle
A component that allows users to control screen wake lock functionality, preventing the screen from turning off during specific activities.

#### Features
- Toggle screen wake lock
- Automatic handling of visibility changes
- Browser compatibility detection
- Customizable UI controls

#### Installation
```bash
pnpm dlx shadcn@latest add https://aperture.kaneleuc.com/r/wake-lock-toggle.json
```

#### Usage
```tsx
import { WakeLockToggle } from "@/registry/new-york/blocks/wake-lock-toggle"

<WakeLockToggle
  onActiveChange={(isActive) => console.log("Wake lock:", isActive)}
  onError={(error) => console.error("Wake lock error:", error)}
  onSupportedChange={(isSupported) => console.log("Wake lock supported:", isSupported)}
/>
```

### NFC Reader
A component for reading NFC tags and handling NFC-related interactions.

#### Features
- NFC tag reading
- Data parsing and handling
- Error handling
- Browser compatibility detection

#### Installation
```bash
pnpm dlx shadcn@latest add https://aperture.kaneleuc.com/r/nfc-reader.json
```

#### Usage
```tsx
import { NFCReader } from "@/registry/new-york/blocks/nfc-reader"

<NFCReader
  onRead={(data) => console.log("NFC data:", data)}
  onError={(error) => console.error("NFC error:", error)}
/>
```

### Share Button
A component that provides a consistent interface for the Web Share API across different platforms.

#### Features
- Native sharing capabilities
- Fallback sharing options
- Customizable share data
- Platform-specific optimizations

#### Installation
```bash
pnpm dlx shadcn@latest add https://aperture.kaneleuc.com/r/share-button.json
```

#### Usage
```tsx
import { ShareButton } from "@/registry/new-york/blocks/share-button"

<ShareButton
  data={{
    title: "Share this content",
    text: "Check out this amazing content!",
    url: "https://example.com"
  }}
  onSuccess={() => console.log("Share successful")}
  onError={(error) => console.error("Share failed", error)}
/>
```

## Browser Support

The components in this registry are designed to work with modern browsers that support the required Web APIs. Some features may have fallbacks or require polyfills for older browsers.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
