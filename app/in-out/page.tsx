"use client"

import { useEffect, useRef } from "react"
import * as echarts from "echarts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InOutPage() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize the chart
    chartInstance.current = echarts.init(chartRef.current)

    // Payer data (inner pie chart)
    const payerData = [
      { name: 'Airlines', value: 192515, percentage: '65%' },
      { name: 'American Express', value: 96900, percentage: '33%' },
      { name: 'Border PCR', value: 5969, percentage: '2%' }
    ]

    // Expense type data (outer pie chart)
    const expenseData = [
      { name: 'Treasury (MoF)', value: 185609, percentage: '63%' },
      { name: 'Human Resources (+MoF+NSSF)', value: 78042, percentage: '26%' },
      { name: 'Project operation supplies', value: 19156, percentage: '6%' },
      { name: 'Other (supplies, rent, tests..)', value: 12577, percentage: '4%' }
    ]

    const option = {
      title: {
      
        
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params: any) {
          return `${params.seriesName}<br/>${params.name}: $${params.value.toLocaleString()} (${params.percent}%)`
        }
      },
      legend: [
        {
          orient: 'vertical',
          left: 'left',
          top: 'bottom',
          data: payerData.map(item => item.name),
   
          textStyle: {
            fontSize: 12
          },
          formatter: function(name: string) {
            const item = payerData.find(d => d.name === name)
            return `${name}: ${item?.percentage || ''}`
          }
        },
        {
          orient: 'vertical',
          right: 'right',
          top: 'bottom',
          data: expenseData.map(item => item.name),
          textStyle: {
            fontSize: 12
          },
          formatter: function(name: string) {
            const item = expenseData.find(d => d.name === name)
            return `${name}: ${item?.percentage || ''}`
          }
        }
      ],
      graphic: [
        {
          type: 'text',
          left: '5%',
          top: '80%',
          style: {
            text: 'IN',
            fontSize: 18,
            fontWeight: 'bold',
            fill: '#333',
          
          }
        },
        {
          type: 'text',
          right: '5%',
          top: '80%',
          style: {
            text: 'OUT',
            fontSize: 18,
            fontWeight: 'bold',
            fill: '#333'
          }
        }
      ],
      series: [
        {
          name: 'Payer (Debit)',
          type: 'pie',
          radius: ['0%', '30%'],
          center: ['50%', '50%'],
          data: payerData,
          label: {
            show: true,
            position: 'inside',
            formatter: '{d}%',
            fontSize: 10,
            fontWeight: 'bold'
          },
          labelLine: {
            show: false
          },
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 2
          },
          color: ['#FF6B6B', '#4ECDC4', '#45B7D1']
        },
        {
          name: 'Expense Type (Credit)',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          data: expenseData,
          label: {
            show: true,
            position: 'outside',
            formatter: function(params: any) {
              return `${params.name}\n$${params.value.toLocaleString()}\n(${params.percent}%)`
            },
            fontSize: 11
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10
          },
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 2
          },
          color: ['#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
        }
      ]
    }

    chartInstance.current.setOption(option)

    // Handle window resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [])

  return (
    <main className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-[92rem] mx-auto">
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl">Financial Flow</CardTitle>
              <a 
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Chart
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Payer Summary Table */}
              <div>
             
                <h4 className="text-md font-medium mb-4">Payer Sources (Debit)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Payer</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">Debit</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Airlines</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">$192,515</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">65%</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">American Express</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">$96,900</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">33%</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Border PCR</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">$5,969</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">2%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Expense Summary Table */}
              <div>
             
                <h4 className="text-md font-medium mb-4">Payments and Expense Types (Credit)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Expense type</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">Credit</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Treasury (MoF)</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">$185,609</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">63%</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Human Resources (+MoF+NSSF)</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">$78,042</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">26%</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Project operation supplies</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">$19,156</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">6%</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Other (supplies, rent, tests..)</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">$12,577</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">4%</td>
                      </tr>
                      <tr className="font-semibold bg-gray-50 dark:bg-gray-800">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Total:</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">$295,384</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Nested Pie Chart */}
            <div className="w-full h-[600px] border rounded-lg">
              <div ref={chartRef} className="w-full h-full" />
            </div>
          </CardContent>
        </Card>

        {/* Analytical Comparison Section */}
        <Card className="w-full mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Performance Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold">Analytical Comparison</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold"></th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold"></th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold">Phase II</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center font-semibold">Phase III</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Outcome Section */}
                  <tr>
                    <td rowSpan={8} className="border border-gray-300 dark:border-gray-600 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 font-semibold align-top">
                      Outcome
                    </td>
                    <td rowSpan={4} className="border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-800 font-medium align-top">
                      Acclaimed number of tests vs. Estimated number of tests
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"># UL</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">1,000,000</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"># Est</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">1,306,455</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"># Oummal&Areeba</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"></td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">226,048</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">#Est</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"></td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">243,665</td>
                  </tr>
                  <tr>
                    <td rowSpan={4} className="border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-800 font-medium align-top">
                      Acclaimed amount vs. Estimated amount
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Am UL</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$50,000,000</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Am Est</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$65,322,750</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Am O&Aree</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"></td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$6,394,730</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Am Est</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2"></td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$7,309,950</td>
                  </tr>

                  {/* Impact Section */}
                  <tr>
                    <td rowSpan={8} className="border border-gray-300 dark:border-gray-600 px-4 py-3 bg-green-50 dark:bg-green-900/20 font-semibold align-top">
                      Impact
                    </td>
                    <td rowSpan={5} className="border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-800 font-medium align-top">
                      Epidemiological Surveillance
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Untested arrivals at the airport:</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">306,455</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">617</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Estimated infected arrivals (3%):</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">9,194</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">19</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Potential secondary infections (Re 2.5):</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">22,984</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">46</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Hospitalizations (1-5%):</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">92 - 460</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">0 - 1</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Deaths (0.3–0.6% IFR typical for Delta-era):</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">28 - 55</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">0 - 0</td>
                  </tr>
                  <tr>
                    <td rowSpan={3} className="border border-gray-300 dark:border-gray-600 px-4 py-3 bg-gray-50 dark:bg-gray-800 font-medium align-top">
                      Financial
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Collected by the treasury</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$ -</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$6,394,730</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Not collected by the treasury</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$50,000,000</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$ 405,220</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Unaccounted / Squandered</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$15,322,750</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">$ 510,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>



        {/* Operational Comparison Section */}
        <Card className="w-full mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Operational Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <img 
                src="/Operational.png" 
                alt="Operational Comparison - Old Management vs New Management"
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}