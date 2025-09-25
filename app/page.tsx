import ArrivalsChart from "@/components/arrivals-chart"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Arrivals Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Interactive visualization of Real Arrivals, Estimated Arrivals, and UL Number of Tests
          </p>
        </div>
        <ArrivalsChart />
      </div>
    </main>
  )
}
