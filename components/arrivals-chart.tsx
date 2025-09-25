"use client"

import { useEffect, useRef, useState } from "react"
import * as echarts from "echarts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import the JSON data
const chartData = {
  months: ["Jul-21", "Aug-21", "Sep-21", "Oct-21", "Nov-21", "Dec-21", "Jan-22"],
  arrivals: [355979, 208033, 183225, 192837, 156665, 242955, 51077],
  arrivals_cumulative: [355979, 564012, 747237, 940074, 1096739, 1339694, 1390771],
  percentage: ["26%", "15%", "13%", "14%", "11%", "17%", "4%"],
  ul_number_of_tests: {
    total: 1000000,
    monthly: {
      "Jul-21": 255958,
      "Aug-21": 149581,
      "Sep-21": 131744,
      "Oct-21": 138655,
      "Nov-21": 112646,
      "Dec-21": 174691,
      "Jan-22": 36725,
    },
  },
  estimated_number_of_tests: {
    total: 1221378,
    monthly: {
      "Jul-21": 312622,
      "Aug-21": 182695,
      "Sep-21": 160909,
      "Oct-21": 169350,
      "Nov-21": 137584,
      "Dec-21": 213364,
      "Jan-22": 44856,
    },
  },
}

// Phase definitions (Phase 2 data is available, others are placeholders)
const phases = {
  all: {
    name: "All Phases",
    period: "01-07-2020 to 28-02-2022",
    months: [
      // Phase 1 months
      "Jul-20",
      "Aug-20",
      "Sep-20",
      "Oct-20",
      "Nov-20",
      "Dec-20",
      "Jan-21",
      "Feb-21",
      "Mar-21",
      "Apr-21",
      "May-21",
      "Jun-21",
      // Phase 2 months
      "Jul-21",
      "Aug-21",
      "Sep-21",
      "Oct-21",
      "Nov-21",
      "Dec-21",
      "Jan-22",
      // Phase 3 months
      "Feb-22",
    ],
    arrivals: [
      // Phase 1 data (placeholder)
      280000,
      190000,
      160000,
      175000,
      140000,
      220000,
      45000,
      38000,
      42000,
      48000,
      52000,
      58000,
      // Phase 2 data (real)
      ...chartData.arrivals,
      // Phase 3 data (placeholder)
      52000,
    ],
    estimatedTests: [
      // Phase 1 data (placeholder)
      340000,
      230000,
      195000,
      213000,
      170000,
      268000,
      55000,
      46000,
      51000,
      58000,
      63000,
      70000,
      // Phase 2 data (real)
      ...Object.values(chartData.estimated_number_of_tests.monthly),
      // Phase 3 data (placeholder)
      63000,
    ],
    ulTests: [
      // Phase 1 data (placeholder)
      290000,
      200000,
      170000,
      185000,
      150000,
      240000,
      48000,
      41000,
      45000,
      51000,
      56000,
      62000,
      // Phase 2 data (real)
      ...Object.values(chartData.ul_number_of_tests.monthly),
      // Phase 3 data (placeholder)
      56000,
    ],
  },
  phase1: {
    name: "Phase 1",
    period: "01-07-2020 to 30-06-2021",
    months: [
      "Jul-20",
      "Aug-20",
      "Sep-20",
      "Oct-20",
      "Nov-20",
      "Dec-20",
      "Jan-21",
      "Feb-21",
      "Mar-21",
      "Apr-21",
      "May-21",
      "Jun-21",
    ],
    // Placeholder data - replace with actual data when available
    arrivals: [280000, 190000, 160000, 175000, 140000, 220000, 45000, 38000, 42000, 48000, 52000, 58000],
    estimatedTests: [340000, 230000, 195000, 213000, 170000, 268000, 55000, 46000, 51000, 58000, 63000, 70000],
    ulTests: [290000, 200000, 170000, 185000, 150000, 240000, 48000, 41000, 45000, 51000, 56000, 62000],
  },
  phase2: {
    name: "Phase 2",
    period: "01-07-2021 to 09-01-2022",
    months: chartData.months,
    arrivals: chartData.arrivals,
    estimatedTests: Object.values(chartData.estimated_number_of_tests.monthly),
    ulTests: Object.values(chartData.ul_number_of_tests.monthly),
  },
  phase3: {
    name: "Phase 3",
    period: "10-01-2022 to 28-02-2022",
    months: ["Feb-22"],
    // Placeholder data - replace with actual data when available
    arrivals: [52000],
    estimatedTests: [63000],
    ulTests: [56000],
  },
}

