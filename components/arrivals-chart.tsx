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
    // Difference overlay visibility states
    const [differenceVisibility, setDifferenceVisibility] = useState({
      manifestEstimated: false,
      estimatedUL: false,
      marketSayrafa: false,
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

    const toggleDifference = (key: keyof typeof differenceVisibility) => {
      setDifferenceVisibility(prev => ({
        ...prev,
        [key]: !prev[key]
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
            // Collect values by series name first
            const valueMap: Record<string, number | null> = {}
            params.forEach((p: any) => {
              if (p == null) return
              if (p.value === null || p.value === undefined) return
              if (p.seriesName === 'Market Rate') {
                valueMap[p.seriesName] = Math.abs(p.value)
              } else {
                valueMap[p.seriesName] = p.value
              }
            })

            const manifest = valueMap['Manifest']
            const estimated = valueMap['Estimated']
            const ul = valueMap['UL']
            const market = valueMap['Market Rate']
            const sayrafa = valueMap['Sayrafa Rate']

            // Differences (always absolute, never show negative signs)
            // Manifest vs Estimated
            const diffManifestEstimated = (manifest != null && estimated != null) ? Math.abs(estimated - manifest) : null
            // Group 1 (Estimated/UL) Difference: UL vs Estimated
            const diffULvsEstimated = (ul != null && estimated != null) ? Math.abs(ul - estimated) : null
            // Group 2 (Rates) Difference: Market vs Sayrafa
            const diffMarketSayrafa = (market != null && sayrafa != null) ? Math.abs(market - sayrafa) : null

            const fmt = (v: number | null | undefined, unit?: string) => {
              if (v == null) return '—'
              return v.toLocaleString() + (unit ? ` ${unit}` : '')
            }

            // Build ordered custom layout:
            // Manifest
            // ---
            // Estimated
            // UL
            // Difference (UL - Estimated)
            // ---
            // Market
            // Sayrafa
            // Difference (Market - Sayrafa)
            // ---

            let html = `<div style="min-width:170px">` +
              `<div style="font-weight:600;margin-bottom:4px">${params[0]?.axisValue ?? ''}</div>` +
              `<div><span style="color:#6b7280">Manifest:</span> ${fmt(manifest)}</div>` +
              `<div style="border-top:1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};margin:4px 0"></div>` +
              `<div><span style="color:#111827">Estimated:</span> ${fmt(estimated)}</div>` +
              `<div><span style="color:${isDarkMode ? '#c4b5fd' : '#8b5cf6'}">Difference (Estimated - Manifest):</span> ${fmt(diffManifestEstimated)}</div>` +
              `<div><span style="color:#2563eb">UL:</span> ${fmt(ul)}</div>` +
              `<div><span style="color:${isDarkMode ? '#6366f1' : '#4f46e5'}">Difference (UL - Estimated):</span> ${fmt(diffULvsEstimated)}</div>` +
              `<div style="border-top:1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};margin:4px 0"></div>` +
              `<div><span style="color:#dc2626">Market:</span> ${fmt(market, 'LBP')}</div>` +
              `<div><span style="color:#16a34a">Sayrafa:</span> ${fmt(sayrafa, 'LBP')}</div>` +
              `<div><span style="color:${isDarkMode ? '#f97316' : '#ea580c'}">Difference:</span> ${fmt(diffMarketSayrafa, 'LBP')}</div>` +
              `<div style="border-top:1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};margin-top:4px"></div>` +
              `</div>`
            return html
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
            // Unified highlight color
            color: '#CCFF00'
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
              // Show full values without abbreviation (no 'k')
              formatter: (value: number) => value.toLocaleString(),
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
              // Show full values without abbreviation (no 'k')
              formatter: (value: number) => value.toLocaleString(),
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
          // Difference overlays implemented with stacked invisible baselines + diff area
          ...(differenceVisibility.manifestEstimated && seriesVisibility.manifest && seriesVisibility.estimated ? (() => {
            const a = displayData.arrivals as (number|null)[]
            const b = displayData.estimatedArrivals as (number|null)[]
            const base = a.map((v,i)=> (v!=null && b[i]!=null) ? Math.min(v,b[i] as number) : null)
            const diff = a.map((v,i)=> (v!=null && b[i]!=null) ? Math.abs((b[i] as number)-v) : null)
            return [
              ({
                name: 'Δ Estimated vs Manifest (base)',
                type: 'line',
                xAxisIndex: 0,
                yAxisIndex: 0,
                stack: 'ME_DIFF',
                data: base,
                showSymbol: false,
                smooth: true,
                silent: true,
                clip: true,
                lineStyle: { opacity: 0 },
                areaStyle: { opacity: 0 },
                emphasis: { disabled: true },
                tooltip: { show: false },
                z: -2
              }) as any,
              ({
                name: 'Δ Estimated vs Manifest',
                type: 'line',
                xAxisIndex: 0,
                yAxisIndex: 0,
                stack: 'ME_DIFF',
                data: diff,
                showSymbol: false,
                smooth: true,
                silent: true,
                clip: true,
                lineStyle: { opacity: 0 },
                  // Unified difference overlay color
                  areaStyle: { color: 'rgba(204,255,0,0.45)', opacity: 0.55 },
                emphasis: { disabled: true },
                tooltip: { show: false },
                z: -1
              }) as any
            ]
          })() : []),
          ...(differenceVisibility.estimatedUL && seriesVisibility.estimated && seriesVisibility.ul ? (() => {
            const e = displayData.estimatedArrivals as (number|null)[]
            const u = displayData.ulTests as (number|null)[]
            const base = e.map((v,i)=> (v!=null && u[i]!=null) ? Math.min(v,u[i] as number) : null)
            const diff = e.map((v,i)=> (v!=null && u[i]!=null) ? Math.abs((u[i] as number)-v) : null)
            return [
              ({
                name: 'Δ UL vs Estimated (base)',
                type: 'line',
                xAxisIndex: 0,
                yAxisIndex: 0,
                stack: 'UE_DIFF',
                data: base,
                showSymbol: false,
                smooth: true,
                silent: true,
                clip: true,
                lineStyle: { opacity: 0 },
                areaStyle: { opacity: 0 },
                emphasis: { disabled: true },
                tooltip: { show: false },
                z: -2
              }) as any,
              ({
                name: 'Δ UL vs Estimated',
                type: 'line',
                xAxisIndex: 0,
                yAxisIndex: 0,
                stack: 'UE_DIFF',
                data: diff,
                showSymbol: false,
                smooth: true,
                silent: true,
                clip: true,
                lineStyle: { opacity: 0 },
                // Unified difference overlay color
                areaStyle: { color: 'rgba(204,255,0,0.45)', opacity: 0.55 },
                emphasis: { disabled: true },
                tooltip: { show: false },
                z: -1
              }) as any
            ]
          })() : []),
          ...(differenceVisibility.marketSayrafa && seriesVisibility.exchangeRate && seriesVisibility.sayrafaRate ? (() => {
            const mRaw = displayData.exchangeRates as (number|null)[]
            const s = displayData.sayrafaRates as (number|null)[]
            const m = mRaw.map(v=> v==null? null : Math.abs(v))
            const base = m.map((v,i)=> (v!=null && s[i]!=null) ? Math.min(v,s[i] as number) : null)
            const diff = m.map((v,i)=> (v!=null && s[i]!=null) ? Math.abs(v - (s[i] as number)) : null)
            return [
              ({
                name: 'Δ Market vs Sayrafa (base)',
                type: 'line',
                xAxisIndex: 1,
                yAxisIndex: 1,
                stack: 'MS_DIFF',
                data: base,
                showSymbol: false,
                smooth: true,
                silent: true,
                clip: true,
                lineStyle: { opacity: 0 },
                areaStyle: { opacity: 0 },
                emphasis: { disabled: true },
                tooltip: { show: false },
                z: -2
              }) as any,
              ({
                name: 'Δ Market vs Sayrafa',
                type: 'line',
                xAxisIndex: 1,
                yAxisIndex: 1,
                stack: 'MS_DIFF',
                data: diff,
                showSymbol: false,
                smooth: true,
                silent: true,
                clip: true,
                lineStyle: { opacity: 0 },
                // Unified difference overlay color
                areaStyle: { color: 'rgba(204,255,0,0.45)', opacity: 0.55 },
                emphasis: { disabled: true },
                tooltip: { show: false },
                z: -1
              }) as any
            ]
          })() : []),
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
                color: '#CCFF00',
                width: 2,
                type: 'solid'
              },
              data: [{
                yAxis: 1515,
                label: {
                  show: true,
                  position: 'insideEndTop',
                  formatter: '1515 LBP', // baseline
                  color: '#222',
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
                color: '#CCFF00',
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
                  color: '#CCFF00',
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
  }, [selectedPhase, isDarkMode, isRTL, seriesVisibility, phaseVisibility, selectedIndex, differenceVisibility])

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
            {/* Difference Overlays Toggles */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground mr-2">Highlight Differences:</span>
              <button
                onClick={() => toggleDifference('manifestEstimated')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${differenceVisibility.manifestEstimated ? 'bg-black text-white dark:bg-black/80' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >M vs E</button>
              <button
                onClick={() => toggleDifference('estimatedUL')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${differenceVisibility.estimatedUL ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}
              >UL vs E</button>
              <button
                onClick={() => toggleDifference('marketSayrafa')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${differenceVisibility.marketSayrafa ? 'bg-red-600 text-white' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}
              >Market vs Sayrafa</button>
            </div>

            {/* RTL Toggle */}
            <div className="flex justify-center gap-4">
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

