'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type TimelineData = {
  month: string
  works: number
  published: number
  draft: number
  artists: number
}

type TimelineChartProps = {
  data: TimelineData[]
}

export function TimelineChart({ data }: TimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="month" stroke="#999" style={{ fontSize: '12px' }} />
        <YAxis stroke="#999" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#000',
            border: '1px solid #d5ff0a',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
          formatter={(value) => <span style={{ color: '#999', fontSize: '12px' }}>{value}</span>}
        />
        <Line
          type="monotone"
          dataKey="works"
          name="Projets"
          stroke="#d5ff0a"
          strokeWidth={2}
          dot={{ fill: '#d5ff0a', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="artists"
          name="Artistes"
          stroke="#818cf8"
          strokeWidth={2}
          dot={{ fill: '#818cf8', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
