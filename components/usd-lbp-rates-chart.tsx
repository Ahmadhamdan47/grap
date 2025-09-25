"use client"

import { useEffect, useRef, useState } from "react"
import * as echarts from "echarts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Real exchange rate data extracted from CSV file
// Monthly averages for the same time period as arrivals chart: July 2020 to February 2022
const processExchangeRateData = () => {
  const phases = {
    all: {
      name: "All Phases",
      period: "01-07-2020 to 28-02-2022",
      months: [
        // Phase 1 months (Jul 2020 - Jun 2021)
        "Jul-20", "Aug-20", "Sep-20", "Oct-20", "Nov-20", "Dec-20",
        "Jan-21", "Feb-21", "Mar-21", "Apr-21", "May-21", "Jun-21",
        // Phase 2 months (Jul 2021 - Jan 2022)
        "Jul-21", "Aug-21", "Sep-21", "Oct-21", "Nov-21", "Dec-21", "Jan-22",
        // Phase 3 months (Feb 2022)
        "Feb-22",
      ],
      // Real exchange rates from CSV data (monthly averages)
      rates: [
        // Phase 1 - gradual increase from ~8000 to 15000 LBP
        8081, 7433, 7686, 7803, 7820, 8286,   // Jul-Dec 2020
        8762, 9138, 11708, 12201, 12713, 15274, // Jan-Jun 2021
        // Phase 2 - rapid devaluation to ~26000 LBP
        19408, 19587, 16479, 19691, 22900, 25911, 26493, // Jul 2021 - Jan 2022
        // Phase 3 - slight recovery
        20938, // Feb 2022
      ],
    },
    phase1: {
      name: "Phase 1",
      period: "01-07-2020 to 30-06-2021",
      months: [
        "Jul-20", "Aug-20", "Sep-20", "Oct-20", "Nov-20", "Dec-20",
        "Jan-21", "Feb-21", "Mar-21", "Apr-21", "May-21", "Jun-21",
      ],
      rates: [8081, 7433, 7686, 7803, 7820, 8286, 8762, 9138, 11708, 12201, 12713, 15274],
    },
    phase2: {
      name: "Phase 2", 
      period: "01-07-2021 to 09-01-2022",
      months: ["Jul-21", "Aug-21", "Sep-21", "Oct-21", "Nov-21", "Dec-21", "Jan-22"],
      rates: [19408, 19587, 16479, 19691, 22900, 25911, 26493],
    },
    phase3: {
      name: "Phase 3",
      period: "10-01-2022 to 28-02-2022", 
      months: ["Feb-22"],
      rates: [20938],
    },
  }
  
  return phases
}

export default function UsdLbpRatesChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<"all" | "phase1" | "phase2" | "phase3">("all")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [phaseVisibility, setPhaseVisibility] = useState({
    phase1: true,
    phase2: true,
    phase3: true,
  })

  const phases = processExchangeRateData()

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

  const togglePhase = (phase: keyof typeof phaseVisibility) => {
    setPhaseVisibility(prev => ({
      ...prev,
      [phase]: !prev[phase]
    }))
  }

  // Filter current phase data based on phase visibility
  const getFilteredPhaseData = () => {
    if (selectedPhase !== 'all') {
      return phases[selectedPhase]
    }
    
    // For 'all' phase, filter based on phase visibility
    const allPhase = phases.all
    const filteredData = {
      ...allPhase,
      rates: allPhase.rates.map((value, index) => {
        if (index < 12 && !phaseVisibility.phase1) return null
        if (index >= 12 && index < 19 && !phaseVisibility.phase2) return null
        if (index >= 19 && !phaseVisibility.phase3) return null
        return value
      }),
    }
    return filteredData
  }

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

    const currentPhase = getFilteredPhaseData()
    
    // Convert positive rates to negative values for display
    const negativeRates = currentPhase.rates.map(rate => rate !== null ? -rate : null)

    const option: echarts.EChartsOption = {
      title: {
        text: `${currentPhase.name} - USD to LBP Exchange Rates`,
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
            if (param.value !== null && param.value !== undefined) {
              // Show positive value in tooltip even though chart shows negative
              const positiveValue = Math.abs(param.value)
              result += `${param.marker} ${param.seriesName}: ${positiveValue.toLocaleString()} LBP<br/>`
            }
          })
          return result
        },
      },
      legend: {
        show: false,
      },
      grid: {
        left: "5%",
        right: "4%",
        bottom: "15%",
        top: 80,
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
        min: -30000, // Adjusted range to fit actual data (-26,493 to -7,433)
        max: -7000,
        axisLabel: {
          formatter: (value: number) => {
            // Show positive values on axis labels
            const positiveValue = Math.abs(value)
            if (positiveValue >= 1000) {
              return (positiveValue / 1000).toFixed(0) + "k LBP"
            }
            return positiveValue.toString() + " LBP"
          },
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
          name: "USD to LBP Rate",
          type: "line",
          data: negativeRates,
          smooth: true,
          connectNulls: false,
          lineStyle: {
            width: 3,
            color: "#ef4444", // Red color for devaluation
          },
          itemStyle: {
            color: "#ef4444",
          },
          areaStyle: {
            opacity: 0.1,
            color: "#ef4444",
          },
          emphasis: {
            focus: "series",
          },
        },
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: "cubicOut",
    }

    chartInstance.current.setOption(option, true)
  }, [selectedPhase, isDarkMode, phaseVisibility])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle className="text-2xl text-center">USD to LBP Exchange Rates</CardTitle>
          
          {/* Phase Toggle Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedPhase('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPhase === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Phases
            </button>
            {Object.entries(phases)
              .filter(([key]) => key !== 'all')
              .map(([key, phase]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPhase(key as keyof typeof phases)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedPhase === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {phase.name}
                </button>
              ))}
          </div>

          {selectedPhase === 'all' && (
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-sm text-muted-foreground">Toggle Phases:</span>
              {Object.entries(phases)
                .filter(([key]) => key !== 'all')
                .map(([key, phase]) => (
                  <button
                    key={key}
                    onClick={() => togglePhase(key.replace('phase', 'phase') as keyof typeof phaseVisibility)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      phaseVisibility[key.replace('phase', 'phase') as keyof typeof phaseVisibility]
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {phase.name}
                  </button>
                ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Exchange rates are displayed on negative Y-axis. Red line shows LBP devaluation over time.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full h-[600px]" style={{ minHeight: "600px" }} />
        
        {/* Summary Card */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
            <div className="text-2xl font-bold text-red-600">
              {(() => {
                const currentPhase = getFilteredPhaseData()
                const validRates = currentPhase.rates.filter((v): v is number => v !== null) as number[]
                return validRates.length > 0 ? `${Math.min(...validRates).toLocaleString()} LBP` : 'N/A'
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Best Rate (Lowest)</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900/30">
            <div className="text-2xl font-bold text-red-700">
              {(() => {
                const currentPhase = getFilteredPhaseData()
                const validRates = currentPhase.rates.filter((v): v is number => v !== null) as number[]
                return validRates.length > 0 ? `${Math.max(...validRates).toLocaleString()} LBP` : 'N/A'
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Worst Rate (Highest)</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <div className="text-2xl font-bold text-amber-600">
              {(() => {
                const currentPhase = getFilteredPhaseData()
                const validRates = currentPhase.rates.filter((v): v is number => v !== null) as number[]
                if (validRates.length === 0) return 'N/A'
                const maxRate = Math.max(...validRates)
                const minRate = Math.min(...validRates)
                const devaluation = ((maxRate - minRate) / minRate * 100).toFixed(1)
                return `${devaluation}%`
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Total Devaluation</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}