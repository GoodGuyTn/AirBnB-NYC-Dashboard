'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ROOM_TYPE_COLORS, BOROUGHS } from '@/lib/chartConfig';

// Hàm tính KDE chuẩn cho D3
function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(x => [x, d3.mean(V, v => kernel(x - v)) || 0]);
  };
}

function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}

const ROOM_TYPES = ['Entire home/apt', 'Private room', 'Shared room', 'Hotel room'];

export default function GroupedViolinPlot({ data }) {
  const svgRef = useRef(null);
  const [maxDisplay, setMaxDisplay] = useState(60);
  const [hoveredViolin, setHoveredViolin] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, content: null, x: 0, y: 0 });

  // Tính toán dữ liệu gộp và mật độ (KDE)
  const chartData = useMemo(() => {
    if (!data?.length) return [];

    // Lọc các bản ghi hợp lệ theo cận hiển thị để tính density mượt hơn
    const filtered = data.filter(d => d.minimum_nights > 0 && d.minimum_nights <= maxDisplay);

    // Rollups theo borough và room_type
    const groups = d3.rollups(
      filtered,
      v => {
        const values = v.map(d => d.minimum_nights).sort(d3.ascending);
        const count = values.length;
        if (count === 0) return null;

        const q1 = d3.quantile(values, 0.25) || 0;
        const median = d3.quantile(values, 0.5) || 0;
        const q3 = d3.quantile(values, 0.75) || 0;
        const mean = d3.mean(values) || 0;

        // Tăng độ mượt (smoothness) bằng cách dùng y.ticks() và bandwidth linh hoạt giống mẫu của D3 Graph Gallery
        const bandwidth = maxDisplay <= 40 ? 3 : (maxDisplay <= 100 ? 6 : 12);
        // Sử dụng d3.ticks(0, maxDisplay, 50) để số điểm lấy mẫu luôn ổn định (50 điểm), giúp nét vẽ mượt hơn
        const kde = kernelDensityEstimator(kernelEpanechnikov(bandwidth), d3.ticks(0, maxDisplay, 50));
        const density = kde(values);

        return {
          values,
          count,
          q1,
          median,
          q3,
          mean,
          density,
          maxDensity: d3.max(density, d => d[1]) || 0
        };
      },
      d => d.borough,
      d => d.room_type
    );

    // Phẳng hóa mảng rollups
    const result = [];
    for (const [borough, rTypes] of groups) {
      if (BOROUGHS.includes(borough)) {
        for (const [room_type, stats] of rTypes) {
          if (stats && stats.count > 1) {
            result.push({
              key: `${borough}_${room_type}`,
              borough,
              room_type,
              ...stats
            });
          }
        }
      }
    }

    return result;
  }, [data, maxDisplay]);

  // Logic vẽ D3
  useEffect(() => {
    if (!chartData.length || !svgRef.current) return;

    const containerWidth = svgRef.current.parentElement.clientWidth || 800;
    const margin = { top: 40, right: 20, bottom: 65, left: 50 };
    const width = containerWidth;
    const height = 420;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Thang đo trục X chính (Boroughs)
    const x0 = d3.scaleBand()
      .domain(BOROUGHS)
      .range([0, chartWidth])
      .paddingInner(0.15)
      .paddingOuter(0.05);

    // Thang đo trục X phụ (Room types trong mỗi Borough)
    const x1 = d3.scaleBand()
      .domain(ROOM_TYPES)
      .range([0, x0.bandwidth()])
      .padding(0.1);

    // Thang đo trục Y (Nights)
    const y = d3.scaleLinear()
      .domain([0, maxDisplay])
      .range([chartHeight, 0])
      .nice();

    // Thang đo chiều rộng tối đa của mỗi nửa Violin (Dùng Sqrt để không bị bóp nghẹt bởi đỉnh quá cao)
    const globalMaxDensity = d3.max(chartData, d => d.maxDensity) || 1;
    const xNum = d3.scaleSqrt()
      .domain([0, globalMaxDensity])
      .range([0, x1.bandwidth() / 2]);

    // Lưới nền ngang (Grid lines) - Nét liền giống Tableau
    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(y.ticks(10))
      .join('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#e2e8f0') // Xám rõ hơn
      .attr('stroke-width', 1);

    // Các vạch phân chia dọc giữa các Borough (Vertical Dividers giống Tableau)
    x0.domain().forEach((borough, i) => {
      if (i > 0) {
        const xPos = x0(borough) - (x0.step() - x0.bandwidth()) / 2;
        g.append('line')
          .attr('x1', xPos)
          .attr('y1', 0)
          .attr('x2', xPos)
          .attr('y2', chartHeight)
          .attr('stroke', '#e2e8f0')
          .attr('stroke-width', 1);
      }
    });

    // Trục Y (Thước đo bên trái, tick lồi ra ngoài)
    const yAxis = g.append('g')
      .call(d3.axisLeft(y).ticks(10).tickSize(5).tickSizeOuter(0));
      
    yAxis.select('.domain').attr('stroke', '#cbd5e1'); // Đường kẻ viền trục
    yAxis.selectAll('.tick line').attr('stroke', '#cbd5e1'); // Tick lồi ra
    yAxis.selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('dx', '-2px');

    // Tiêu đề trục Y (Minimum Nights)
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -38)
      .attr('x', -(chartHeight / 2))
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#475569')
      .text('Số đêm tối thiểu');

    // Trục X chính (Nhãn Borough ở dưới, có tick lồi lên trên)
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x0).tickSize(5).tickSizeOuter(0).tickPadding(8));
      
    xAxis.select('.domain').attr('stroke', '#cbd5e1').attr('stroke-width', 1.5);
    xAxis.selectAll('.tick line').attr('stroke', '#cbd5e1'); // Tick lồi xuống
    xAxis.selectAll('text')
      .attr('fill', '#334155')
      .attr('font-size', '12px')
      .attr('font-weight', '700');

    // Tiêu đề trục X (Neighbourhood Group)
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', chartHeight + 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#475569')
      .text('Khu vực (Quận)');

    // Container cho từng Borough
    const boroughGroups = g.selectAll('.borough-group')
      .data(BOROUGHS)
      .join('g')
      .attr('class', 'borough-group')
      .attr('transform', d => `translate(${x0(d)},0)`);

    // Generator cho hình dạng Violin
    const area = d3.area()
      .x0(d => -xNum(d[1]))
      .x1(d => xNum(d[1]))
      .y(d => y(d[0]))
      .curve(d3.curveCatmullRom);

    // Lặp qua dữ liệu để vẽ vào đúng Borough
    chartData.forEach(d => {
      const bGroup = g.select(`.borough-group:nth-child(${BOROUGHS.indexOf(d.borough) + 3})`); // Offset g elements
      // Dùng cách chọn an toàn hơn bằng filter
    });

    // Vẽ Violin độc lập để dễ gán event
    const violins = g.selectAll('.violin-wrapper')
      .data(chartData)
      .join('g')
      .attr('class', 'violin-wrapper')
      .attr('transform', d => `translate(${x0(d.borough) + x1(d.room_type) + x1.bandwidth() / 2},0)`)
      .style('cursor', 'pointer')
      .style('transition', 'opacity 0.2s ease');

    // Diện tích Violin
    violins.append('path')
      .attr('d', d => area(d.density))
      .attr('fill', d => ROOM_TYPE_COLORS[d.room_type] || '#cbd5e1')
      .attr('fill-opacity', d => hoveredViolin ? (hoveredViolin === d.key ? 0.85 : 0.2) : 0.65)
      .attr('stroke', 'none');

    // Boxplot thu nhỏ bên trong (Đường dọc khoảng tứ phân vị IQR)
    violins.append('line')
      .attr('y1', d => y(d.q1))
      .attr('y2', d => y(d.q3))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('opacity', d => hoveredViolin && hoveredViolin !== d.key ? 0.2 : 1);

    // Chấm trắng thể hiện giá trị Trung vị (Median)
    violins.append('circle')
      .attr('cy', d => y(d.median))
      .attr('r', 3)
      .attr('fill', '#ffffff')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.5)
      .attr('opacity', d => hoveredViolin && hoveredViolin !== d.key ? 0.2 : 1);

    // Tương tác hover
    violins
      .on('mouseenter', (event, d) => {
        setHoveredViolin(d.key);
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip({
          visible: true,
          content: d,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
        });
      })
      .on('mousemove', (event, d) => {
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip(prev => ({
          ...prev,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
        }));
      })
      .on('mouseleave', () => {
        setHoveredViolin(null);
        setTooltip(prev => ({ ...prev, visible: false }));
      });

  }, [chartData, maxDisplay, hoveredViolin]);

  return (
    <div className="w-full relative flex flex-col select-none">
      {/* Thanh điều khiển cận trên */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2 px-1">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Phân bổ số đêm tối thiểu
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[40, 60, 100, 365].map(val => (
              <button
                key={val}
                onClick={() => setMaxDisplay(val)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  maxDisplay === val
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ≤ {val} đêm
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {ROOM_TYPES.map(type => (
            <div key={type} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: ROOM_TYPE_COLORS[type] }}
              />
              <span className="text-xs font-medium text-slate-600">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vùng chứa biểu đồ và Tooltip overlay */}
      <div className="relative w-full">
        <svg ref={svgRef} className="w-full block" />

        {/* Custom HTML Tooltip */}
        {tooltip.visible && tooltip.content && (
          <div
            className="absolute z-30 pointer-events-none bg-white text-slate-800 p-3 rounded-xl shadow-xl border border-slate-200 max-w-xs transition-all duration-75"
            style={{
              left: `${tooltip.x}px`,
              top: `${Math.max(tooltip.y - 15, 10)}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="text-[10px] font-black uppercase text-blue-600 tracking-wider mb-1 border-b border-slate-200 pb-1 flex justify-between gap-4">
              <span>{tooltip.content.borough}</span>
              <span className="text-slate-500">{tooltip.content.room_type}</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Trung vị (Median):</span>
                <span className="font-bold text-slate-800">{tooltip.content.median} đêm</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Trung bình:</span>
                <span className="font-bold text-slate-800">{tooltip.content.mean.toFixed(1)} đêm</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Vùng phân bố (IQR):</span>
                <span className="font-bold text-slate-600">
                  {tooltip.content.q1} - {tooltip.content.q3} đêm
                </span>
              </div>
              <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400">Mẫu thống kê:</span>
                <span className="font-bold text-slate-500">{tooltip.content.count} listings</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
