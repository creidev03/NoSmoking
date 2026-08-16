import type { Appearance } from "@clerk/nextjs";

/**
 * Clerk appearance config — matches No Smoking's design system.
 * Primary: Verde Esperanza #10B981
 */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#10B981",
    colorBackground: "#ffffff",
    colorText: "#1F2937",
    colorInputBackground: "#ffffff",
    colorInputText: "#1F2937",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  },
  elements: {
    // Card wrapper
    card: {
      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
      border: "1px solid #E5E7EB",
      padding: "2rem",
    },
    // Header (logo + title)
    headerTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#1F2937",
    },
    headerSubtitle: {
      fontSize: "0.875rem",
      color: "#6B7280",
    },
    // Form fields
    formFieldLabel: {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#374151",
    },
    formFieldInput: {
      borderRadius: "0.5rem",
      border: "1px solid #E5E7EB",
      padding: "0.625rem 0.75rem",
      fontSize: "0.875rem",
      transition: "border-color 0.15s, box-shadow 0.15s",
      "&:focus": {
        borderColor: "#10B981",
        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.15)",
      },
    },
    // Primary button (Sign in, Continue, etc.)
    formButtonPrimary: {
      backgroundColor: "#10B981",
      fontSize: "0.875rem",
      fontWeight: "600",
      padding: "0.625rem 1.5rem",
      borderRadius: "0.5rem",
      transition: "background-color 0.15s, transform 0.1s",
      "&:hover": {
        backgroundColor: "#059669",
        transform: "translateY(-1px)",
      },
      "&:active": {
        transform: "translateY(0)",
      },
    },
    // Social buttons (Google, etc.)
    socialButtonsBlockButton: {
      border: "1px solid #E5E7EB",
      borderRadius: "0.5rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      padding: "0.5rem 1rem",
      transition: "background-color 0.15s, border-color 0.15s",
      "&:hover": {
        backgroundColor: "#F9FAFB",
        borderColor: "#D1D5DB",
      },
    },
    // Links (Forgot password, Sign up)
    footerActionLink: {
      color: "#10B981",
      fontWeight: "500",
      fontSize: "0.875rem",
      "&:hover": {
        color: "#059669",
      },
    },
    // Divider line
    dividerLine: {
      backgroundColor: "#E5E7EB",
    },
    dividerText: {
      color: "#6B7280",
      fontSize: "0.75rem",
    },
    // Error messages
    formFieldErrorText: {
      color: "#EF4444",
      fontSize: "0.75rem",
      marginTop: "0.25rem",
    },
    // Success state
    formFieldSuccessText: {
      color: "#10B981",
    },
    // OTP input
    otpInputField: {
      borderRadius: "0.5rem",
      border: "1px solid #E5E7EB",
      fontSize: "1rem",
      "&:focus": {
        borderColor: "#10B981",
        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.15)",
      },
    },
  },
};

/**
 * Dark mode variant — applied when .dark class is present
 */
export const clerkAppearanceDark: Appearance = {
  variables: {
    colorPrimary: "#10B981",
    colorBackground: "#111827",
    colorText: "#F3F4F6",
    colorInputBackground: "#1F2937",
    colorInputText: "#F3F4F6",
    borderRadius: "0.625rem",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  },
  elements: {
    card: {
      backgroundColor: "#1F2937",
      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
      border: "1px solid #374151",
    },
    headerTitle: {
      color: "#F3F4F6",
    },
    headerSubtitle: {
      color: "#9CA3AF",
    },
    formFieldLabel: {
      color: "#D1D5DB",
    },
    formFieldInput: {
      backgroundColor: "#111827",
      border: "1px solid #374151",
      color: "#F3F4F6",
      "&:focus": {
        borderColor: "#10B981",
        boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
      },
    },
    socialButtonsBlockButton: {
      backgroundColor: "#1F2937",
      border: "1px solid #374151",
      color: "#F3F4F6",
      "&:hover": {
        backgroundColor: "#374151",
        borderColor: "#4B5563",
      },
    },
    dividerLine: {
      backgroundColor: "#374151",
    },
    dividerText: {
      color: "#9CA3AF",
    },
    otpInputField: {
      backgroundColor: "#111827",
      border: "1px solid #374151",
      color: "#F3F4F6",
    },
  },
};
