type BarChartProps = {
  labels: string[]
  values: number[]
  color?: string
  height?: number
}

export function BarChart({
  labels,
  values,
  color = '#059669',
  height = 160,
}: BarChartProps) {
  const max = Math.max(...values, 1)
  const barWidth = 100 / Math.max(labels.length, 1)

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 100 ${height}`}
        className="min-w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Monthly spending chart"
      >
        {values.map((v, i) => {
          const h = (v / max) * (height - 24)
          const x = i * barWidth + barWidth * 0.15
          const w = barWidth * 0.7
          return (
            <rect
              key={labels[i]}
              x={x}
              y={height - h - 4}
              width={w}
              height={h}
              fill={color}
              rx={0.8}
              opacity={0.85}
            />
          )
        })}
      </svg>
      <div className="mt-2 flex gap-1 overflow-x-auto text-[10px] text-slate-500">
        {labels.map((l) => (
          <span key={l} className="min-w-[3rem] shrink-0 text-center">
            {l.replace(/^\w+\s/, '').slice(0, 3)}
          </span>
        ))}
      </div>
    </div>
  )
}
