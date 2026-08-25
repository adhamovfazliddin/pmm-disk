import SkeletonTable from "@/components/ui/SkeletonTable";
import { Skeleton } from "@/components/ui/Skeleton";

export default function TeachersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full sm:max-w-xs" />
        <Skeleton className="h-10 w-full sm:w-40" />
      </div>

      <SkeletonTable rows={5} />
    </div>
  );
}
