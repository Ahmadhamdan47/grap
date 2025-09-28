  "use client"

  import { useEffect, useRef, useState } from "react"
  import * as echarts from "echarts"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

  // Static seed data (legacy short window kept for phase2 reference)
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
    // Sayrafa monthly averages for our chart timeframe (Jul 2021 - Jul 2022)
    // Phase 3 now extended through July 2022
    return {
      all: [
        // Phase 1 (pre-Sayrafa period - using official rate of 1515)
        1515, 1515, 1515, 1515, 1515, 1515, 1515, 1515, 1515, 1515, 1515, 1515,
        // Phase 2 (Jul 2021 - Jan 2022) - Sayrafa monthly averages (recomputed rounded)
        15250,  // Jul-21 avg
        16628,  // Aug-21 avg
        14740,  // Sep-21 avg
        16479,  // Oct-21 avg
        18705,  // Nov-21 avg
        21495,  // Dec-21 avg
        23381,  // Jan-22 avg
        // Phase 3 (Feb 2022 - Jul 2022) - Extended data
        20539,  // Feb-22 avg
        21041,  // Mar-22 avg
        22429,  // Apr-22 avg
        23453,  // May-22 avg
        24781,  // Jun-22 avg
        25480,  // Jul-22 avg
      ],
      phase1: [1515, 1515, 1515, 1515, 1515, 1515, 1515, 1515, 1515, 1515, 1515, 1515],
      phase2: [15250, 16628, 14740, 16479, 18705, 21495, 23381],
      phase3: [20539, 21041, 22429, 23453, 24781, 25480],  // Feb-22 through Jul-22
    }
  }

  const sayrafaRateData = processSayrafaData()

  // USD to LBP exchange rate data (monthly averages from CSV) - Phase 3 extended through Jul 2022
  const exchangeRateData = {
    all: [
      // Phase 1 rates (Jul 2020 - Jun 2021)
      -8081, -7433, -7686, -7803, -7820, -8286,   // Jul-Dec 2020
      -8762, -9138, -11708, -12201, -12713, -15274, // Jan-Jun 2021
      // Phase 2 rates (Jul 2021 - Jan 2022)
      -19408, -19587, -16479, -19691, -22900, -25911, -26493, // Jul 2021 - Jan 2022
      // Phase 3 rates (Feb 2022 - Jul 2022) monthly averages (negative for below-axis plotting)
      -20926, // Feb-22
      -22945, // Mar-22
      -25760, // Apr-22
      -29595, // May-22
      -28607, // Jun-22
      -29546, // Jul-22
    ],
    phase1: [-8081, -7433, -7686, -7803, -7820, -8286, -8762, -9138, -11708, -12201, -12713, -15274],
    phase2: [-19408, -19587, -16479, -19691, -22900, -25911, -26493],
    phase3: [-20926, -22945, -25760, -29595, -28607, -29546], // Feb-22 through Jul-22
  }

  // Lollar rate data (3900 LBP from Jul 2020 to Jul 2021, then null)
  const lollarRateData = {
    all: [
      // Phase 1 - Lollar rate 3900 LBP (Jul 2020 - Jun 2021)
      3900, 3900, 3900, 3900, 3900, 3900,   // Jul-Dec 2020
      3900, 3900, 3900, 3900, 3900, 1515,   // Jan-Jun 2021
      // Phase 2 and beyond - Lollar not active
      null, null, null, null, null, null, null, // Jul 2021 - Jan 2022
      null, null, null, null, null, null, // Feb-Jul 2022
    ],
    phase1: [3900, 3900, 3900, 3900, 3900, 3900, 3900, 3900, 3900, 3900, 3900, 3900],
    phase2: [null, null, null, null, null, null, null],
    phase3: [null, null, null, null, null, null], // Feb-22 through Jul-22
  }

  // Full hardcoded dataset extracted from numbers.csv (Aug-20 .. Jul-22) with a leading Jul-20 null for alignment (extended to include full data)
  const fullMonths = [
    'Jul-20','Aug-20','Sep-20','Oct-20','Nov-20','Dec-20',
    'Jan-21','Feb-21','Mar-21','Apr-21','May-21','Jun-21',
    'Jul-21','Aug-21','Sep-21','Oct-21','Nov-21','Dec-21','Jan-22','Feb-22',
    'Mar-22','Apr-22','May-22','Jun-22','Jul-22'
  ]
  const manifestAll: (number|null)[] = [
    null,
    74366,81928,109267,99776,155020,67076,67395,101113,107240,153360,234519,
    355979,208033,183225,192837,156665,242955,153230,159970,
    201536,411037,380559,340317,460018
  ]
  const estimatedAll: (number|null)[] = [
    null,
    69604,76772,102471,93489,145479,62851,63151,94796,100556,143858,219848,
    333620,195051,171831,180867,146765,227978,143836,150172,
    null,null,null,null,null
  ]
  const ulAll: (number|null)[] = [
    null, // Jul-20
    null,null,null,null,null, // Aug20-Dec20
    null,null,null,null,null,null, // Jan21-Jun21
    255958,149581,131744,138655,112646,174691,36725, // Jul21-Jan22
    null, // Feb-22
    null,null,null,null,null // Mar22-Jul22
  ]
  const areebaOummalAll: (number|null)[] = [
    null, // Jul-20
    null,null,null,null,null, // Aug20-Dec20
    null,null,null,null,null,null, // Jan21-Jun21
    null,null,null,null,null,null, // Jul21-Dec21
    74605, // Jan-22
    151443, // Feb-22
    null,null,null,null,null // Mar22-Jul22
  ]

  // Phase definitions (extended all-phase; phase3 now includes full data through Jul 2022)
  const phases = {
    all: {
      name: "All Phases",
      period: "01-07-2020 to 31-07-2022",
      months: fullMonths,
      arrivals: manifestAll,
      estimatedArrivals: estimatedAll,
      ulTests: ulAll,
      areebaOummal: areebaOummalAll,
      exchangeRates: exchangeRateData.all,
      sayrafaRates: sayrafaRateData.all,
      lollarRates: lollarRateData.all,
    },
    phase1: {
      name: "Phase 1",
      period: "01-07-2020 to 30-06-2021",
      months: [
        "Jul-20", "Aug-20", "Sep-20", "Oct-20", "Nov-20", "Dec-20",
        "Jan-21", "Feb-21", "Mar-21", "Apr-21", "May-21", "Jun-21",
      ],
    arrivals: manifestAll.slice(0,12),
    estimatedArrivals: estimatedAll.slice(0,12),
    ulTests: ulAll.slice(0,12),
    areebaOummal: areebaOummalAll.slice(0,12),
      exchangeRates: exchangeRateData.phase1,
      sayrafaRates: sayrafaRateData.phase1,
      lollarRates: lollarRateData.phase1,
    },
    phase2: {
      name: "Phase 2",
      period: "01-07-2021 to 09-01-2022 (UL ends Jan 9)",
      months: fullMonths.slice(12,19), // Jul-21 .. Jan-22 (Phase 2 ends Jan 9, includes partial Jan)
      arrivals: manifestAll.slice(12,19),
      estimatedArrivals: estimatedAll.slice(12,19),
      ulTests: ulAll.slice(12,19),
      areebaOummal: areebaOummalAll.slice(12,19),
      exchangeRates: exchangeRateData.phase2, // Jul-21 .. Jan-22
      sayrafaRates: sayrafaRateData.phase2,    // Jul-21 .. Jan-22
      lollarRates: lollarRateData.phase2,
    },
    phase3: {
      name: "Phase 3",
      period: "10-01-2022 to 28-02-2022 (Areeba+Oummal starts Jan 10)",
      months: fullMonths.slice(18, 20), // Jan-22 and Feb-22 only (Phase 3 original scope)
      arrivals: manifestAll.slice(18, 20),
      estimatedArrivals: estimatedAll.slice(18, 20), 
      ulTests: ulAll.slice(18, 20),
      areebaOummal: areebaOummalAll.slice(18, 20),
      exchangeRates: exchangeRateData.phase2.slice(6).concat(exchangeRateData.phase3.slice(0, 1)), // Jan-22 and Feb-22 only
      sayrafaRates: sayrafaRateData.phase2.slice(6).concat(sayrafaRateData.phase3.slice(0, 1)), // Jan-22 and Feb-22 only
      lollarRates: lollarRateData.phase2.slice(6).concat(lollarRateData.phase3.slice(0, 1)),
    },
  }

  export default function ArrivalsChart() {
    const chartRef = useRef<HTMLDivElement>(null)
    const chartInstance = useRef<echarts.ECharts | null>(null)
    const [selectedPhase, setSelectedPhase] = useState<keyof typeof phases>("all")
    const [isDarkMode, setIsDarkMode] = useState(false)
    // Selected data index (month) for showing detailed values
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [seriesVisibility, setSeriesVisibility] = useState({
      manifest: true,
      estimated: true,
      ul: true,
      areebaOummal: true,
      exchangeRate: true,
      sayrafaRate: true,
      lollarRate: true,
    })
    // Area fill (background color under line) visibility per series
    const [fillVisibility, setFillVisibility] = useState({
      manifest: true,
      estimated: true,
      ul: true,
      areebaOummal: true,
      exchangeRate: true,
      sayrafaRate: true,
      lollarRate: true,
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
      areebaManifest: false,
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

    const toggleFill = (series: keyof typeof fillVisibility) => {
      setFillVisibility(prev => ({
        ...prev,
        [series]: !prev[series]
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
        areebaOummal: allPhase.areebaOummal.map((value, index) => {
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
      const displayData = currentPhase
      // Build unified Provider series (UL before Jan-22, UL + A+O at Jan-22, A+O after Jan-22)
      const janIndex = displayData.months.indexOf('Jan-22')
      const providerBefore: (number | null)[] = []
      const providerAfter: (number | null)[] = []
      for (let i = 0; i < displayData.months.length; i++) {
        const ulVal = displayData.ulTests ? displayData.ulTests[i] : null
        const aoVal = displayData.areebaOummal ? displayData.areebaOummal[i] : null
        if (janIndex === -1) {
          // Fallback: prefer A+O if exists else UL
            providerBefore.push(ulVal)
            providerAfter.push(aoVal)
          continue
        }
        if (i < janIndex) {
          providerBefore.push(ulVal)
          providerAfter.push(null)
        } else if (i === janIndex) {
          // Sum at January transition
          const summed = (ulVal ?? 0) + (aoVal ?? 0)
          providerBefore.push(summed)
          providerAfter.push(summed)
        } else { // after Jan
          providerBefore.push(null)
          providerAfter.push(aoVal)
        }
      }
      // Midpoint separator between Jan-22 and Feb-22
      const janBoundary = janIndex !== -1
        ? janIndex + 0.5
        : 18.5
      // Position (slightly offset) for vertical separator showing UL -> Areeba+Oummal transition
      const ulAreebaTransitionPosition = (() => {
        if (janIndex === -1) return null
        // Larger offset so the line is more noticeably to the right of Jan.
        // 0.0  = exactly on Jan, 0.5 = midpoint between Jan & Feb. We choose 0.42.
        const offset = 0.42
        return janIndex + offset
      })()

      const option: echarts.EChartsOption = {
        title: {
          text: `${currentPhase.name} - Arrivals Analysis & Currency Rates`,
          subtext: `${currentPhase.period} • Currency Rate at bottom, Arrivals above with separate scales`,
          left: "center",
          textStyle: {
            fontSize: 20,
            fontWeight: "bold",
          },
        },
        tooltip: {
          trigger: "axis",
          triggerOn: "mousemove|click",
          axisPointer: {
            type: "cross",
            snap: true,
            label: {
              backgroundColor: "#6a7985",
            },
            // Make the horizontal (and crosshair) line match the vertical highlight style
            lineStyle: {
              color: '#CCFF00',
              width: 2,
              type: 'solid'
            },
            crossStyle: {
              color: '#CCFF00',
              width: 2,
              type: 'solid'
            }
          },
          formatter: (params: any) => {
            // Collect values by series name first
            const valueMap: Record<string, number | null> = {}
            params.forEach((p: any) => {
              if (p == null) return
              if (p.value === null || p.value === undefined) return
              if (p.seriesName === 'Currency Rate') {
                valueMap[p.seriesName] = Math.abs(p.value)
              } else {
                valueMap[p.seriesName] = p.value
              }
            })
            const manifest = valueMap['Manifest']
            const estimated = valueMap['Estimated']
            const currency = valueMap['Currency Rate']
            const sayrafa = valueMap['Sayrafa Rate']
            // Derive UL & A+O values directly from underlying arrays so they are available even if not plotted as separate lines
            const axisMonth = params[0]?.axisValue
            const monthIdx = displayData.months.indexOf(axisMonth)
            const ul = monthIdx >= 0 ? displayData.ulTests[monthIdx] : null
            const aoVal = monthIdx >= 0 && displayData.areebaOummal ? displayData.areebaOummal[monthIdx] : null
            // Provider combined (for information only)
            let providerVal: number | null = null
            let providerInfo = ''
            if (monthIdx >= 0) {
              if (janIndex !== -1) {
                if (monthIdx < janIndex) {
                  providerVal = ul
                  providerInfo = 'UL'
                } else if (monthIdx === janIndex) {
                  providerVal = (ul ?? 0) + (aoVal ?? 0)
                  providerInfo = 'UL and Areeba+Oummal total'
                } else {
                  providerVal = aoVal
                  providerInfo = 'Areeba+Oummal'
                }
              } else {
                providerVal = aoVal ?? ul
                providerInfo = aoVal ? 'Areeba+Oummal' : 'UL'
              }
            }

            // Differences (always absolute, never show negative signs)
            // Manifest vs Estimated
            const diffManifestEstimated = (manifest != null && estimated != null) ? Math.abs(estimated - manifest) : null
            // Group 1 (Estimated/UL) Difference: UL vs Estimated
            const diffULvsEstimated = (ul != null && estimated != null) ? Math.abs(ul - estimated) : null
            // Group 2 (Rates) Difference: Market vs Sayrafa
            const diffMarketSayrafa = (currency != null && sayrafa != null) ? Math.abs(currency - sayrafa) : null
            // Areeba+Oummal vs Manifest
            const diffAreebaManifest = (aoVal != null && manifest != null) ? Math.abs((aoVal as number) - manifest) : null

            const fmt = (v: number | null | undefined, unit?: string) => {
              if (v == null) return '—'
              return v.toLocaleString() + (unit ? ` ${unit}` : '')
            }

            // Build ordered custom layout according to user requirements:
            // Manifest
            // Estimated 
            // Difference between Manifest and estimated
            // ---
            // Estimated 
            // UL
            // Difference between Estimated and UL
            // ---
            // Estimated 
            // 3rd Phase (Areeba+Oummal)
            // Difference
            // ---
            // Market
            // Sayrafa
            // Difference

            let html = `<div style="min-width:170px">` +
              `<div style="font-weight:600;margin-bottom:4px">${params[0]?.axisValue ?? ''}</div>` +
              `<div><span style="color:#6b7280">Manifest:</span> ${fmt(manifest)}</div>` +
              `<div><span style="color:#111827">Estimated:</span> ${fmt(estimated)}</div>` +
              `<div><span style="color:${isDarkMode ? '#c4b5fd' : '#8b5cf6'}">Difference between Manifest and estimated:</span> ${fmt(diffManifestEstimated)}</div>` +
              `<div style="border-top:1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};margin:4px 0"></div>` +
              `<div><span style="color:#111827">Estimated:</span> ${fmt(estimated)}</div>` +
              `<div><span style="color:#2563eb">UL:</span> ${fmt(ul)}</div>` +
              `<div><span style="color:${isDarkMode ? '#6366f1' : '#4f46e5'}">Difference between Estimated and UL:</span> ${fmt(diffULvsEstimated)}</div>` +
              `<div style="border-top:1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};margin:4px 0"></div>` +
              `<div><span style="color:#111827">Estimated:</span> ${fmt(estimated)}</div>` +
              `<div><span style=\"color:#7c3aed">3rd Phase:</span> ${fmt(aoVal)}</div>` +
              `<div><span style=\"color:#7c3aed">Difference:</span> ${fmt(diffAreebaManifest)}</div>` +
              `<div style="border-top:1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};margin:4px 0"></div>` +
              `<div><span style=\"color:#dc2626">Market:</span> ${fmt(currency, 'LBP')}</div>` +
              `<div><span style="color:#16a34a">Sayrafa:</span> ${fmt(sayrafa, 'LBP')}</div>` +
              `<div><span style="color:${isDarkMode ? '#f97316' : '#ea580c'}">Difference:</span> ${fmt(diffMarketSayrafa, 'LBP')}</div>` +
              `</div>`
            return html
          },
        },
        legend: {
          show: false,
        },
        // Reduced lateral padding (left/right) to effectively enlarge horizontal plotting area (~15% wider)
        // Overall container height increased below in the DOM element.
        grid: [
          {
            id: 'arrivals',
            left: "6%",
            right: "3%", 
            bottom: "55%",
            top: 80,
            containLabel: true,
          },
          {
            id: 'exchange',
            left: "6%",
            right: "3%",
            bottom: "15%",
            top: "55%",
            containLabel: true,
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
            position: "left",
            min: 0,
            // Phase 3 has lower ceiling requirements -> 200k max with 25k ticks
            max: selectedPhase === 'phase3' ? 200000 : 500000,
            interval: selectedPhase === 'phase3' ? 25000 : 50000,
            axisLabel: {
              margin: 8,
              // Show full values without abbreviation (no 'k')
              formatter: (value: number) => value.toLocaleString(),
            },
            nameLocation: 'end',
            nameGap: 10,
            nameRotate: 0,
            nameTextStyle: {
              fontWeight: 600,
              align: 'left'
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
            name: "Currency Rate",
            position: "left",
            boundaryGap: [1.20, 1.20],
            min: 1515,
            max: 30000,
            interval: 3500,
            axisLabel: {
              margin: 8,
              // Show full values without abbreviation (no 'k')
              formatter: (value: number) => value.toLocaleString(),
            },
            nameLocation: 'end',
            nameGap: 10,
            nameRotate: 0,
            nameTextStyle: {
              fontWeight: 600,
              align: 'left'
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
          // Phase 2 explicit end marker (Jan 9, 2022) to clarify that Phase 2 includes a partial Jan-22
          ...(selectedPhase === 'phase2' ? [
            {
              name: 'Phase 2 End (Jan 9)',
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
                  color: '#7c3aed',
                  width: 2,
                  type: 'solid' as const,
                  opacity: 0.9
                },
                label: {
                  show: true,
                  position: 'insideEndTop',
                  formatter: 'Ends Jan 9 (UL)',
                  color: '#7c3aed',
                  fontSize: 11,
                  fontWeight: 'bold'
                },
                data: [ { xAxis: 'Jan-22' } ]
              }
            },
            {
              name: 'Phase 2 End (Jan 9) Exchange',
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
                  color: '#7c3aed',
                  width: 2,
                  type: 'solid' as const,
                  opacity: 0.9
                },
                label: {
                  show: true,
                  position: 'insideEndBottom',
                  formatter: 'Ends Jan 9',
                  color: '#7c3aed',
                  fontSize: 10,
                  fontWeight: 'bold'
                },
                data: [ { xAxis: 'Jan-22' } ]
              }
            }
          ] : []),
          ...(differenceVisibility.areebaManifest && seriesVisibility.areebaOummal && seriesVisibility.manifest ? (() => {
            const m = displayData.arrivals as (number|null)[]
            const ao = displayData.areebaOummal as (number|null)[]
            const base = m.map((v,i)=> (v!=null && ao[i]!=null) ? Math.min(v, ao[i] as number) : null)
            const diff = m.map((v,i)=> (v!=null && ao[i]!=null) ? Math.abs((ao[i] as number) - v) : null)
            return [
              ({
                name: 'Δ A+O vs Manifest (base)',
                type: 'line',
                xAxisIndex: 0,
                yAxisIndex: 0,
                stack: 'AO_M_DIFF',
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
                name: 'Δ A+O vs Manifest',
                type: 'line',
                xAxisIndex: 0,
                yAxisIndex: 0,
                stack: 'AO_M_DIFF',
                data: diff,
                showSymbol: false,
                smooth: true,
                silent: true,
                clip: true,
                lineStyle: { opacity: 0 },
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
                name: 'Δ Currency vs Sayrafa (base)',
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
                name: 'Δ Currency vs Sayrafa',
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
            areaStyle: fillVisibility.manifest ? {
              opacity: 0.1,
              color: "#6b7280",
            } : undefined,
            emphasis: {
              focus: "series",
            },
          },
          {
            name: "Provider (UL → A+O)",
            type: "line",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: providerBefore,
            smooth: true,
            connectNulls: false,
            lineStyle: {
              width: 3,
              color: '#3b82f6'
            },
            itemStyle: {
              color: "#3b82f6",
            },
            areaStyle: undefined,
            emphasis: {
              focus: "series",
            },
          },
          {
            name: "Provider (A+O)",
            type: "line",
            xAxisIndex: 0,
            yAxisIndex: 0,
            data: providerAfter,
            smooth: true,
            connectNulls: false,
            lineStyle: {
              width: 3,
              color: '#7c3aed'
            },
            itemStyle: {
              color: "#7c3aed",
            },
            areaStyle: undefined,
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
            areaStyle: fillVisibility.estimated ? {
              opacity: 0.1,
              color: "#000000",
            } : undefined,
            emphasis: {
              focus: "series",
            },
          },
          {
            name: "Currency Rate",
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
            areaStyle: fillVisibility.exchangeRate ? {
              opacity: 0.3,
              color: "#ef4444",
            } : undefined,
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
            areaStyle: fillVisibility.sayrafaRate ? {
              opacity: 0.2,
              color: "#22c55e",
            } : undefined,
            emphasis: {
              focus: "series",
            },
          },
          {
            name: "Lollar Rate",
            type: "line",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: seriesVisibility.lollarRate ? displayData.lollarRates : [],
            smooth: false,
            connectNulls: false,
            lineStyle: {
              width: 2,
              type: "solid",
            },
            itemStyle: {
              color: "#f59e0b",
            },
            areaStyle: fillVisibility.lollarRate ? {
              opacity: 0.2,
              color: "#f59e0b",
            } : undefined,
            emphasis: {
              focus: "series",
            },
          },
          // Phase separator lines (only shown in "All Phases" view)
          ...(selectedPhase === 'all' ? [
            // Phase 1 to Phase 2 separator (after Jun-21, before Jul-21)
            {
              name: 'Phase 1-2 Separator (Arrivals)',
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
                  color: '#94a3b8',
                  width: 1,
                  type: 'dashed' as const,
                  opacity: 0.7
                },
                label: {
                  show: true,
                  position: 'insideEndTop',
                  formatter: 'Phase 1 → 2',
                  color: '#64748b',
                  fontSize: 10,
                  fontWeight: 'normal'
                },
                data: [ { xAxis: 11.5 } ] // Between Jun-21 (index 11) and Jul-21 (index 12)
              }
            },
            {
              name: 'Phase 1-2 Separator (Exchange)',
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
                  color: '#94a3b8',
                  width: 1,
                  type: 'dashed' as const,
                  opacity: 0.7
                },
                label: { show: false },
                data: [ { xAxis: 11.5 } ]
              }
            },
            // (Removed Phase 2-3 separator as requested)
          ] : []),
          // UL -> Areeba+Oummal transition vertical separator (shown when Jan-22 and both providers context are relevant)
          ...((ulAreebaTransitionPosition !== null) && (selectedPhase === 'all' || selectedPhase === 'phase3') ? [
            {
              name: 'Transition from UL to Areeba+Oummal ',
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
                  color: '#7c3aed',
                  width: 2,
                  type: 'solid' as const,
                  opacity: 0.9
                },
                label: {
                  show: true,
                  position: 'insideEndTop',
                  formatter: 'Transition to 3rd phase',
                  color: '#7c3aed',
                  fontSize: 8,
                  fontWeight: 'bold'
                },
                data: [ { xAxis: ulAreebaTransitionPosition } ]
              }
            },
            {
              name: 'UL→A+O Transition (Exchange)',
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
                  color: '#7c3aed',
                  width: 2,
                  type: 'solid' as const,
                  opacity: 0.9
                },
                label: {
                  show: true,
                  position: 'insideEndBottom',
                  formatter: 'transition to 3rd phase',
                  color: '#7c3aed',
                  fontSize: 10,
                  fontWeight: 'bold'
                },
                data: [ { xAxis: ulAreebaTransitionPosition } ]
              }
            }
          ] : []),
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
          // Lock the axisPointer to the exact data point position
          chartInstance.current?.dispatchAction({
            type: 'updateAxisPointer',
            currTrigger: 'click',
            xAxisIndex: [0, 1],
            dataIndex: params.dataIndex
          })
          // Show tooltip at the exact position
          chartInstance.current?.dispatchAction({
            type: 'showTip',
            seriesIndex: params.seriesIndex,
            dataIndex: params.dataIndex
          })
        }
      })

      // Prevent tooltip from moving on slight mouse movements when a point is selected
      chartInstance.current.off('mousemove')
      chartInstance.current.on('mousemove', (params: any) => {
        if (selectedIndex !== null) {
          // Keep the axisPointer locked to the selected point
          chartInstance.current?.dispatchAction({
            type: 'updateAxisPointer',
            currTrigger: 'click',
            xAxisIndex: [0, 1], 
            dataIndex: selectedIndex
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
  }, [selectedPhase, isDarkMode, seriesVisibility, fillVisibility, phaseVisibility, selectedIndex, differenceVisibility])

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col gap-4">
            {/* Navigation Button */}
            <div className="flex justify-end">
              <a 
                href="/in-out"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                IN-OUT
              </a>
            </div>
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
              >Manifest vs Estimated</button>
              <button
                onClick={() => toggleDifference('estimatedUL')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${differenceVisibility.estimatedUL ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}
              >UL vs Estimated</button>
              <button
                onClick={() => toggleDifference('marketSayrafa')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${differenceVisibility.marketSayrafa ? 'bg-red-600 text-white' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}
              >Market vs Sayrafa</button>
              <button
                onClick={() => toggleDifference('areebaManifest')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${differenceVisibility.areebaManifest ? 'bg-purple-600 text-white' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'}`}
              >Estimated vs 3rd phase</button>
            </div>

            {/* Area Fill Toggles */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className="text-xs uppercase tracking-wide text-muted-foreground mr-2">Area Fill:</span>
              <button onClick={() => toggleFill('manifest')} className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${fillVisibility.manifest ? 'bg-gray-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Manifest</button>
              <button onClick={() => toggleFill('ul')} className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${fillVisibility.ul ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>UL</button>
                            <button onClick={() => toggleFill('estimated')} className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${fillVisibility.estimated ? 'bg-black text-white dark:bg-black/80' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>Estimated</button>
              <button onClick={() => toggleFill('areebaOummal')} className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${fillVisibility.areebaOummal ? 'bg-purple-600 text-white' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'}`}>3rd Phase</button>

              
              <button onClick={() => toggleFill('exchangeRate')} className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${fillVisibility.exchangeRate ? 'bg-red-600 text-white' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}>Market</button>
              <button onClick={() => toggleFill('sayrafaRate')} className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${fillVisibility.sayrafaRate ? 'bg-green-600 text-white' : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'}`}>Sayrafa</button>
            </div>



            <p className="text-sm text-muted-foreground text-center">
              Currency rate displayed at bottom (1515-30000 LBP), arrivals data above with separate scales. 
              Both charts are synchronized and can be zoomed independently. Click the cards below to toggle data series visibility.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {/* Increased chart height by ~15% (600px -> 690px) for better vertical resolution of both sections */}
          <div ref={chartRef} className="w-full h-[690px]" style={{ minHeight: "690px" }} />
          {/* Selected month details */}
          <div className="mt-4 p-4 rounded-lg border bg-muted/30 text-sm">
            {(() => {
              const currentPhase = getFilteredPhaseData()
              const displayData = currentPhase
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
              const aoVal = currentPhase.areebaOummal ? currentPhase.areebaOummal[selectedIndex] : null
              return (
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="font-medium">{monthLabel}</div>
                  <div className="flex gap-3 flex-wrap">
                    <span className="text-gray-600 dark:text-gray-300">Manifest: {manifestVal != null ? manifestVal.toLocaleString() : '—'}</span>
                    <span className="text-black dark:text-white">Estimated: {estimatedVal != null ? estimatedVal.toLocaleString() : '—'}</span>
                    <span className="text-blue-600 dark:text-blue-400">UL: {ulVal != null ? ulVal.toLocaleString() : '—'}</span>
                    <span className="text-purple-600 dark:text-purple-400">Areeba+Oummal: {aoVal != null ? (aoVal as number).toLocaleString() : '—'}</span>
                    <span className="text-red-600">USD/LBP: {exVal != null ? exVal.toLocaleString() + ' LBP' : '—'}</span>
                    <span className="text-green-600 dark:text-green-400">Sayrafa: {sayrafaVal != null ? sayrafaVal.toLocaleString() + ' LBP' : '—'}</span>
                  </div>
                </div>
              )
            })()}
          </div>
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
              onClick={() => toggleSeries('areebaOummal')}
              className={`text-center p-4 rounded-lg transition-all duration-200 ${
                seriesVisibility.areebaOummal
                  ? 'bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/30'
                  : 'bg-gray-200 dark:bg-gray-800 opacity-50'
              }`}
            >
              <div className={`text-2xl font-bold ${
                seriesVisibility.areebaOummal ? 'text-purple-600' : 'text-gray-400'
              }`}>
                {(() => {
                  const currentPhase = getFilteredPhaseData()
                  if (!currentPhase.areebaOummal) return '—'
                  const validValues = currentPhase.areebaOummal.filter((v: number | null): v is number => v != null)
                  if (!validValues.length) return '—'
                  const sum = validValues.reduce((a:number,b:number)=>a+b,0)
                  return sum.toLocaleString()
                })()}
              </div>
              <div className="text-sm text-muted-foreground">Total Phase 3</div>
              <div className="text-xs text-muted-foreground mt-1">
                {seriesVisibility.areebaOummal ? 'Click to hide' : 'Click to show'}
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
              <div className="text-sm text-muted-foreground">Average Market Rate</div>
              <div className="text-xs text-muted-foreground mt-1">
                {seriesVisibility.exchangeRate ? 'Click to hide' : 'Click to show'}
              </div>
            </button>
          </div>
          
          {/* Polar Charts for Airline Distribution */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 2021 Polar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-center">2021 - Airlines Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[500px]">
                  <div ref={(ref) => {
                    if (ref && !ref.hasAttribute('data-initialized-2021')) {
                      const chart2021 = echarts.init(ref)
                      ref.setAttribute('data-initialized-2021', 'true')
                      
                      const data2021 = [
                        { name: 'Middle East Airline', value: 38 },
                        { name: 'Turkish Airlines', value: 12 },
                        { name: 'Emirates Airlines', value: 7 },
                        { name: 'Qatar Airways', value: 5 },
                        { name: 'Pegasus Airlines', value: 4 },
                        { name: 'Iraqi Airways', value: 3 },
                        { name: 'Air France', value: 3 },
                        { name: 'Ethiopian Airlines', value: 3 },
                        { name: 'Egypt Air', value: 3 },
                        { name: 'SundAir', value: 2 },
                        { name: 'Others', value: 21 }
                      ]

                      const option2021 = {
                        angleAxis: {
                          type: 'category',
                          data: data2021.map(item => item.name),
                          axisLabel: {
                            fontSize: 12,
                            rotate: 45
                          }
                        },
                        radiusAxis: {
                          min: 0,
                          max: 40,
                          axisLabel: {
                            formatter: '{value}%',
                            fontSize: 11
                          }
                        },
                        polar: {
                          radius: [30, '85%']
                        },
                        series: [{
                          type: 'bar',
                          data: data2021.map(item => item.value),
                          coordinateSystem: 'polar',
                          name: 'Distribution',
                          itemStyle: {
                            color: function(params: any) {
                              const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFB6C1', '#87CEEB', '#F0E68C', '#D3D3D3']
                              return colors[params.dataIndex % colors.length]
                            }
                          },
                          label: {
                            show: true,
                            position: 'middle',
                            formatter: '{c}%',
                            fontSize: 12,
                            fontWeight: 'bold'
                          }
                        }],
                        tooltip: {
                          trigger: 'item',
                          formatter: '{b}: {c}%'
                        },
                        legend: {
                          show: false
                        }
                      }

                      chart2021.setOption(option2021)
                      
                      const handleResize2021 = () => chart2021.resize()
                      window.addEventListener('resize', handleResize2021)
                      
                      return () => {
                        window.removeEventListener('resize', handleResize2021)
                        chart2021.dispose()
                      }
                    }
                  }} className="w-full h-full" />
                </div>
              </CardContent>
            </Card>

            {/* 2022 Polar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-center">2022 - Airlines Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[500px]">
                  <div ref={(ref) => {
                    if (ref && !ref.hasAttribute('data-initialized-2022')) {
                      const chart2022 = echarts.init(ref)
                      ref.setAttribute('data-initialized-2022', 'true')
                      
                      const data2022 = [
                        { name: 'Middle East Airline', value: 39 },
                        { name: 'Turkish Airlines', value: 10 },
                        { name: 'Emirates Airlines', value: 6 },
                        { name: 'Pegasus Airlines', value: 5 },
                        { name: 'Qatar Airways', value: 4 },
                        { name: 'Air France', value: 3 },
                        { name: 'Egypt Air', value: 3 },
                        { name: 'Iraqi Airways', value: 3 },
                        { name: 'Lufthansa', value: 2 },
                        { name: 'Royal Jordanian', value: 2 },
                        { name: 'Others', value: 22 }
                      ]

                      const option2022 = {
                        angleAxis: {
                          type: 'category',
                          data: data2022.map(item => item.name),
                          axisLabel: {
                            fontSize: 12,
                            rotate: 45
                          }
                        },
                        radiusAxis: {
                          min: 0,
                          max: 40,
                          axisLabel: {
                            formatter: '{value}%',
                            fontSize: 11
                          }
                        },
                        polar: {
                          radius: [30, '85%']
                        },
                        series: [{
                          type: 'bar',
                          data: data2022.map(item => item.value),
                          coordinateSystem: 'polar',
                          name: 'Distribution',
                          itemStyle: {
                            color: function(params: any) {
                              const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFB6C1', '#87CEEB', '#F0E68C', '#D3D3D3']
                              return colors[params.dataIndex % colors.length]
                            }
                          },
                          label: {
                            show: true,
                            position: 'middle',
                            formatter: '{c}%',
                            fontSize: 12,
                            fontWeight: 'bold'
                          }
                        }],
                        tooltip: {
                          trigger: 'item',
                          formatter: '{b}: {c}%'
                        },
                        legend: {
                          show: false
                        }
                      }

                      chart2022.setOption(option2022)
                      
                      const handleResize2022 = () => chart2022.resize()
                      window.addEventListener('resize', handleResize2022)
                      
                      return () => {
                        window.removeEventListener('resize', handleResize2022)
                        chart2022.dispose()
                      }
                    }
                  }} className="w-full h-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    )
  }

