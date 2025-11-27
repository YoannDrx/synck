'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

type StatusData = {
  name: string
  value: number
  color: string
}

type StatusChartProps = {
  data: StatusData[]
}

export function StatusChart({ data }: StatusChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${String(name)}: ${percent ? (percent * 100).toFixed(0) : '0'}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${String(index)}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#000',
            border: '1px solid #d5ff0a',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
