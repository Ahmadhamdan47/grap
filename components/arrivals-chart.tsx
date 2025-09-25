"use client"

import { useEffect, useRef, useState } from "react"
import * as echarts from "echarts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import the JSON data
const chartData = {
  months: ["Jul-21", "Aug-21", "Sep-21", "Oct-21", "Nov-21", "Dec-21", "Jan-22"],
  arrivals: [355979, 208033, 183225, 192837, 156665, 242955, 51077], // Arrivals (Manifest)
  arrivals_cumulative: [355979, 564012, 747237, 940074, 1096739, 1339694, 1390771], // Cumulative for chart continuity
  estimated: [312622, 182695, 160909, 169350, 137584, 213364, 44856], // Estimated (monthly)
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
    total: 1216570, // Updated total based on new estimated data
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

// USD to LBP exchange rate data (monthly averages from CSV)
const exchangeRateData = {
  all: [
    // Phase 1 rates (Jul 2020 - Jun 2021)
    -8081, -7433, -7686, -7803, -7820, -8286,   // Jul-Dec 2020
    -8762, -9138, -11708, -12201, -12713, -15274, // Jan-Jun 2021
    // Phase 2 rates (Jul 2021 - Jan 2022) - negative for display below X-axis
    -19408, -19587, -16479, -19691, -22900, -25911, -26493, // Jul 2021 - Jan 2022
    // Phase 3 rates (Feb 2022)
    -20938, // Feb 2022
  ],
  phase1: [-8081, -7433, -7686, -7803, -7820, -8286, -8762, -9138, -11708, -12201, -12713, -15274],
  phase2: [-19408, -19587, -16479, -19691, -22900, -25911, -26493],
  phase3: [-20938],
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
      // Phase 1 data (no real data available)
      null, null, null, null, null, null,
      null, null, null, null, null, null,
      // Phase 2 data (real)
      ...chartData.arrivals,
      // Phase 3 data (no real data available)
      null,
    ],
    estimatedArrivals: [
      // Phase 1 data (no real data available)
      null, null, null, null, null, null,
      null, null, null, null, null, null,
      // Phase 2 data (real monthly estimated)
      ...chartData.estimated,
      // Phase 3 data (no real data available)
      null,
    ],
    ulTests: [
      // Phase 1 data (no real data available)
      null, null, null, null, null, null,
      null, null, null, null, null, null,
      // Phase 2 data (real)
      ...Object.values(chartData.ul_number_of_tests.monthly),
      // Phase 3 data (no real data available)
      null,
    ],
    exchangeRates: exchangeRateData.all,
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
    // No real data available - using null to hide lines
    arrivals: [null, null, null, null, null, null, null, null, null, null, null, null],
    estimatedArrivals: [null, null, null, null, null, null, null, null, null, null, null, null],
    ulTests: [null, null, null, null, null, null, null, null, null, null, null, null],
    exchangeRates: exchangeRateData.phase1,
  },
  phase2: {
    name: "Phase 2",
    period: "01-07-2021 to 09-01-2022",
    months: chartData.months,
    arrivals: chartData.arrivals, // Arrivals (Manifest)
    estimatedArrivals: chartData.estimated, // Estimated (monthly)
    ulTests: Object.values(chartData.ul_number_of_tests.monthly),
    exchangeRates: exchangeRateData.phase2,
  },
  phase3: {
    name: "Phase 3",
    period: "10-01-2022 to 28-02-2022",
    months: ["Feb-22"],
    // No real data available - using null to hide lines
    arrivals: [null],
    estimatedArrivals: [null], 
    ulTests: [null],
    exchangeRates: exchangeRateData.phase3,
  },
}

