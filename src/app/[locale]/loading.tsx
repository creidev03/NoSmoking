import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFFFF] dark:bg-[#111827]">
      <LoadingSpinner className="min-h-[100px] w-64" />
    </div>
  );
}
