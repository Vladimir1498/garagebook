import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { formatMoney } from '../../utils/formatCurrency'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1']

interface ExpenseChartProps {
  data: Array<{ category: string; total: number; count: number }>
  type?: 'bar' | 'pie'
}

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (percent < 0.08) return null
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 24
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="fill-surface-600 dark:fill-surface-300" fontSize={11} fontWeight={500}>
      {name}
    </text>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const { category, total } = payload[0].payload
  return (
    <div className="rounded-xl border border-surface-200 bg-white px-3 py-2 shadow-lg dark:border-surface-600 dark:bg-surface-800">
      <p className="text-xs font-medium text-surface-800 dark:text-surface-100">{category}</p>
      <p className="text-sm font-semibold tabular-nums text-surface-900 dark:text-white">{formatMoney(total)}</p>
    </div>
  )
}

export default function ExpenseChart({ data, type = 'pie' }: ExpenseChartProps) {
  if (!data.length) return null

  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total" radius={[8, 8, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="total" nameKey="category" label={renderPieLabel} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((item, i) => (
          <div key={item.category} className="flex items-center gap-1.5 text-xs text-surface-600 dark:text-surface-400">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span>{item.category}</span>
            <span className="font-semibold tabular-nums text-surface-800 dark:text-surface-200">{formatMoney(item.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
