'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { BOROUGHS } from '@/lib/chartConfig';

const ROOM_TYPES = ['Entire home/apt', 'Private room', 'Shared room', 'Hotel room'];

export default function BubbleMatrix({ data }) {
  const svgRef = useRef(null);
  const [hoveredBubble, setHoveredBubble] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, content: null, x: 0, y: 0 });

  // Tính toán ma trận gộp (Borough x Room Type)
  const matrixData = useMemo(() => {
    if (!data?.length) return [];

    // Lọc theo danh sách Borough chuẩn
    const filtered = data.filter(d => BOROUGHS.includes(d.borough));

    const rollups = d3.rollups(
      filtered,
      v => ({
        count: v.length,
        avgPrice: d3.mean(v, d => d.price) || 0,
        minPrice: d3.min(v, d => d.price) || 0,
        maxPrice: d3.max(v, d => d.price) || 0,
      }),
      d => d.borough,
      d => d.room_type
    );

    const result = [];
    for (const [borough, rTypes] of rollups) {
      for (const [room_type, stats] of rTypes) {
        if (stats.count > 0) {
          result.push({
            key: `${borough}_${room_type}`,
            borough,
            room_type,
            ...stats
          });
        }
      }
    }

    return result;
  }, [data]);

  // Logic vẽ D3
  useEffect(() => {
    if (!matrixData.length || !svgRef.current) return;

    const containerWidth = svgRef.current.parentElement.clientWidth || 800;
    const margin = { top: 60, right: 40, bottom: 80, left: 110 };
    const width = containerWidth;
    const height = 380;
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

    // Thang đo vị trí X (Borough)
    const x = d3.scaleBand()
      .domain(BOROUGHS)
      .range([0, chartWidth])
      .padding(0.1);

    // Thang đo vị trí Y (Room Type)
    const y = d3.scaleBand()
      .domain(ROOM_TYPES)
      .range([0, chartHeight])
      .padding(0.1);

    // Thang đo Kích thước (Size: Count) -> Sqrt scale để diện tích bong bóng tỷ lệ chuẩn với count
    const maxCount = d3.max(matrixData, d => d.count) || 1;
    const size = d3.scaleSqrt()
      .domain([0, maxCount])
      .range([4, Math.min(x.bandwidth(), y.bandwidth()) / 2.2]); // Giới hạn bán kính không bị chạm mép ô

    // Thang đo Nồng độ màu (Color saturation: Avg Price)
    const prices = matrixData.map(d => d.avgPrice);
    const minP = Math.max(d3.min(prices) || 50, 50);
    const maxP = Math.min(d3.max(prices) || 350, 350); // Cap ở $350 để dải màu phân biệt tốt cho phần lớn dữ liệu

    const color = d3.scaleSequential()
      .domain([minP, maxP])
      .interpolator(d3.interpolateYlOrRd);

    // Grid kẻ ô mờ làm nền cho ma trận
    const xCenters = BOROUGHS.map(b => x(b) + x.bandwidth() / 2);
    const yCenters = ROOM_TYPES.map(r => y(r) + y.bandwidth() / 2);

    // Đường kẻ dọc
    g.append('g')
      .selectAll('line')
      .data(xCenters)
      .join('line')
      .attr('x1', d => d)
      .attr('x2', d => d)
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1);

    // Đường kẻ ngang
    g.append('g')
      .selectAll('line')
      .data(yCenters)
      .join('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => d)
      .attr('y2', d => d)
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1);

    // Trục Y (Room Types)
    const yAxis = g.append('g')
      .call(d3.axisLeft(y).tickSize(5).tickSizeOuter(0).tickPadding(8));
      
    yAxis.select('.domain').attr('stroke', '#cbd5e1').attr('stroke-width', 1.5);
    yAxis.selectAll('.tick line').attr('stroke', '#cbd5e1');
    yAxis.selectAll('text')
      .attr('fill', '#334155')
      .attr('font-size', '12px')
      .attr('font-weight', '600');

    // Tiêu đề trục Y
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -95)
      .attr('x', -(chartHeight / 2))
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#475569')
      .text('Loại phòng');

    // Trục X (Boroughs) đặt ở trên đỉnh ma trận cho trực quan
    const xAxis = g.append('g')
      .attr('transform', 'translate(0,0)')
      .call(d3.axisTop(x).tickSize(5).tickSizeOuter(0).tickPadding(8));

    xAxis.select('.domain').attr('stroke', '#cbd5e1').attr('stroke-width', 1.5);
    xAxis.selectAll('.tick line').attr('stroke', '#cbd5e1');
    xAxis.selectAll('text')
      .attr('fill', '#0f172a')
      .attr('font-size', '13px')
      .attr('font-weight', '700');

    // Tiêu đề trục X
    g.append('text')
      .attr('x', chartWidth / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#475569')
      .text('Khu vực (Quận)');

    // Nhóm chứa bong bóng
    const bubbles = g.selectAll('.bubble-node')
      .data(matrixData)
      .join('g')
      .attr('class', 'bubble-node')
      .attr('transform', d => `translate(${x(d.borough) + x.bandwidth() / 2},${y(d.room_type) + y.bandwidth() / 2})`)
      .style('cursor', 'pointer');

    // Vòng tròn bong bóng
    bubbles.append('circle')
      .attr('r', d => size(d.count))
      .attr('fill', d => color(d.avgPrice))
      .attr('fill-opacity', d => hoveredBubble ? (hoveredBubble === d.key ? 1 : 0.25) : 0.85)
      .attr('stroke', d => d3.color(color(d.avgPrice)).darker(0.6))
      .attr('stroke-width', d => hoveredBubble === d.key ? 2.5 : 1.5)
      .style('transition', 'all 0.2s ease');

    // Ghi nhãn trực tiếp (Chỉ ghi cho bong bóng có bán kính đủ lớn > 12px)
    bubbles.each(function(d) {
      const r = size(d.count);
      if (r > 14) {
        const isDarkColor = d.avgPrice > (minP + maxP) / 1.8;
        d3.select(this).append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.3em')
          .attr('fill', isDarkColor ? '#ffffff' : '#0f172a')
          .attr('font-size', r > 22 ? '11px' : '9px')
          .attr('font-weight', '700')
          .style('pointer-events', 'none')
          .text(d.count > 999 ? `${(d.count / 1000).toFixed(1)}k` : d.count);
      }
    });

    // Vẽ Legends chuyên nghiệp (Size + Color) ở lề dưới
    const legendG = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${height - 50})`);

    // 1. Size Legend (Số lượng)
    const sizeLegend = legendG.append('g').attr('transform', 'translate(0, 0)');
    sizeLegend.append('text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', '#64748b')
      .text('Size: Listings');

    // Dùng mốc fixed nhỏ hơn để vòng tròn không bị quá khổ và cắt lề
    const sampleSizes = [100, 1000, 3000];
    let currentX = 85;
    sampleSizes.forEach((val) => {
      const r = size(val);
      sizeLegend.append('circle')
        .attr('cx', currentX + r)
        .attr('cy', 0)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.2);

      sizeLegend.append('text')
        .attr('x', currentX + r)
        .attr('y', r + 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .attr('fill', '#64748b')
        .text(val >= 1000 ? `${(val/1000).toFixed(0)}k` : val);

      currentX += r * 2 + 16;
    });

    // 2. Color Legend (Nồng độ giá)
    // Tự động đẩy lùi sang phải so với Size Legend để tránh ghi đè
    const colorLegend = legendG.append('g').attr('transform', `translate(${currentX + 30}, -10)`);
    colorLegend.append('text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', '#64748b')
      .text('Color: Avg Price');

    // Dải Gradient
    const defs = svg.append('defs');
    const gradId = 'price-gradient-matrix';
    const linearGrad = defs.append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');

    d3.range(0, 1.05, 0.2).forEach(t => {
      linearGrad.append('stop')
        .attr('offset', `${t * 100}%`)
        .attr('stop-color', color(minP + t * (maxP - minP)));
    });

    const barW = 85;
    colorLegend.append('rect')
      .attr('x', 0)
      .attr('y', 10)
      .attr('width', barW)
      .attr('height', 8)
      .attr('rx', 4)
      .attr('fill', `url(#${gradId})`);

    colorLegend.append('text')
      .attr('x', 0)
      .attr('y', 28)
      .attr('font-size', '8px')
      .attr('fill', '#64748b')
      .text(`$${minP.toFixed(0)}`);

    colorLegend.append('text')
      .attr('x', barW)
      .attr('y', 28)
      .attr('text-anchor', 'end')
      .attr('font-size', '8px')
      .attr('fill', '#64748b')
      .text(`$${maxP.toFixed(0)}+`);

    // Gán event Hover cho bong bóng
    bubbles
      .on('mouseenter', (event, d) => {
        setHoveredBubble(d.key);
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
        setHoveredBubble(null);
        setTooltip(prev => ({ ...prev, visible: false }));
      });

  }, [matrixData, hoveredBubble]);

  return (
    <div className="w-full relative flex flex-col select-none">
      {/* Container SVG kèm Tooltip Overlay */}
      <div className="relative w-full">
        <svg ref={svgRef} className="w-full block" />

        {/* Custom HTML Tooltip */}
        {tooltip.visible && tooltip.content && (
          <div
            className="absolute z-30 pointer-events-none bg-white text-slate-800 p-3 rounded-xl shadow-xl border border-slate-200 max-w-xs transition-all duration-75"
            style={{
              left: `${Math.min(tooltip.x, (svgRef.current?.parentElement?.clientWidth || 600) - 160)}px`,
              top: `${Math.max(tooltip.y - 15, 10)}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="text-[10px] font-black uppercase text-amber-500 tracking-wider mb-1 border-b border-slate-200 pb-1 flex justify-between gap-4">
              <span>{tooltip.content.borough}</span>
              <span className="text-slate-500">{tooltip.content.room_type}</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Số lượng (Size):</span>
                <span className="font-bold text-slate-800">{tooltip.content.count} listings</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Giá trung bình (Color):</span>
                <span className="font-bold text-amber-500">${tooltip.content.avgPrice.toFixed(1)}</span>
              </div>
              <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400">Khoảng giá:</span>
                <span className="font-medium text-slate-600">
                  ${tooltip.content.minPrice} - ${tooltip.content.maxPrice}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
