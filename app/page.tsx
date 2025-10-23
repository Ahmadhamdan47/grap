import ArrivalsChart from "@/components/arrivals-chart"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-8">
      {/* Theme toggle button in top right */}
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>
      
      {/* Increased max width (~15% wider than 7xl ~1280px -> ~1470px) for larger chart display */}
      <div className="max-w-[92rem] mx-auto">
        <ArrivalsChart />
      </div>
    </main>
  )
}
