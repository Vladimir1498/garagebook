import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CostPerKmChartProps {
  data: Array<{ month: string; cost_per_km: number }>
}

export default function CostPerKmChart({ data }: CostPerKmChartProps) {
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          formatter={(value: number) => [`${value.toFixed(2)} ₽/км`, 'Стоимость за км']}
        />
        <Line type="monotone" dataKey="cost_per_km" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
