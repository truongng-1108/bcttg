"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts"

export interface ChartPoint {
  name: string
  value: number
}

const fallbackContentData: ChartPoint[] = [
  { name: "T1", value: 45 },
  { name: "T2", value: 52 },
  { name: "T3", value: 48 },
  { name: "T4", value: 61 },
  { name: "T5", value: 55 },
  { name: "T6", value: 67 },
  { name: "T7", value: 72 },
  { name: "T8", value: 58 },
  { name: "T9", value: 64 },
  { name: "T10", value: 78 },
  { name: "T11", value: 82 },
  { name: "T12", value: 91 },
]

const fallbackCategoryData: ChartPoint[] = [
  { name: "Truyền thống", value: 35 },
  { name: "Nét tiêu biểu", value: 28 },
  { name: "Hồ sơ thủ trưởng", value: 15 },
  { name: "Hồ sơ chiến sĩ", value: 45 },
  { name: "Ca khúc", value: 22 },
]

const fallbackAccessData: ChartPoint[] = [
  { name: "T2", value: 120 },
  { name: "T3", value: 145 },
  { name: "T4", value: 132 },
  { name: "T5", value: 167 },
  { name: "T6", value: 189 },
  { name: "T7", value: 156 },
  { name: "CN", value: 98 },
]

const fallbackCategoryColors = [
  "#C62828",
  "#B71C1C",
  "#C9A227",
  "#D4A574",
  "#8B4513",
  "#1565C0",
  "#2E7D32",
]

function withCategoryColors(data: ChartPoint[]) {
  return data.map((item, index) => ({
    ...item,
    color: fallbackCategoryColors[index % fallbackCategoryColors.length],
  }))
}

export function ContentChart({ data = fallbackContentData }: { data?: ChartPoint[] }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Nội dung theo tháng</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D5D0C4" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#5C5C5C" }}
              axisLine={{ stroke: "#D5D0C4" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#5C5C5C" }}
              axisLine={{ stroke: "#D5D0C4" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5D0C4",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="value" fill="#C62828" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function CategoryChart({ data = fallbackCategoryData }: { data?: ChartPoint[] }) {
  const chartData = withCategoryColors(data)

  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Phân loại nội dung</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5D0C4",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value) => <span className="text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function AccessChart({ data = fallbackAccessData }: { data?: ChartPoint[] }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Lượt truy cập tuần này</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D5D0C4" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#5C5C5C" }}
              axisLine={{ stroke: "#D5D0C4" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#5C5C5C" }}
              axisLine={{ stroke: "#D5D0C4" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #D5D0C4",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#C9A227"
              strokeWidth={2}
              dot={{ fill: "#C9A227", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
