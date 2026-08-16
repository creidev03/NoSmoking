import { redirect } from "next/navigation";

// This page acts as a locale-aware entry point.
// The middleware redirects / to /es, so this page is reached
// when visiting /es or /en directly.
export default function LocalePage() {
  redirect("/es");
}
