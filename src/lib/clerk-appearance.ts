import type { Appearance } from "@clerk/nextjs";

/**
 * Clerk appearance config — No Smoking design system.
 * Minimal, clean, no Clerk branding.
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#10B981",
    colorBackground: "#ffffff",
    colorText: "#1F2937",
    colorInputBackground: "#F9FAFB",
    colorInputText: "#1F2937",
    colorTextSecondary: "#6B7280",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  },
  elements: {
    // Card — clean, minimal shadow
    card: {
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
      border: "none",
      padding: "2.5rem 2rem",
      borderRadius: "1rem",
    },
    // Header
    headerTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#111827",
      letterSpacing: "-0.01em",
    },
    headerSubtitle: {
      fontSize: "0.8125rem",
      color: "#9CA3AF",
      marginTop: "0.25rem",
    },
    // Form fields
    formFieldLabel: {
      fontSize: "0.8125rem",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "0.375rem",
    },
    formFieldInput: {
      borderRadius: "0.625rem",
      border: "1.5px solid #E5E7EB",
      backgroundColor: "#F9FAFB",
      padding: "0.75rem 1rem",
      fontSize: "0.875rem",
      transition: "all 0.15s ease",
      "&:focus": {
        borderColor: "#10B981",
        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
        backgroundColor: "#ffffff",
      },
    },
    // Primary button — full width, rounded, no arrow
    formButtonPrimary: {
      backgroundColor: "#10B981",
      fontSize: "0.875rem",
      fontWeight: "600",
      padding: "0.75rem 1.5rem",
      borderRadius: "0.625rem",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      transition: "all 0.15s ease",
      "&:hover": {
        backgroundColor: "#059669",
        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
        transform: "translateY(-1px)",
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow: "none",
      },
    },
    // Social buttons — outline style
    socialButtonsBlockButton: {
      border: "1.5px solid #E5E7EB",
      borderRadius: "0.625rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      padding: "0.625rem 1rem",
      backgroundColor: "#ffffff",
      transition: "all 0.15s ease",
      "&:hover": {
        backgroundColor: "#F9FAFB",
        borderColor: "#D1D5DB",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
      },
    },
    // Links
    footerActionLink: {
      color: "#10B981",
      fontWeight: "500",
      fontSize: "0.8125rem",
      "&:hover": {
        color: "#059669",
      },
    },
    footerActionText: {
      fontSize: "0.8125rem",
      color: "#9CA3AF",
    },
    // Divider
    dividerLine: {
      backgroundColor: "#F3F4F6",
      height: "1px",
    },
    dividerText: {
      color: "#D1D5DB",
      fontSize: "0.75rem",
      fontWeight: "400",
    },
    // Errors
    formFieldErrorText: {
      color: "#EF4444",
      fontSize: "0.75rem",
      marginTop: "0.25rem",
    },
    // Success
    formFieldSuccessText: {
      color: "#10B981",
    },
    // OTP
    otpInputField: {
      borderRadius: "0.625rem",
      border: "1.5px solid #E5E7EB",
      backgroundColor: "#F9FAFB",
      fontSize: "1.125rem",
      fontWeight: "500",
      "&:focus": {
        borderColor: "#10B981",
        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
        backgroundColor: "#ffffff",
      },
    },
    // HIDE CLERK BRANDING
    footer: {
      display: "none",
    },
    badge: {
      display: "none",
    },
    // Also hide "Development mode" banner
    developmentMode: {
      display: "none",
    },
    poweredByClerk: {
      display: "none",
    },
  },
};

/**
 * Dark mode variant
 */
export const clerkAppearanceDark: Appearance = {
  variables: {
    colorPrimary: "#10B981",
    colorBackground: "#111827",
    colorText: "#F3F4F6",
    colorInputBackground: "#1F2937",
    colorInputText: "#F3F4F6",
    colorTextSecondary: "#9CA3AF",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  },
  elements: {
    card: {
      backgroundColor: "#1F2937",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      border: "none",
    },
    headerTitle: {
      color: "#F9FAFB",
    },
    headerSubtitle: {
      color: "#6B7280",
    },
    formFieldLabel: {
      color: "#D1D5DB",
    },
    formFieldInput: {
      backgroundColor: "#111827",
      border: "1.5px solid #374151",
      color: "#F3F4F6",
      "&:focus": {
        borderColor: "#10B981",
        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.15)",
        backgroundColor: "#1a2332",
      },
    },
    socialButtonsBlockButton: {
      backgroundColor: "#111827",
      border: "1.5px solid #374151",
      color: "#F3F4F6",
      "&:hover": {
        backgroundColor: "#1F2937",
        borderColor: "#4B5563",
      },
    },
    footerActionLink: {
      color: "#10B981",
      "&:hover": {
        color: "#34D399",
      },
    },
    footerActionText: {
      color: "#6B7280",
    },
    dividerLine: {
      backgroundColor: "#374151",
    },
    dividerText: {
      color: "#4B5563",
    },
    otpInputField: {
      backgroundColor: "#111827",
      border: "1.5px solid #374151",
      color: "#F3F4F6",
    },
    // Hide branding in dark mode too
    footer: {
      display: "none",
    },
    badge: {
      display: "none",
    },
    developmentMode: {
      display: "none",
    },
    poweredByClerk: {
      display: "none",
    },
  },
};