export default function ArrivalsChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<keyof typeof phases>("all")
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"))
    }

    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current, isDarkMode ? "dark" : undefined)

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chartInstance.current?.dispose()
    }
  }, [isDarkMode])

  useEffect(() => {
    if (!chartInstance.current) return

    const currentPhase = phases[selectedPhase]

    const option: echarts.EChartsOption = {
      title: {
        text: `${currentPhase.name} - Arrivals Analysis`,
        subtext: currentPhase.period,
        left: "center",
        textStyle: {
          fontSize: 20,
          fontWeight: "bold",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`
          params.forEach((param: any) => {
            result += `${param.marker} ${param.seriesName}: ${param.value.toLocaleString()}<br/>`
          })
          return result
        },
      },
      legend: {
        data: ["Real Arrivals", "Estimated Arrivals", "UL Number of Tests"],
        top: 60,
        left: "center",
        selectedMode: true, // Enable legend click to toggle series visibility
        selector: false,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%", // Increased bottom margin for data zoom
        top: 120,
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {
            title: "Save as Image",
          },
          dataZoom: {
            title: {
              zoom: "Zoom",
              back: "Reset Zoom",
            },
          },
          restore: {
            title: "Restore",
          },
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: currentPhase.months,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 350000,
        interval: 50000,
        axisLabel: {
          formatter: (value: number) => value / 1000 + "k",
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            opacity: 0.3,
          },
        },
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          throttle: 100,
        },
        {
          type: "slider",
          start: 0,
          end: 100,
          height: 40,
          bottom: 10,
          show: true,
          backgroundColor: "transparent",
          fillerColor: isDarkMode ? "rgba(107, 114, 128, 0.2)" : "rgba(229, 231, 235, 0.2)",
          borderColor: isDarkMode ? "#6b7280" : "#d1d5db",
          handleStyle: {
            color: isDarkMode ? "#9ca3af" : "#6b7280",
            borderColor: isDarkMode ? "#d1d5db" : "#9ca3af",
          },
          textStyle: {
            color: isDarkMode ? "#e5e7eb" : "#374151",
          },
          brushSelect: true,
        },
      ],
      series: [
        {
          name: "Real Arrivals",
          type: "line",
          stack: false,
          data: currentPhase.arrivals,
          smooth: true,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: "#6b7280",
          },
          areaStyle: {
            opacity: 0.1,
            color: "#6b7280",
          },
          emphasis: {
            focus: "series",
          },
          legendHoverLink: true,
        },
        {
          name: "Estimated Arrivals",
          type: "line",
          stack: false,
          data: currentPhase.estimatedTests,
          smooth: true,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: "#000000",
          },
          areaStyle: {
            opacity: 0.1,
            color: "#000000",
          },
          emphasis: {
            focus: "series",
          },
          legendHoverLink: true,
        },
        {
          name: "UL Number of Tests",
          type: "line",
          stack: false,
          data: currentPhase.ulTests,
          smooth: true,
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: "#3b82f6",
          },
          areaStyle: {
            opacity: 0.1,
            color: "#3b82f6",
          },
          emphasis: {
            focus: "series",
          },
          legendHoverLink: true,
        },
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: "cubicOut",
    }

    console.log("[v0] Updating chart for phase:", selectedPhase)
    console.log("[v0] Chart instance exists:", !!chartInstance.current)

    chartInstance.current.setOption(option, true)

    // Add event listeners for debugging
    chartInstance.current.on("legendselectchanged", (params: any) => {
      console.log("[v0] Legend clicked:", params.name, "Selected:", params.selected)
    })

    chartInstance.current.on("datazoom", (params: any) => {
      console.log("[v0] Data zoom event:", params)
    })
  }, [selectedPhase, isDarkMode]) // Added isDarkMode dependency for data zoom styling

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl">Interactive Arrivals Chart</CardTitle>
          <Select value={selectedPhase} onValueChange={(value) => setSelectedPhase(value as keyof typeof phases)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select phase" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(phases).map(([key, phase]) => (
                <SelectItem key={key} value={key}>
                  {phase.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a phase to view the corresponding data. All phases are shown by default.
        </p>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full h-[600px]" style={{ minHeight: "600px" }} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {phases[selectedPhase].arrivals.reduce((a, b) => a + b, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Real Arrivals</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
            <div className="text-2xl font-bold text-black dark:text-white">
              {phases[selectedPhase].estimatedTests.reduce((a, b) => a + b, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Estimated Arrivals</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {phases[selectedPhase].ulTests.reduce((a, b) => a + b, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total UL Tests</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
