import { Suspense } from "react"
import FlightDashboard from "@/components/v0-import/flight-dashboard"
import { Skeleton } from "@/components/v0-import/ui/skeleton"

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Flight Tracking Admin Panel</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <FlightDashboard />
      </Suspense>
    </main>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-[500px] w-full" />
    </div>
  )
}

