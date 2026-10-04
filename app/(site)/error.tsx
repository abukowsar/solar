"use client";
import ErrorView from "@/components/ErrorView";

export default function SiteError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView {...props} />;
}
