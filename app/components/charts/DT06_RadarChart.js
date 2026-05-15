'use client';
import { useMemo } from 'react';
import * as d3 from 'd3';
import { SCORE_FIELDS, SCORE_LABELS } from '@/lib/chartConfig';

const BOROUGHS = ['Manhattan', 'Staten Island'];
const COLORS = {
  Manhattan: '#0ea5e9',
  'Staten Island': '#f43f5e',
};

export default function RadarChart({ data }) {
  const radarData = useMemo(() => {
    if (!data || !data.length) return null;

    const numAxes = SCORE_FIELDS.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    const boroughAverages = {};
    BOROUGHS.forEach((borough) => {
      const boroughData = data.filter((d) => d.borough === borough);

      boroughAverages[borough] = SCORE_FIELDS.map((field) => {
        const values = boroughData
          .map((d) => d[field])
          .filter((v) => v !== null && typeof v === 'number' && !Number.isNaN(v) && v > 0);

        const avg = values.length ? d3.mean(values) : 0;

        console.log(`${borough} - ${field}: ${values.length} records, avg = ${avg.toFixed(4)}`);

        return avg;
      });
    });

    const radius = 150; // bán kính của biểu đồ
    const maxValue = 5; // giá trị tối đa

    // Tạo axes với thông tin vị trí
    const axes = SCORE_FIELDS.map((field, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const labelDistance = radius + 35;
      const labelX = Math.cos(angle) * labelDistance;
      const labelY = Math.sin(angle) * labelDistance;

      return {
        field,
        label: SCORE_LABELS[field],
        angle,
        x,
        y,
        labelX,
        labelY,
      };
    });

    return {
      boroughAverages,
      axes,
      radius,
      maxValue,
      angleSlice,
    };
  }, [data]);

  // In tóm tắt kết quả ra console
  if (radarData) {
    console.log('\n======== RADAR CHART SUMMARY ========');
    BOROUGHS.forEach((borough) => {
      console.log(`\n${borough}:`);
      radarData.boroughAverages[borough].forEach((value, idx) => {
        const label = SCORE_LABELS[SCORE_FIELDS[idx]];
        console.log(`  ${label}: ${value.toFixed(4)}`);
      });
    });
    console.log('\n=====================================\n');
  }

  if (!radarData) {
    return <div className="text-slate-400 text-sm">Không có dữ liệu</div>;
  }

  const { boroughAverages, axes, radius, maxValue, angleSlice } = radarData;

  // Tính điểm trên radar dựa trên giá trị
  const getPointCoordinates = (value, angle) => {
    const normalizedRadius = (value / maxValue) * radius;
    return {
      x: Math.cos(angle) * normalizedRadius,
      y: Math.sin(angle) * normalizedRadius,
    };
  };

  // Tạo path cho polygon radar
  const createRadarPath = (values) => {
    const points = values.map((value, i) => {
      const point = getPointCoordinates(value, axes[i].angle);
      return `${point.x},${point.y}`;
    });
    return `M${points.join('L')}Z`;
  };

  const svgSize = 500;
  const center = svgSize / 2;

  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-xs uppercase text-slate-400 tracking-[0.25em]">Radar Comparison</p>
        <h3 className="text-lg font-semibold text-slate-700">So sánh điểm đánh giá trung bình</h3>
        <p className="text-sm text-slate-500 mt-1">Manhattan vs Staten Island - các chỉ số đánh giá của khách.</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <svg width="100%" height="auto" viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full">
          <g transform={`translate(${center},${center})`}>
            {/* Vẽ 5 vòng cung từ 1 đến 5 */}
            {[1, 2, 3, 4, 5].map((level) => (
              <g key={`level-${level}`}>
                <circle
                  cx={0}
                  cy={0}
                  r={(radius * level) / maxValue}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                  opacity="0.6"
                />
                <text
                  x={(radius * level) / maxValue}
                  y={-4}
                  fontSize="11"
                  fill="#94a3b8"
                  fontWeight="500"
                >
                  {level}
                </text>
              </g>
            ))}

            {/* Vẽ 7 trục từ tâm ra ngoài */}
            {axes.map((axis) => (
              <line
                key={`axis-${axis.field}`}
                x1={0}
                y1={0}
                x2={axis.x}
                y2={axis.y}
                stroke="#d1d5db"
                strokeWidth={1}
                opacity="0.5"
              />
            ))}

            {/* Vẽ 2 polygon cho 2 borough */}
            {BOROUGHS.map((borough) => (
              <g key={borough}>
                {/* Fill */}
                <path
                  d={createRadarPath(boroughAverages[borough])}
                  fill={borough === 'Manhattan' ? 'rgba(14,165,233,0.15)' : 'rgba(244,63,94,0.15)'}
                  stroke="none"
                />
                {/* Stroke */}
                <path
                  d={createRadarPath(boroughAverages[borough])}
                  fill="none"
                  stroke={COLORS[borough]}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Điểm trên mỗi trục */}
                {boroughAverages[borough].map((value, i) => {
                  const point = getPointCoordinates(value, axes[i].angle);
                  return (
                    <circle
                      key={`${borough}-point-${i}`}
                      cx={point.x}
                      cy={point.y}
                      r={4}
                      fill={COLORS[borough]}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  );
                })}
              </g>
            ))}

            {/* Nhãn cho các trục */}
            {axes.map((axis) => {
              const textAnchor =
                Math.abs(axis.labelX) < 5 ? 'middle' : axis.labelX > 0 ? 'start' : 'end';
              const dominantBaseline =
                Math.abs(axis.labelY) < 5 ? 'middle' : axis.labelY > 0 ? 'hanging' : 'baseline';

              return (
                <text
                  key={`label-${axis.field}`}
                  x={axis.labelX}
                  y={axis.labelY}
                  textAnchor={textAnchor}
                  dominantBaseline={dominantBaseline}
                  fontSize="12"
                  fontWeight="500"
                  fill="#374151"
                >
                  {axis.label}
                </text>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-6">
        {BOROUGHS.map((borough) => (
          <div key={borough} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[borough] }}
            />
            <span className="text-sm font-medium text-slate-700">{borough}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
