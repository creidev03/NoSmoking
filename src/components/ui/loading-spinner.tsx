import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.ComponentProps<"div"> {}

export function LoadingSpinner({ className, ...props }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "min-h-[200px] w-full animate-pulse rounded-lg bg-muted",
        className
      )}
      {...props}
    />
  );
}
