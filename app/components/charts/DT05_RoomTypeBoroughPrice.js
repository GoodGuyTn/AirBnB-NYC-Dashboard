'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function RoomTypeBoroughPriceChart({ data }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, borough: '', type: '', value: 0 });

  useEffect(() => {
    if (!data?.length || !svgRef.current) return;

    const boroughs = Array.from(
      new Set(data.map((d) => d.borough?.trim()).filter(Boolean))
    );
    const roomTypes = Array.from(
      new Set(data.map((d) => d.room_type?.trim()).filter(Boolean))
    );

    if (!boroughs.length || !roomTypes.length) return;

    const filtered = data.filter(
      (d) => boroughs.includes(d.borough) && roomTypes.includes(d.room_type)
    );

    const rollup = d3.rollups(
      filtered,
      (values) => d3.mean(values, (d) => d.price) || 0,
      (d) => d.borough,
      (d) => d.room_type
    );

    const groupedMap = new Map(
      rollup.map(([borough, entries]) => [borough, new Map(entries)])
    );

    const chartData = boroughs.map((borough) => {
      const rowMap = groupedMap.get(borough) || new Map();
      return {
        borough,
        ...roomTypes.reduce((acc, type) => {
          acc[type] = rowMap.has(type) ? rowMap.get(type) : 0;
          return acc;
        }, {}),
      };
    });

    const colorScale = d3.scaleOrdinal().domain(roomTypes).range(d3.schemeTableau10);

    const container = svgRef.current.parentElement;
    const width = Math.max(container.clientWidth, 580);
    const height = 420;
    const margin = { top: 60, right: 160, bottom: 50, left: 56 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x0 = d3.scaleBand()
      .domain(boroughs)
      .range([0, innerWidth])
      .padding(0.22);

    const x1 = d3.scaleBand()
      .domain(roomTypes)
      .range([0, x0.bandwidth()])
      .padding(0.18);

    const maxPrice = d3.max(chartData, (d) => d3.max(roomTypes, (type) => d[type])) || 0;
    const y = d3.scaleLinear()
      .domain([0, Math.ceil(maxPrice * 1.12 / 20) * 20])
      .range([innerHeight, 0]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .selectAll('g')
      .data(chartData)
      .join('g')
      .attr('transform', (d) => `translate(${x0(d.borough)},0)`)
      .selectAll('rect')
      .data((d) => roomTypes.map((type) => ({ type, borough: d.borough, value: d[type] })))
      .join('rect')
      .attr('class', 'price-bar')
      .attr('x', (d) => x1(d.type))
      .attr('y', (d) => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', (d) => innerHeight - y(d.value))
      .attr('fill', (d) => colorScale(d.type))
      .attr('rx', 4)
      .attr('opacity', 0.9)
      .style('cursor', 'pointer')
      .style('transition', 'opacity 150ms ease, filter 150ms ease')
      .on('mouseenter', function(event, d) {
        // Làm mờ các cột khác
        d3.selectAll('.price-bar')
          .filter(b => b.type !== d.type)
          .style('opacity', 0.3);
        d3.select(this)
          .style('opacity', 1)
          .style('filter', 'brightness(1.15)');

        const rect = containerRef.current.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - rect.left + 16,
          y: event.clientY - rect.top - 60,
          borough: d.borough,
          type: d.type,
          value: d.value,
        });
      })
      .on('mousemove', function(event) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip(prev => ({
          ...prev,
          x: event.clientX - rect.left + 16,
          y: event.clientY - rect.top - 60,
        }));
      })
      .on('mouseleave', function() {
        d3.selectAll('.price-bar').style('opacity', 0.9).style('filter', 'none');
        setTooltip(prev => ({ ...prev, visible: false }));
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0).tickSize(0))
      .call((ax) => ax.select('.domain').remove())
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#334155');

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 38)
      .attr('fill', '#475569')
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .text('Khu vực (Quận)');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `$${d}`))
      .call((ax) => ax.select('.domain').attr('stroke', '#cbd5e1'))
      .call((ax) => ax.selectAll('line').attr('stroke', '#e2e8f0'))
      .call((ax) => ax.selectAll('text').style('fill', '#64748b').style('font-size', '11px'));

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(innerHeight / 2))
      .attr('y', -42)
      .attr('fill', '#475569')
      .attr('font-size', '12px')
      .attr('text-anchor', 'middle')
      .text('Giá trung bình (USD)');

    g.append('text')
      .attr('x', 0)
      .attr('y', -28)
      .attr('fill', '#0f172a')
      .attr('font-size', '16px')
      .attr('font-weight', '700')
      .text('Average Price by Room Type and Borough');

    g.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .attr('fill', '#475569')
      .attr('font-size', '12px')
      .text('So sánh giá trung bình theo loại phòng và quận');

    // Legend xếp dọc bên phải SVG
    const legendX = margin.left + innerWidth + 20;
    const legendStartY = margin.top;
    roomTypes.forEach((type, index) => {
      const yPos = legendStartY + index * 22;
      svg.append('rect')
        .attr('x', legendX)
        .attr('y', yPos)
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('fill', colorScale(type));
      svg.append('text')
        .attr('x', legendX + 18)
        .attr('y', yPos + 10)
        .attr('fill', '#475569')
        .attr('font-size', '11px')
        .text(type);
    });

  }, [data]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full block" />

      {tooltip.visible && (
        <div
          className="absolute z-30 pointer-events-none bg-white text-slate-800 p-3 rounded-xl shadow-xl border border-slate-200 min-w-[160px] transition-all duration-75"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className="text-[10px] font-black uppercase text-blue-600 tracking-wider mb-1 border-b border-slate-200 pb-1">
            {tooltip.borough}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Loại phòng:</span>
              <span className="font-semibold text-slate-700">{tooltip.type}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Giá trung bình:</span>
              <span className="font-bold text-emerald-600">${tooltip.value.toFixed(0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