export default function ArrivalsChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<keyof typeof phases>("all")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [seriesVisibility, setSeriesVisibility] = useState({
    manifest: true,
    estimated: true,
    ul: true,
    exchangeRate: true,
  })
  const [phaseVisibility, setPhaseVisibility] = useState({
    phase1: true,
    phase2: true,
    phase3: true,
  })

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

  // Toggle functions and data filtering
  const toggleSeries = (series: keyof typeof seriesVisibility) => {
    setSeriesVisibility(prev => ({
      ...prev,
      [series]: !prev[series]
    }))
  }

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
      arrivals: allPhase.arrivals.map((value, index) => {
        if (index < 12 && !phaseVisibility.phase1) return null
        if (index >= 12 && index < 19 && !phaseVisibility.phase2) return null
        if (index >= 19 && !phaseVisibility.phase3) return null
        return value
      }),
      estimatedArrivals: allPhase.estimatedArrivals.map((value, index) => {
        if (index < 12 && !phaseVisibility.phase1) return null
        if (index >= 12 && index < 19 && !phaseVisibility.phase2) return null
        if (index >= 19 && !phaseVisibility.phase3) return null
        return value
      }),
      ulTests: allPhase.ulTests.map((value, index) => {
        if (index < 12 && !phaseVisibility.phase1) return null
        if (index >= 12 && index < 19 && !phaseVisibility.phase2) return null
        if (index >= 19 && !phaseVisibility.phase3) return null
        return value
      }),
      exchangeRates: allPhase.exchangeRates.map((value, index) => {
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

    // Custom scaling transformation for exchange rates
    // Positive axis: 0 to 400k (arrivals) with 50k increments = 8 intervals
    // Negative axis: 0 to -40k (exchange rates) with 5k increments = 8 intervals (INVERTED)
    // This creates proportional scaling where -40k LBP maps to same visual distance as 400k arrivals
    
    const transformExchangeRate = (rate: number | null): number | null => {
      if (rate === null) return null
      const absoluteRate = Math.abs(rate)
      
      // Invert the rate: higher rates (worse currency) should appear closer to zero
      // Map 40k LBP -> 0 (closest to zero line) and 1515 LBP -> -40k visual (furthest from zero)
      const maxRate = 40000
      const minRate = 1515
      
      // Invert the scale: higher actual rates become smaller visual values
      const invertedRate = maxRate - absoluteRate + minRate
      
      // Scale factor to match visual distance: 400000 / 40000 = 10
      const scaleFactor = 10
      return -(invertedRate * scaleFactor)
    }

    // Transform exchange rate data for display
    const transformedExchangeRates = currentPhase.exchangeRates.map(transformExchangeRate)

    const option: echarts.EChartsOption = {
      title: {
        text: `${currentPhase.name} - Arrivals Analysis & Exchange Rates`,
        subtext: `${currentPhase.period} • Arrivals above zero, Exchange rates below zero`,
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
            // Only show tooltip for non-null values
            if (param.value !== null && param.value !== undefined) {
              if (param.seriesName === 'USD to LBP Rate') {
                // Convert back from scaled and inverted value to actual LBP rate
                const scaledValue = Math.abs(param.value) / 10; // Reverse the scale factor
                const actualLBPRate = 40000 - scaledValue + 1515; // Reverse the inversion
                result += `${param.marker} ${param.seriesName}: ${actualLBPRate.toLocaleString()} LBP<br/>`
              } else {
                result += `${param.marker} ${param.seriesName}: ${param.value.toLocaleString()}<br/>`
              }
            }
          })
          return result
        },
      },
      legend: {
        show: false, // Hide default legend
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%", // Increased bottom margin for data zoom
        top: 80, // Reduced since no legend
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
        name: "Arrivals (above) / Exchange Rate (below)",
        position: "left",
        min: -400000, // Visual range that corresponds to -40k LBP
        max: 400000,  // Max arrivals range
        interval: 50000, // 50k intervals for both sides
        axisLabel: {
          formatter: (value: number) => {
            if (value === 0) return "0";
            if (value > 0) {
              // Positive values - arrivals data
              if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
              return (value / 1000).toFixed(0) + "k";
            } else {
              // Negative values - exchange rates (inverted scale)
              // Convert back to actual scale and invert
              const scaledValue = Math.abs(value) / 10; // Reverse the scale factor
              const invertedValue = 40000 - scaledValue; // Invert: 0->40k, 5k->35k, etc.
              
              if (invertedValue <= 0) return "1515 LBP"; // Bottom value
              
              if (invertedValue >= 1000) {
                return (invertedValue / 1000).toFixed(0) + "k LBP";
              }
              return invertedValue.toString() + " LBP";
            }
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
            opacity: 0.3,
          },
        },
        // Add a reference line at y=0
        axisLine: {
          show: true,
          lineStyle: {
            color: '#333',
            width: 2,
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
          name: "Manifest",
          type: "line",
          data: seriesVisibility.manifest ? currentPhase.arrivals : [],
          smooth: true,
          connectNulls: false, // Don't connect across null values
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: "#6b7280", // Grey color for Real Arrivals
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
          name: "Estimated",
          type: "line",
          data: seriesVisibility.estimated ? currentPhase.estimatedArrivals : [],
          smooth: true,
          connectNulls: false, // Don't connect across null values
          lineStyle: {
            width: 3,
          },
          itemStyle: {
            color: "#000000", // Black color for Estimated Arrivals
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
          name: "UL",
          type: "line",
          data: seriesVisibility.ul ? currentPhase.ulTests : [],
          smooth: true,
          connectNulls: false, // Don't connect across null values
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
        {
          name: "USD to LBP Rate",
          type: "line",
          data: seriesVisibility.exchangeRate ? transformedExchangeRates : [],
          smooth: true,
          connectNulls: false,
          lineStyle: {
            width: 3,
            type: "dashed",
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
          legendHoverLink: true,
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#666',
              width: 2,
              type: 'solid'
            },
            data: [{
              yAxis: 0,
              label: {
                show: true,
                position: 'insideEndTop',
                formatter: 'Zero Line',
                color: '#666',
                fontSize: 12
              }
            }]
          },
        },
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: "cubicOut",
    }

    console.log("📊 Updating chart for phase:", selectedPhase)
    console.log("📊 Chart instance exists:", !!chartInstance.current)
    console.log("📊 Current phase data:", {
      arrivals: currentPhase.arrivals?.slice(0, 3),
      estimated: currentPhase.estimatedArrivals?.slice(0, 3), 
      ulTests: currentPhase.ulTests?.slice(0, 3)
    })

    chartInstance.current.setOption(option, true)

    // Add event listeners for debugging
    chartInstance.current.on("legendselectchanged", (params: any) => {
      console.log(" Legend clicked:", params.name, "Selected:", params.selected)
    })

    chartInstance.current.on("datazoom", (params: any) => {
      console.log("Data zoom event:", params)
    })
  }, [selectedPhase, isDarkMode, seriesVisibility, phaseVisibility]) // Added phaseVisibility dependency

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle className="text-2xl text-center">Interactive Arrivals Chart & USD to LBP Exchange Rates</CardTitle>
          
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


          <p className="text-sm text-muted-foreground text-center">
            Arrivals data (0-400k with 50k increments) above zero, USD to LBP exchange rates (40k to 1515 LBP, inverted scale) below zero. 
            Both scales cover the same visual distance for proportional comparison. Click the cards below to toggle data series visibility.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full h-[600px]" style={{ minHeight: "600px" }} />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => toggleSeries('manifest')}
            className={`text-center p-4 rounded-lg transition-all duration-200 ${
              seriesVisibility.manifest
                ? 'bg-gray-50 dark:bg-gray-950/20 hover:bg-gray-100 dark:hover:bg-gray-950/30'
                : 'bg-gray-200 dark:bg-gray-800 opacity-50'
            }`}
          >
            <div className={`text-2xl font-bold ${
              seriesVisibility.manifest ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {(() => {
                const currentPhase = getFilteredPhaseData()
                const validValues = currentPhase.arrivals.filter((v): v is number => v !== null);
                let sum = 0;
                (validValues as number[]).forEach(value => sum += value);
                return sum.toLocaleString();
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Total Manifest</div>
            <div className="text-xs text-muted-foreground mt-1">
              {seriesVisibility.manifest ? 'Click to hide' : 'Click to show'}
            </div>
          </button>
          <button
            onClick={() => toggleSeries('estimated')}
            className={`text-center p-4 rounded-lg transition-all duration-200 ${
              seriesVisibility.estimated
                ? 'bg-gray-50 dark:bg-gray-950/20 hover:bg-gray-100 dark:hover:bg-gray-950/30'
                : 'bg-gray-200 dark:bg-gray-800 opacity-50'
            }`}
          >
            <div className={`text-2xl font-bold ${
              seriesVisibility.estimated ? 'text-black dark:text-white' : 'text-gray-400'
            }`}>
              {(() => {
                const currentPhase = getFilteredPhaseData()
                const validValues = currentPhase.estimatedArrivals.filter((v): v is number => v !== null);
                let sum = 0;
                (validValues as number[]).forEach(value => sum += value);
                return sum.toLocaleString();
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Total Estimated</div>
            <div className="text-xs text-muted-foreground mt-1">
              {seriesVisibility.estimated ? 'Click to hide' : 'Click to show'}
            </div>
          </button>
          <button
            onClick={() => toggleSeries('ul')}
            className={`text-center p-4 rounded-lg transition-all duration-200 ${
              seriesVisibility.ul
                ? 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30'
                : 'bg-gray-200 dark:bg-gray-800 opacity-50'
            }`}
          >
            <div className={`text-2xl font-bold ${
              seriesVisibility.ul ? 'text-blue-600' : 'text-gray-400'
            }`}>
              {(() => {
                const currentPhase = getFilteredPhaseData()
                const validValues = currentPhase.ulTests.filter((v): v is number => v !== null);
                let sum = 0;
                (validValues as number[]).forEach(value => sum += value);
                return sum.toLocaleString();
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Total UL</div>
            <div className="text-xs text-muted-foreground mt-1">
              {seriesVisibility.ul ? 'Click to hide' : 'Click to show'}
            </div>
          </button>
          <button
            onClick={() => toggleSeries('exchangeRate')}
            className={`text-center p-4 rounded-lg transition-all duration-200 ${
              seriesVisibility.exchangeRate
                ? 'bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30'
                : 'bg-gray-200 dark:bg-gray-800 opacity-50'
            }`}
          >
            <div className={`text-2xl font-bold ${
              seriesVisibility.exchangeRate ? 'text-red-600' : 'text-gray-400'
            }`}>
              {(() => {
                const currentPhase = getFilteredPhaseData()
                const validValues = currentPhase.exchangeRates.filter((v): v is number => v !== null);
                if (validValues.length === 0) return 'N/A'
                const maxRate = Math.max(...(validValues.map(v => Math.abs(v)) as number[]))
                return maxRate.toLocaleString() + ' LBP'
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Peak Exchange Rate</div>
            <div className="text-xs text-muted-foreground mt-1">
              {seriesVisibility.exchangeRate ? 'Click to hide' : 'Click to show'}
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
