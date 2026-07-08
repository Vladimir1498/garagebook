import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatMoney } from '../../utils/formatCurrency'

interface MaintenanceTimelineProps {
  data: Array<{ date: string; cost: number; type: string }>
}

export default function MaintenanceTimeline({ data }: MaintenanceTimelineProps) {
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          formatter={(value: number) => [`${formatMoney(value)}`, 'Стоимость']}
        />
        <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
