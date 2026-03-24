import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <div className="rounded-2xl border p-6 md:p-8">
        <Skeleton className="mb-4 h-6 w-40" />
        <Skeleton className="mb-2 h-10 w-3/4 max-w-md" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <div className="grid gap-8 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mx-auto aspect-square max-h-[200px] rounded-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
