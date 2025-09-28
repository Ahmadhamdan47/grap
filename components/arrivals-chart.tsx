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

// Function to process Sayrafa CSV data
const processSayrafaData = () => {
  // Sayrafa monthly averages for our chart timeframe (Jul 2021 - Feb 2022)
  // Calculated from the CSV data by extracting daily rates and computing monthly averages
  return {
    all: [
      // Phase 1 (no Sayrafa data available)
      null, null, null, null, null, null, null, null, null, null, null, null,
      // Phase 2 (Jul 2021 - Jan 2022) - Sayrafa monthly averages
      15500,  // Jul-21 avg
      16800,  // Aug-21 avg
      14200,  // Sep-21 avg
      17200,  // Oct-21 avg
      19400,  // Nov-21 avg
      22800,  // Dec-21 avg
      23100,  // Jan-22 avg
      // Phase 3 (Feb 2022)
      20300,  // Feb-22 avg
    ],
    phase1: [null, null, null, null, null, null, null, null, null, null, null, null],
    phase2: [15500, 16800, 14200, 17200, 19400, 22800, 23100],
    phase3: [20300],  // Feb-22 Sayrafa rate
  }
}

const sayrafaRateData = processSayrafaData()

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
      "Jul-20", "Aug-20", "Sep-20", "Oct-20", "Nov-20", "Dec-20",
      "Jan-21", "Feb-21", "Mar-21", "Apr-21", "May-21", "Jun-21",
      // Phase 2 months
      "Jul-21", "Aug-21", "Sep-21", "Oct-21", "Nov-21", "Dec-21", "Jan-22",
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
    sayrafaRates: sayrafaRateData.all,
  },
  phase1: {
    name: "Phase 1",
    period: "01-07-2020 to 30-06-2021",
    months: [
      "Jul-20", "Aug-20", "Sep-20", "Oct-20", "Nov-20", "Dec-20",
      "Jan-21", "Feb-21", "Mar-21", "Apr-21", "May-21", "Jun-21",
    ],
    // No real data available - using null to hide lines
    arrivals: [null, null, null, null, null, null, null, null, null, null, null, null],
    estimatedArrivals: [null, null, null, null, null, null, null, null, null, null, null, null],
    ulTests: [null, null, null, null, null, null, null, null, null, null, null, null],
    exchangeRates: exchangeRateData.phase1,
    sayrafaRates: sayrafaRateData.phase1,
  },
  phase2: {
    name: "Phase 2",
    period: "01-07-2021 to 09-01-2022",
    months: chartData.months,
    arrivals: chartData.arrivals, // Arrivals (Manifest)
    estimatedArrivals: chartData.estimated, // Estimated (monthly)
    ulTests: Object.values(chartData.ul_number_of_tests.monthly),
    exchangeRates: exchangeRateData.phase2,
    sayrafaRates: sayrafaRateData.phase2,
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
    sayrafaRates: sayrafaRateData.phase3,
  },
}

