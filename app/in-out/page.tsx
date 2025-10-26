"use client"

import { useEffect, useRef, useState } from "react"
import * as echarts from "echarts"
import html2canvas from 'html2canvas'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Plus, Trash2 } from "lucide-react"

// Flight data types
interface FlightRecord {
  id: string
  date: string
  time: string
  airline: string
  flight: string
  capacity: string
  nbPassengers: string
  nbUnifilMembers: string
  nbChildrenUnder12: string
  nbTestsAcclaimed: string
}

interface TicketRecord {
  id: string
  date: string
  time: string
  airline: string
  flight: string
  ticketPrice: string
  ticketPriceFormula: string
}

export default function InOutPage() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const flightTableRef = useRef<HTMLTableElement>(null)
  const ticketTableRef = useRef<HTMLTableElement>(null)
  const performanceTableRef = useRef<HTMLTableElement>(null)
  
  // State for flight records
  const [flightRecords, setFlightRecords] = useState<FlightRecord[]>([
    {
      id: '1',
      date: '',
      time: '',
      airline: '',
      flight: '',
      capacity: '',
      nbPassengers: '',
      nbUnifilMembers: '',
      nbChildrenUnder12: '',
      nbTestsAcclaimed: ''
    },
    {
      id: '2',
      date: '',
      time: '',
      airline: '',
      flight: '',
      capacity: '',
      nbPassengers: '',
      nbUnifilMembers: '',
      nbChildrenUnder12: '',
      nbTestsAcclaimed: ''
    },
    {
      id: '3',
      date: '',
      time: '',
      airline: '',
      flight: '',
      capacity: '',
      nbPassengers: '',
      nbUnifilMembers: '',
      nbChildrenUnder12: '',
      nbTestsAcclaimed: ''
    },
    {
      id: '4',
      date: '',
      time: '',
      airline: '',
      flight: '',
      capacity: '',
      nbPassengers: '',
      nbUnifilMembers: '',
      nbChildrenUnder12: '',
      nbTestsAcclaimed: ''
    }
  ])

  // State for ticket records
  const [ticketRecords, setTicketRecords] = useState<TicketRecord[]>([
    {
      id: '1',
      date: '',
      time: '',
      airline: '',
      flight: '',
      ticketPrice: '',
      ticketPriceFormula: ''
    },
    {
      id: '2',
      date: '',
      time: '',
      airline: '',
      flight: '',
      ticketPrice: '',
      ticketPriceFormula: ''
    },
    {
      id: '3',
      date: '',
      time: '',
      airline: '',
      flight: '',
      ticketPrice: '',
      ticketPriceFormula: ''
    },
    {
      id: '4',
      date: '',
      time: '',
      airline: '',
      flight: '',
      ticketPrice: '',
      ticketPriceFormula: ''
    }
  ])

  // Functions to handle flight records
  const addFlightRecord = () => {
    const newRecord: FlightRecord = {
      id: Date.now().toString(),
      date: '',
      time: '',
      airline: '',
      flight: '',
      capacity: '',
      nbPassengers: '',
      nbUnifilMembers: '',
      nbChildrenUnder12: '',
      nbTestsAcclaimed: ''
    }
    setFlightRecords([...flightRecords, newRecord])
  }

  const removeFlightRecord = (id: string) => {
    if (flightRecords.length > 1) {
      setFlightRecords(flightRecords.filter(record => record.id !== id))
    }
  }

  const updateFlightRecord = (id: string, field: keyof FlightRecord, value: string) => {
    setFlightRecords(flightRecords.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ))
  }

  // Functions to handle ticket records
  const addTicketRecord = () => {
    const newRecord: TicketRecord = {
      id: Date.now().toString(),
      date: '',
      time: '',
      airline: '',
      flight: '',
      ticketPrice: '',
      ticketPriceFormula: ''
    }
    setTicketRecords([...ticketRecords, newRecord])
  }

  const removeTicketRecord = (id: string) => {
    if (ticketRecords.length > 1) {
      setTicketRecords(ticketRecords.filter(record => record.id !== id))
    }
  }

  const updateTicketRecord = (id: string, field: keyof TicketRecord, value: string) => {
    setTicketRecords(ticketRecords.map(record => 
      record.id === id ? { ...record, [field]: value } : record
    ))
  }

  // Custom canvas-based PNG generation to avoid CSS issues
  const generateTablePNG = (data: any[], headers: string[], filename: string, title: string) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions with extra padding
    const cellWidth = 120
    const cellHeight = 35
    const headerHeight = 45
    const titleHeight = 60
    const bottomPadding = 40
    const sidePadding = 30
    
    const tableWidth = headers.length * cellWidth
    const tableHeight = titleHeight + headerHeight + (data.length * cellHeight)
    
    canvas.width = tableWidth + (sidePadding * 2)
    canvas.height = tableHeight + (sidePadding * 2) + bottomPadding

    // Set background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set font styles
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 18px Arial'
    ctx.textAlign = 'center'

    // Draw title
    ctx.fillText(title, canvas.width / 2, sidePadding + 35)

    // Draw headers
    ctx.font = 'bold 13px Arial'
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(sidePadding, sidePadding + titleHeight, tableWidth, headerHeight)
    
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1
    
    headers.forEach((header, index) => {
      const x = sidePadding + (index * cellWidth)
      const y = sidePadding + titleHeight
      
      // Draw header border
      ctx.strokeRect(x, y, cellWidth, headerHeight)
      
      // Draw header text
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'
      ctx.fillText(header, x + cellWidth / 2, y + headerHeight / 2 + 5)
    })

    // Draw data rows
    ctx.fillStyle = '#ffffff'
    data.forEach((row, rowIndex) => {
      const y = sidePadding + titleHeight + headerHeight + (rowIndex * cellHeight)
      
      headers.forEach((header, colIndex) => {
        const x = sidePadding + (colIndex * cellWidth)
        
        // Draw cell background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x, y, cellWidth, cellHeight)
        
        // Draw cell border
        ctx.strokeRect(x, y, cellWidth, cellHeight)
        
        // Draw cell text
        ctx.fillStyle = '#000000'
        ctx.font = '11px Arial'
        ctx.textAlign = 'center'
        const cellValue = row[header] || ''
        const text = String(cellValue).substring(0, 15) // Limit text length
        ctx.fillText(text, x + cellWidth / 2, y + cellHeight / 2 + 4)
      })
    })

    // Download the image
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const downloadTableAsPNG = async (tableRef: React.RefObject<HTMLTableElement | null>, filename: string) => {
    if (tableRef.current) {
      try {
        // First try the original method
        const wrapper = document.createElement('div')
        wrapper.style.backgroundColor = '#ffffff'
        wrapper.style.color = '#000000'
        wrapper.style.fontFamily = 'Arial, sans-serif'
        wrapper.style.padding = '20px'
        wrapper.style.position = 'absolute'
        wrapper.style.left = '-9999px'
        wrapper.style.top = '0px'
        
        const tableClone = tableRef.current.cloneNode(true) as HTMLTableElement
        tableClone.style.borderCollapse = 'collapse'
        tableClone.style.width = '100%'
        tableClone.style.backgroundColor = '#ffffff'
        tableClone.style.color = '#000000'
        
        const cells = tableClone.querySelectorAll('th, td')
        cells.forEach(cell => {
          const htmlCell = cell as HTMLElement
          htmlCell.style.border = '1px solid #cccccc'
          htmlCell.style.padding = '8px'
          htmlCell.style.backgroundColor = htmlCell.tagName === 'TH' ? '#f5f5f5' : '#ffffff'
          htmlCell.style.color = '#000000'
          htmlCell.style.fontSize = '12px'
        })
        
        const inputs = tableClone.querySelectorAll('input')
        inputs.forEach(input => {
          input.style.border = 'none'
          input.style.backgroundColor = 'transparent'
          input.style.color = '#000000'
          input.style.fontSize = '12px'
          input.style.width = '100%'
        })
        
        wrapper.appendChild(tableClone)
        document.body.appendChild(wrapper)
        
        const canvas = await html2canvas(wrapper, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          ignoreElements: (element) => {
            return element.tagName === 'BUTTON'
          }
        })
        
        document.body.removeChild(wrapper)
        
        const link = document.createElement('a')
        link.download = `${filename}.png`
        link.href = canvas.toDataURL()
        link.click()
      } catch (error) {
        console.error('html2canvas failed, trying fallback method:', error)
        
        // Fallback to custom canvas method
        try {
          let data: any[] = []
          let headers: string[] = []
          let title = ''
          
          if (filename.includes('flight')) {
            headers = ['Date', 'Time', 'Airline', 'Flight', 'Capacity', 'Passengers', 'UNIFIL', 'Children', 'Tests']
            title = 'Flight Information'
            data = flightRecords.map(record => ({
              'Date': record.date,
              'Time': record.time,
              'Airline': record.airline,
              'Flight': record.flight,
              'Capacity': record.capacity,
              'Passengers': record.nbPassengers,
              'UNIFIL': record.nbUnifilMembers,
              'Children': record.nbChildrenUnder12,
              'Tests': record.nbTestsAcclaimed
            }))
          } else {
            headers = ['Date', 'Time', 'Airline', 'Flight', 'Price', 'Formula']
            title = 'Ticket Pricing Information'
            data = ticketRecords.map(record => ({
              'Date': record.date,
              'Time': record.time,
              'Airline': record.airline,
              'Flight': record.flight,
              'Price': record.ticketPrice,
              'Formula': record.ticketPriceFormula
            }))
          }
          
          generateTablePNG(data, headers, filename, title)
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError)
          alert('PNG generation failed. Please use the Excel download option instead.')
        }
      }
    }
  }

  const downloadCombinedDataAsPNG = async () => {
    if (flightTableRef.current && ticketTableRef.current) {
      try {
        // Try the original method first
        const container = document.createElement('div')
        container.style.backgroundColor = '#ffffff'
        container.style.color = '#000000'
        container.style.padding = '20px'
        container.style.fontFamily = 'Arial, sans-serif'
        container.style.position = 'absolute'
        container.style.left = '-9999px'
        container.style.top = '0px'
        
        const title = document.createElement('h2')
        title.textContent = 'Flight Data Entry Tables'
        title.style.textAlign = 'center'
        title.style.marginBottom = '30px'
        title.style.color = '#333333'
        title.style.fontSize = '24px'
        title.style.fontWeight = 'bold'
        container.appendChild(title)
        
        const flightTitle = document.createElement('h3')
        flightTitle.textContent = 'Flight Information'
        flightTitle.style.marginBottom = '10px'
        flightTitle.style.color = '#333333'
        flightTitle.style.fontSize = '18px'
        flightTitle.style.fontWeight = 'bold'
        container.appendChild(flightTitle)
        
        const flightTableClone = flightTableRef.current.cloneNode(true) as HTMLTableElement
        flightTableClone.style.marginBottom = '40px'
        flightTableClone.style.borderCollapse = 'collapse'
        flightTableClone.style.width = '100%'
        flightTableClone.style.backgroundColor = '#ffffff'
        
        const flightCells = flightTableClone.querySelectorAll('th, td')
        flightCells.forEach(cell => {
          const htmlCell = cell as HTMLElement
          htmlCell.style.border = '1px solid #cccccc'
          htmlCell.style.padding = '8px'
          htmlCell.style.backgroundColor = htmlCell.tagName === 'TH' ? '#f5f5f5' : '#ffffff'
          htmlCell.style.color = '#000000'
          htmlCell.style.fontSize = '11px'
        })
        
        const flightInputs = flightTableClone.querySelectorAll('input')
        flightInputs.forEach(input => {
          input.style.border = 'none'
          input.style.backgroundColor = 'transparent'
          input.style.color = '#000000'
          input.style.fontSize = '11px'
          input.style.width = '100%'
        })
        
        container.appendChild(flightTableClone)
        
        const ticketTitle = document.createElement('h3')
        ticketTitle.textContent = 'Ticket Pricing Information'
        ticketTitle.style.marginBottom = '10px'
        ticketTitle.style.color = '#333333'
        ticketTitle.style.fontSize = '18px'
        ticketTitle.style.fontWeight = 'bold'
        container.appendChild(ticketTitle)
        
        const ticketTableClone = ticketTableRef.current.cloneNode(true) as HTMLTableElement
        ticketTableClone.style.borderCollapse = 'collapse'
        ticketTableClone.style.width = '100%'
        ticketTableClone.style.backgroundColor = '#ffffff'
        
        const ticketCells = ticketTableClone.querySelectorAll('th, td')
        ticketCells.forEach(cell => {
          const htmlCell = cell as HTMLElement
          htmlCell.style.border = '1px solid #cccccc'
          htmlCell.style.padding = '8px'
          htmlCell.style.backgroundColor = htmlCell.tagName === 'TH' ? '#f5f5f5' : '#ffffff'
          htmlCell.style.color = '#000000'
          htmlCell.style.fontSize = '11px'
        })
        
        const ticketInputs = ticketTableClone.querySelectorAll('input')
        ticketInputs.forEach(input => {
          input.style.border = 'none'
          input.style.backgroundColor = 'transparent'
          input.style.color = '#000000'
          input.style.fontSize = '11px'
          input.style.width = '100%'
        })
        
        container.appendChild(ticketTableClone)
        document.body.appendChild(container)
        
        const canvas = await html2canvas(container, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          ignoreElements: (element) => {
            return element.tagName === 'BUTTON'
          }
        })
        
        document.body.removeChild(container)
        
        const link = document.createElement('a')
        link.download = 'flight-data-combined.png'
        link.href = canvas.toDataURL()
        link.click()
      } catch (error) {
        console.error('html2canvas failed, trying fallback method:', error)
        
        // Fallback to custom canvas method for combined data
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('Canvas context not available')

          // Set canvas dimensions for combined tables with better spacing
          const cellWidth = 110
          const cellHeight = 30
          const headerHeight = 40
          const titleHeight = 50
          const sectionGap = 60
          const topPadding = 30
          const sidePadding = 30
          const bottomPadding = 50
          
          const flightHeaders = ['Date', 'Time', 'Airline', 'Flight', 'Capacity', 'Pass.', 'UNIFIL', 'Child.', 'Tests']
          const ticketHeaders = ['Date', 'Time', 'Airline', 'Flight', 'Price', 'Formula']
          
          const maxHeaders = Math.max(flightHeaders.length, ticketHeaders.length)
          const tableWidth = maxHeaders * cellWidth
          
          const mainTitleHeight = 60
          const flightTableHeight = titleHeight + headerHeight + (flightRecords.length * cellHeight)
          const ticketTableHeight = titleHeight + headerHeight + (ticketRecords.length * cellHeight)
          
          canvas.width = tableWidth + (sidePadding * 2)
          canvas.height = topPadding + mainTitleHeight + flightTableHeight + sectionGap + ticketTableHeight + bottomPadding

          // Set background
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          let currentY = topPadding

          // Main title
          ctx.fillStyle = '#000000'
          ctx.font = 'bold 22px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('Flight Data Entry Tables', canvas.width / 2, currentY + 35)
          currentY += mainTitleHeight

          // Draw Flight Information Table
          ctx.font = 'bold 16px Arial'
          ctx.fillText('Flight Information', canvas.width / 2, currentY + 30)
          currentY += titleHeight

          // Flight headers
          ctx.font = 'bold 11px Arial'
          ctx.fillStyle = '#f5f5f5'
          ctx.fillRect(sidePadding, currentY, tableWidth, headerHeight)
          
          ctx.strokeStyle = '#cccccc'
          ctx.lineWidth = 1
          
          flightHeaders.forEach((header, index) => {
            const x = sidePadding + (index * cellWidth)
            ctx.strokeRect(x, currentY, cellWidth, headerHeight)
            ctx.fillStyle = '#000000'
            ctx.textAlign = 'center'
            ctx.fillText(header, x + cellWidth / 2, currentY + headerHeight / 2 + 4)
          })
          currentY += headerHeight

          // Flight data
          flightRecords.forEach((record, rowIndex) => {
            const rowData = [record.date, record.time, record.airline, record.flight, record.capacity, record.nbPassengers, record.nbUnifilMembers, record.nbChildrenUnder12, record.nbTestsAcclaimed]
            
            flightHeaders.forEach((_, colIndex) => {
              const x = sidePadding + (colIndex * cellWidth)
              
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(x, currentY, cellWidth, cellHeight)
              ctx.strokeRect(x, currentY, cellWidth, cellHeight)
              
              ctx.fillStyle = '#000000'
              ctx.font = '10px Arial'
              ctx.textAlign = 'center'
              const cellValue = rowData[colIndex] || ''
              const text = String(cellValue).substring(0, 13)
              ctx.fillText(text, x + cellWidth / 2, currentY + cellHeight / 2 + 3)
            })
            currentY += cellHeight
          })

          currentY += sectionGap

          // Draw Ticket Pricing Table
          ctx.font = 'bold 16px Arial'
          ctx.fillText('Ticket Pricing Information', canvas.width / 2, currentY + 30)
          currentY += titleHeight

          // Ticket headers
          ctx.font = 'bold 11px Arial'
          ctx.fillStyle = '#f5f5f5'
          ctx.fillRect(sidePadding, currentY, tableWidth, headerHeight)
          
          ticketHeaders.forEach((header, index) => {
            const x = sidePadding + (index * cellWidth)
            ctx.strokeRect(x, currentY, cellWidth, headerHeight)
            ctx.fillStyle = '#000000'
            ctx.textAlign = 'center'
            ctx.fillText(header, x + cellWidth / 2, currentY + headerHeight / 2 + 4)
          })
          currentY += headerHeight

          // Ticket data
          ticketRecords.forEach((record, rowIndex) => {
            const rowData = [record.date, record.time, record.airline, record.flight, record.ticketPrice, record.ticketPriceFormula]
            
            ticketHeaders.forEach((_, colIndex) => {
              const x = sidePadding + (colIndex * cellWidth)
              
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(x, currentY, cellWidth, cellHeight)
              ctx.strokeRect(x, currentY, cellWidth, cellHeight)
              
              ctx.fillStyle = '#000000'
              ctx.font = '10px Arial'
              ctx.textAlign = 'center'
              const cellValue = rowData[colIndex] || ''
              const text = String(cellValue).substring(0, 13)
              ctx.fillText(text, x + cellWidth / 2, currentY + cellHeight / 2 + 3)
            })
            currentY += cellHeight
          })

          // Download the image
          const link = document.createElement('a')
          link.download = 'flight-data-combined.png'
          link.href = canvas.toDataURL()
          link.click()
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError)
          alert('PNG generation failed. Please use the Excel download option instead.')
        }
      }
    }
  }

  // Payer data (inner pie chart)
  const payerData = [
    { name: 'Airlines', value: 192515, percentage: '65%' },
    { name: 'American Express', value: 96900, percentage: '33%' },
    { name: 'Border PCR', value: 5969, percentage: '2%' }
  ]

  // Calculate payer total
  const payerTotal = payerData.reduce((sum, item) => sum + item.value, 0)

  // Expense type data (outer pie chart)
  const expenseData = [
    { name: 'Treasury (MoF)', value: 185609, percentage: '63%' },
    { name: 'Human Resources (+MoF)', value: 78042, percentage: '26%' },
    { name: 'Project operation supplies', value: 19156, percentage: '6%' },
    { name: 'Other (supplies, rent, tests..)', value: 12577, percentage: '4%' }
  ]

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize the chart
    chartInstance.current = echarts.init(chartRef.current)

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
                      <tr className="font-semibold bg-gray-50 dark:bg-gray-800">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Total:</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">${payerTotal.toLocaleString()}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">100%</td>
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
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Human Resources (+MoF)</td>
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
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Performance Evaluation</CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => downloadTableAsPNG(performanceTableRef, 'performance-evaluation')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PNG
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table ref={performanceTableRef} className="w-full border-collapse border border-gray-300 dark:border-gray-600">
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

        {/* Flight Data Entry Tables */}
        <Card className="w-full mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Flight Data Entry</CardTitle>
              <Button 
                onClick={downloadCombinedDataAsPNG}
                variant="default"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Flight Information</h3>
                <Button onClick={addFlightRecord} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Row
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table ref={flightTableRef} className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Date</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Time</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Airline</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Flight</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Capacity</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Nb of passengers</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Nb of UNIFIL members</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Nb of children under 12</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Nb of tests acclaimed by the UL</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flightRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="date"
                            value={record.date}
                            onChange={(e) => updateFlightRecord(record.id, 'date', e.target.value)}
                            className="border-0 text-sm h-8"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="time"
                            value={record.time}
                            onChange={(e) => updateFlightRecord(record.id, 'time', e.target.value)}
                            className="border-0 text-sm h-8"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="text"
                            value={record.airline}
                            onChange={(e) => updateFlightRecord(record.id, 'airline', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="Airline"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="text"
                            value={record.flight}
                            onChange={(e) => updateFlightRecord(record.id, 'flight', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="Flight #"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="number"
                            value={record.capacity}
                            onChange={(e) => updateFlightRecord(record.id, 'capacity', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="number"
                            value={record.nbPassengers}
                            onChange={(e) => updateFlightRecord(record.id, 'nbPassengers', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="number"
                            value={record.nbUnifilMembers}
                            onChange={(e) => updateFlightRecord(record.id, 'nbUnifilMembers', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="number"
                            value={record.nbChildrenUnder12}
                            onChange={(e) => updateFlightRecord(record.id, 'nbChildrenUnder12', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="number"
                            value={record.nbTestsAcclaimed}
                            onChange={(e) => updateFlightRecord(record.id, 'nbTestsAcclaimed', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1 text-center">
                          <Button
                            onClick={() => removeFlightRecord(record.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={flightRecords.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Ticket Pricing Information</h3>
                <Button onClick={addTicketRecord} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Row
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table ref={ticketTableRef} className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Date</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Time</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Airline</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Flight</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Ticket price</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-semibold">Ticket price formula</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="date"
                            value={record.date}
                            onChange={(e) => updateTicketRecord(record.id, 'date', e.target.value)}
                            className="border-0 text-sm h-8"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="time"
                            value={record.time}
                            onChange={(e) => updateTicketRecord(record.id, 'time', e.target.value)}
                            className="border-0 text-sm h-8"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="text"
                            value={record.airline}
                            onChange={(e) => updateTicketRecord(record.id, 'airline', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="Airline"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="text"
                            value={record.flight}
                            onChange={(e) => updateTicketRecord(record.id, 'flight', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="Flight #"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="text"
                            value={record.ticketPrice}
                            onChange={(e) => updateTicketRecord(record.id, 'ticketPrice', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="$0.00"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1">
                          <Input
                            type="text"
                            value={record.ticketPriceFormula}
                            onChange={(e) => updateTicketRecord(record.id, 'ticketPriceFormula', e.target.value)}
                            className="border-0 text-sm h-8"
                            placeholder="Formula"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-1 py-1 text-center">
                          <Button
                            onClick={() => removeTicketRecord(record.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            disabled={ticketRecords.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}