export default function ArrivalsChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<keyof typeof phases>("all")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isRTL, setIsRTL] = useState(false)
  // Selected data index (month) for showing detailed values
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [seriesVisibility, setSeriesVisibility] = useState({
    manifest: true,
    estimated: true,
    ul: true,
    exchangeRate: true,
    sayrafaRate: true,
  })
  const [phaseVisibility, setPhaseVisibility] = useState({
    phase1: true,
    phase2: true,
    phase3: true,
  })
  const [decalPatterns, setDecalPatterns] = useState({
    betweenManifestEstimated: false,
    betweenEstimatedUL: false,
    betweenULAxis: false,
    betweenExchangeSayrafa: false,
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

  const toggleDecalPattern = (pattern: keyof typeof decalPatterns) => {
    setDecalPatterns(prev => ({
      ...prev,
      [pattern]: !prev[pattern]
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
      sayrafaRates: allPhase.sayrafaRates.map((value, index) => {
        if (index < 12 && !phaseVisibility.phase1) return null
        if (index >= 12 && index < 19 && !phaseVisibility.phase2) return null
        if (index >= 19 && !phaseVisibility.phase3) return null
        return value
      }),
    }
    return filteredData
  }

  // Transform data for RTL display (reverse arrays if RTL is enabled)
  const getDisplayData = (phaseData: any) => {
    if (!isRTL) {
      return phaseData
    }
    
    return {
      ...phaseData,
      months: [...phaseData.months].reverse(),
      arrivals: [...phaseData.arrivals].reverse(),
      estimatedArrivals: [...phaseData.estimatedArrivals].reverse(),
      ulTests: [...phaseData.ulTests].reverse(),
      exchangeRates: [...phaseData.exchangeRates].reverse(),
      sayrafaRates: [...phaseData.sayrafaRates].reverse(),
    }
  }

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current, isDarkMode ? "dark" : undefined)
    
    // Set RTL for chart content if needed
    if (isRTL) {
      chartInstance.current.getDom().style.direction = 'rtl'
    }

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chartInstance.current?.dispose()
    }
  }, [isDarkMode, isRTL])

  useEffect(() => {
    if (!chartInstance.current) return

    const currentPhase = getFilteredPhaseData()
    const displayData = getDisplayData(currentPhase)

    const option: echarts.EChartsOption = {
      title: {
        text: `${currentPhase.name} - Arrivals Analysis & Market Rates`,
        subtext: `${currentPhase.period} • Market Rate at bottom, Arrivals above with separate scales`,
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
              if (param.seriesName === 'Market Rate') {
                const actualLBPRate = Math.abs(param.value);
                result += `${param.marker} ${param.seriesName}: ${actualLBPRate.toLocaleString()} LBP<br/>`
              } else if (param.seriesName === 'Sayrafa Rate') {
                result += `${param.marker} ${param.seriesName}: ${param.value.toLocaleString()} LBP<br/>`
              } else {
                result += `${param.marker} ${param.seriesName}: ${param.value.toLocaleString()}<br/>`
              }
            }
          })
          return result
        },
      },
      legend: {
        show: false,
      },
      grid: [
        {
          id: 'arrivals',
          left: isRTL ? "4%" : "10%",
          right: isRTL ? "10%" : "4%", 
          // Minimize space below arrivals chart
          bottom: "55%",
          top: 80,
          containLabel: false,
        },
        {
          id: 'exchange',
          left: isRTL ? "4%" : "10%",
          right: isRTL ? "10%" : "4%",
          bottom: "15%",
          // Minimize vertical separation space above the exchange rate grid
          top: "55%",
          containLabel: false,
        }
      ],
      // Global axisPointer so a vertical dotted guide spans both grids (linked on x)
      axisPointer: {
        link: [
          { xAxisIndex: [0, 1] }
        ],
        show: true,
        triggerOn: 'mousemove|click',
        lineStyle: {
          type: 'solid',
          width: 2,
          color: isDarkMode ? '#fbbf24' : '#10b981' // Yellow in dark mode, green in light mode
        }
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
      xAxis: [
        {
          id: 'arrivals-x',
          gridIndex: 0,
          type: "category",
          boundaryGap: false,
          data: displayData.months,
          axisLabel: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
        {
          id: 'exchange-x', 
          gridIndex: 1,
          type: "category",
          boundaryGap: false,
          data: displayData.months,
          offset: 10,
          axisLabel: {
            rotate: 45,
            margin: 12,
          },
          axisTick: {
            length: 6,
          },
        }
      ],
      yAxis: [
        {
          id: 'arrivals-y',
          gridIndex: 0,
          type: "value",
          name: "Arrivals",
          position: isRTL ? "right" : "left",
          min: 0,
          max: 400000,
          interval: 50000,
          axisLabel: {
            margin: 8,
            formatter: (value: number) => {
              if (value === 0) return "0";
              if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
              if (value >= 100000) return value.toLocaleString(); // Show full number for values like 300,000
              return (value / 1000).toFixed(0) + "k";
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
        {
          id: 'exchange-y',
          gridIndex: 1, 
          type: "value",
          name: "Market Rate",
          position: isRTL ? "right" : "left",
          boundaryGap: [1.20, 1.20],
          min: 1515,
          max: 30000,
          interval: 3500,
          axisLabel: {
            margin: 8,
            formatter: (value: number) => {
              if (value >= 1000) {
                return (value / 1000).toFixed(0) + "k";
              }
              return value.toString();
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              opacity: 0.3,
            },
          },
        }
      ],
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0, 1],
          start: 0,
          end: 100,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
          throttle: 100,
        },
        {
          type: "slider",
          xAxisIndex: [0, 1],
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
        ...(decalPatterns.betweenManifestEstimated && seriesVisibility.manifest && seriesVisibility.estimated ? [{
          name: "Pattern: Manifest-Estimated",
          type: "line" as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: displayData.arrivals.map((manifest: number | null, index: number) => {
            const estimated = displayData.estimatedArrivals[index]
            return manifest !== null && estimated !== null ? Math.min(manifest, estimated) : null
          }),
          stack: 'decal1',
          areaStyle: {
            opacity: 0.2,
            color: {
              type: 'pattern' as const,
              image: createDecalPattern('dots', isDarkMode),
              repeat: 'repeat' as const
            } as any
          },
          lineStyle: { opacity: 0 },
          itemStyle: { opacity: 0 },
          showSymbol: false,
          silent: true,
          connectNulls: false,
        }, {
          name: "Difference 1",
          type: "line" as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: displayData.arrivals.map((manifest: number | null, index: number) => {
            const estimated = displayData.estimatedArrivals[index]
            if (manifest !== null && estimated !== null) {
              return Math.abs(manifest - estimated)
            }
            return null
          }),
          stack: 'decal1',
          areaStyle: {
            opacity: 0.15,
            color: {
              type: 'pattern' as const,
              image: createDecalPattern('dots', isDarkMode),
              repeat: 'repeat' as const
            } as any
          },
          lineStyle: { opacity: 0 },
          itemStyle: { opacity: 0 },
          showSymbol: false,
          silent: true,
          connectNulls: false,
        }] : []),
        ...(decalPatterns.betweenEstimatedUL && seriesVisibility.estimated && seriesVisibility.ul ? [{
          name: "Pattern: Estimated-UL",
          type: "line" as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: displayData.estimatedArrivals.map((estimated: number | null, index: number) => {
            const ul = displayData.ulTests[index]
            return estimated !== null && ul !== null ? Math.min(estimated, ul) : null
          }),
          stack: 'decal2',
          areaStyle: {
            opacity: 0.2,
            color: {
              type: 'pattern' as const,
              image: createDecalPattern('diagonal', isDarkMode),
              repeat: 'repeat' as const
            } as any
          },
          lineStyle: { opacity: 0 },
          itemStyle: { opacity: 0 },
          showSymbol: false,
          silent: true,
          connectNulls: false,
        }, {
          name: "Difference 2",
          type: "line" as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: displayData.estimatedArrivals.map((estimated: number | null, index: number) => {
            const ul = displayData.ulTests[index]
            if (estimated !== null && ul !== null) {
              return Math.abs(estimated - ul)
            }
            return null
          }),
          stack: 'decal2',
          areaStyle: {
            opacity: 0.15,
            color: {
              type: 'pattern' as const,
              image: createDecalPattern('diagonal', isDarkMode),
              repeat: 'repeat' as const
            } as any
          },
          lineStyle: { opacity: 0 },
          itemStyle: { opacity: 0 },
          showSymbol: false,
          silent: true,
          connectNulls: false,
        }] : []),
        ...(decalPatterns.betweenULAxis && seriesVisibility.ul ? [{
          name: "Pattern: UL-Axis",
          type: "line" as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: displayData.ulTests,
          areaStyle: {
            opacity: 0.2,
            color: {
              type: 'pattern' as const,
              image: createDecalPattern('waves', isDarkMode),
              repeat: 'repeat' as const
            } as any
          },
          lineStyle: { opacity: 0 },
          itemStyle: { opacity: 0 },
          showSymbol: false,
          silent: true,
          connectNulls: false,
        }] : []),
        ...(decalPatterns.betweenExchangeSayrafa && seriesVisibility.exchangeRate && seriesVisibility.sayrafaRate ? [{
          name: "Exchange-Sayrafa Base",
          type: "line" as const,
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: displayData.exchangeRates.map((exchange: number | null, index: number) => {
            const sayrafa = displayData.sayrafaRates[index]
            if (exchange !== null && sayrafa !== null) {
              return Math.min(Math.abs(exchange), sayrafa)
            }
            return null
          }),
          stack: 'exchange-decal',
          areaStyle: {
            opacity: 0.15,
            color: {
              type: 'pattern' as const,
              image: createDecalPattern('diagonal', isDarkMode),
              repeat: 'repeat' as const
            } as any
          },
          lineStyle: { opacity: 0 },
          itemStyle: { opacity: 0 },
          showSymbol: false,
          silent: true,
          connectNulls: false,
        }, {
          name: "Exchange Difference",
          type: "line" as const,
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: displayData.exchangeRates.map((exchange: number | null, index: number) => {
            const sayrafa = displayData.sayrafaRates[index]
            if (exchange !== null && sayrafa !== null) {
              return Math.abs(Math.abs(exchange) - sayrafa)
            }
            return null
          }),
          stack: 'exchange-decal',
          areaStyle: {
            opacity: 0.2,
            color: {
              type: 'pattern' as const,
              image: createDecalPattern('dots', isDarkMode),
              repeat: 'repeat' as const
            } as any
          },
          lineStyle: { opacity: 0 },
          itemStyle: { opacity: 0 },
          showSymbol: false,
          silent: true,
          connectNulls: false,
        }] : []),
        {
          name: "Manifest",
          type: "line",
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: seriesVisibility.manifest ? displayData.arrivals : [],
          smooth: true,
          connectNulls: false,
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
        },
        {
          name: "Estimated",
          type: "line",
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: seriesVisibility.estimated ? displayData.estimatedArrivals : [],
          smooth: true,
          connectNulls: false,
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
        },
        {
          name: "UL",
          type: "line",
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: seriesVisibility.ul ? displayData.ulTests : [],
          smooth: true,
          connectNulls: false,
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
        },
        {
          name: "Market Rate",
          type: "line",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: seriesVisibility.exchangeRate ? displayData.exchangeRates.map((rate: number | null) => rate !== null ? Math.abs(rate) : null) : [],
          smooth: false,
          connectNulls: false,
          lineStyle: {
            width: 2,
            type: "solid",
          },
          itemStyle: {
            color: "#ef4444",
          },
          areaStyle: {
            opacity: 0.3,
            color: "#ef4444",
          },
          emphasis: {
            focus: "series",
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#666',
              width: 2,
              type: 'dotted'
            },
            data: [{
              yAxis: 1515,
              label: {
                show: true,
                position: 'insideEndTop',
                formatter: '1515 LBP',
                color: '#666',
                fontSize: 12
              }
            }]
          },
        },
        {
          name: "Sayrafa Rate",
          type: "line",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: seriesVisibility.sayrafaRate ? displayData.sayrafaRates : [],
          smooth: false,
          connectNulls: false,
          lineStyle: {
            width: 2,
            type: "solid",
          },
          itemStyle: {
            color: "#22c55e",
          },
          areaStyle: {
            opacity: 0.2,
            color: "#22c55e",
          },
          emphasis: {
            focus: "series",
          },
        },
        // Selected month vertical reference lines (duplicated for both grids)
        ...(selectedIndex !== null ? [{
          name: 'Selected Month (Arrivals)',
          type: 'line' as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: [],
          silent: true,
          showSymbol: false,
          lineStyle: { opacity: 0 },
          markLine: {
            symbol: 'none',
            animation: false,
            lineStyle: {
              color: isDarkMode ? '#fbbf24' : '#10b981', // Yellow in dark mode, green in light mode
              width: 2,
              type: 'solid' as const
            },
            label: { show: false },
            data: [ { xAxis: displayData.months[selectedIndex] } ]
          }
        }, {
          name: 'Selected Month (Exchange)',
          type: 'line' as const,
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: [],
            silent: true,
            showSymbol: false,
            lineStyle: { opacity: 0 },
            markLine: {
              symbol: 'none',
              animation: false,
              lineStyle: {
                color: isDarkMode ? '#fbbf24' : '#10b981', // Yellow in dark mode, green in light mode
                width: 2,
                type: 'solid' as const
              },
              label: { show: false },
              data: [ { xAxis: displayData.months[selectedIndex] } ]
            }
        }] : []),
      ],
      animation: true,
      animationDuration: 1000,
      animationEasing: "cubicOut",
    }

    console.log("📊 Updating chart for phase:", selectedPhase)
    console.log("📊 Chart instance exists:", !!chartInstance.current)
    console.log("📊 Current phase data:", {
      arrivals: displayData.arrivals?.slice(0, 3),
      estimated: displayData.estimatedArrivals?.slice(0, 3), 
      ulTests: displayData.ulTests?.slice(0, 3)
    })

    chartInstance.current.setOption(option, true)

    chartInstance.current.on("legendselectchanged", (params: any) => {
      console.log("📊 Legend clicked:", params.name, "Selected:", params.selected)
    })

    chartInstance.current.on("datazoom", (params: any) => {
      console.log("Data zoom event:", params)
    })

    // Handle click selection on any visible series point (store index and keep axisPointer in place)
    chartInstance.current.off('click')
    chartInstance.current.on('click', (params: any) => {
      if (typeof params.dataIndex === 'number') {
        setSelectedIndex(params.dataIndex)
        // Manually dispatch an updateAxisPointer so the vertical line remains
        chartInstance.current?.dispatchAction({
          type: 'updateAxisPointer',
          currTrigger: 'click',
          xAxisIndex: [0,1],
          position: params.event?.offsetX
        })
      }
    })

    // If a selection already exists after re-render (e.g., toggling series), keep axis pointer there
    if (selectedIndex !== null) {
      chartInstance.current.dispatchAction({
        type: 'highlight'
      })
      chartInstance.current.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: selectedIndex
      })
    }
  }, [selectedPhase, isDarkMode, isRTL, seriesVisibility, phaseVisibility, decalPatterns, selectedIndex])

  return (
    <Card className={`w-full ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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

          {/* Decal Patterns Toggle */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                const allEnabled = decalPatterns.betweenManifestEstimated && decalPatterns.betweenEstimatedUL && decalPatterns.betweenULAxis && decalPatterns.betweenExchangeSayrafa
                setDecalPatterns({
                  betweenManifestEstimated: !allEnabled,
                  betweenEstimatedUL: !allEnabled,
                  betweenULAxis: !allEnabled,
                  betweenExchangeSayrafa: !allEnabled,
                })
              }}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                decalPatterns.betweenManifestEstimated || decalPatterns.betweenEstimatedUL || decalPatterns.betweenULAxis || decalPatterns.betweenExchangeSayrafa
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {decalPatterns.betweenManifestEstimated || decalPatterns.betweenEstimatedUL || decalPatterns.betweenULAxis || decalPatterns.betweenExchangeSayrafa
                ? '✓ Difference Patterns' 
                : '○ Difference Patterns'
              }
            </button>
            
            {/* RTL Toggle */}
            <button
              onClick={() => setIsRTL(!isRTL)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                isRTL
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {isRTL ? '✓ RTL Layout' : '○ RTL Layout'}
            </button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Market rate displayed at bottom (1515-30000 LBP), arrivals data above with separate scales. 
            Both charts are synchronized and can be zoomed independently. Click the cards below to toggle data series visibility.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full h-[600px]" style={{ minHeight: "600px" }} />
        {/* Selected month details */}
        <div className="mt-4 p-4 rounded-lg border bg-muted/30 text-sm">
          {(() => {
            const currentPhase = getFilteredPhaseData()
            const displayData = getDisplayData(currentPhase)
            if (selectedIndex === null || !displayData.months[selectedIndex]) {
              return <span className="text-muted-foreground">Click a point to lock the vertical line and see that month's values.</span>
            }
            const monthLabel = displayData.months[selectedIndex]
            const manifestVal = displayData.arrivals[selectedIndex]
            const estimatedVal = displayData.estimatedArrivals[selectedIndex]
            const ulVal = displayData.ulTests[selectedIndex]
            const exValRaw = displayData.exchangeRates[selectedIndex]
            const exVal = exValRaw != null ? Math.abs(exValRaw) : null
            const sayrafaVal = displayData.sayrafaRates[selectedIndex]
            return (
              <div className="flex flex-wrap gap-4 items-center">
                <div className="font-medium">{monthLabel}</div>
                <div className="flex gap-3 flex-wrap">
                  <span className="text-gray-600 dark:text-gray-300">Manifest: {manifestVal != null ? manifestVal.toLocaleString() : '—'}</span>
                  <span className="text-black dark:text-white">Estimated: {estimatedVal != null ? estimatedVal.toLocaleString() : '—'}</span>
                  <span className="text-blue-600 dark:text-blue-400">UL: {ulVal != null ? ulVal.toLocaleString() : '—'}</span>
                  <span className="text-red-600">USD/LBP: {exVal != null ? exVal.toLocaleString() + ' LBP' : '—'}</span>
                  <span className="text-green-600 dark:text-green-400">Sayrafa: {sayrafaVal != null ? sayrafaVal.toLocaleString() + ' LBP' : '—'}</span>
                </div>
              </div>
            )
          })()}
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                const sum = validValues.reduce((acc, v) => acc + Math.abs(v), 0)
                const avgRate = Math.round(sum / validValues.length)
                return avgRate.toLocaleString() + ' LBP'
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Average Exchange Rate</div>
            <div className="text-xs text-muted-foreground mt-1">
              {seriesVisibility.exchangeRate ? 'Click to hide' : 'Click to show'}
            </div>
          </button>
          <button
            onClick={() => toggleSeries('sayrafaRate')}
            className={`text-center p-4 rounded-lg transition-all duration-200 ${
              seriesVisibility.sayrafaRate
                ? 'bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30'
                : 'bg-gray-200 dark:bg-gray-800 opacity-50'
            }`}
          >
            <div className={`text-2xl font-bold ${
              seriesVisibility.sayrafaRate ? 'text-green-600' : 'text-gray-400'
            }`}>
              {(() => {
                const currentPhase = getFilteredPhaseData()
                const validValues = currentPhase.sayrafaRates.filter((v): v is number => v !== null);
                if (validValues.length === 0) return 'N/A'
                const sum = validValues.reduce((acc, v) => acc + v, 0)
                const avgRate = Math.round(sum / validValues.length)
                return avgRate.toLocaleString() + ' LBP'
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Average Sayrafa Rate</div>
            <div className="text-xs text-muted-foreground mt-1">
              {seriesVisibility.sayrafaRate ? 'Click to hide' : 'Click to show'}
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to create decal patterns
function createDecalPattern(type: 'diagonal' | 'dots' | 'waves', isDarkMode: boolean = false) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const size = 20
  canvas.width = size
  canvas.height = size

  // Make patterns more subtle and transparent so they don't hide colors
  const strokeColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
  const fillColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'

  ctx.fillStyle = 'transparent'
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 0.8 // Thinner lines for subtlety

  switch (type) {
    case 'diagonal':
      // Diagonal lines pattern - more spaced out
      ctx.beginPath()
      for (let i = -size; i <= size * 2; i += 12) { // Increased spacing
        ctx.moveTo(i, 0)
        ctx.lineTo(i + size, size)
      }
      ctx.stroke()
      break

    case 'dots':
      // Small dots pattern
      ctx.fillStyle = strokeColor
      for (let x = 6; x < size; x += 10) { // More spaced out
        for (let y = 6; y < size; y += 10) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2) // Smaller dots
          ctx.fill()
        }
      }
      break

    case 'waves':
      // Small X's pattern instead of waves
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 0.6
      for (let x = 4; x < size; x += 10) { // Spaced out X's
        for (let y = 4; y < size; y += 10) {
          // Draw X
          ctx.beginPath()
          ctx.moveTo(x - 1.5, y - 1.5)
          ctx.lineTo(x + 1.5, y + 1.5)
          ctx.moveTo(x + 1.5, y - 1.5)
          ctx.lineTo(x - 1.5, y + 1.5)
          ctx.stroke()
        }
      }
      break
  }

  return canvas
}