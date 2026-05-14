'use client';
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { blueSaturationScale } from "@/lib/chartConfig";

const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

export default function JitterPlot({ data, title = 'Toàn thành phố' }) {
  const svgRef = useRef(null);
  
  // Sử dụng Ref để lưu trữ giá trị jitter cố định theo ID căn hộ
  // Điều này đảm bảo mỗi căn hộ luôn nằm ở một vị trí X duy nhất trong suốt vòng đời của ứng dụng
  const persistentJitters = useRef(new Map());

  const jitteredData = useMemo(() => {
    if (!data) return [];
    return data
      .filter((d) => BOROUGHS.includes(d.borough))
      .map((d) => {
        // Nếu ID này chưa có giá trị jitter, tạo mới và lưu lại
        if (!persistentJitters.current.has(d.id)) {
          persistentJitters.current.set(d.id, Math.random() - 0.5);
        }
        return { 
          ...d, 
          _jitter: persistentJitters.current.get(d.id) 
        };
      });
  }, [data]);

  useEffect(() => {
    if (!jitteredData?.length || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const width  = container.clientWidth;
    const height = 420;
    const m = { top: 36, right: 20, bottom: 48, left: 44 };
    const w = width - m.left - m.right;
    const h = height - m.top - m.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);

    const x = d3.scaleBand().domain(BOROUGHS).range([0, w]).padding(0.05);
    const y = d3.scaleLinear().domain([1, 5]).range([h, 0]);

    // Lane stripes
    g.selectAll('.lane')
      .data(BOROUGHS)
      .join('rect')
      .attr('x', (d) => x(d))
      .attr('y', 0)
      .attr('width', x.bandwidth())
      .attr('height', h)
      .attr('fill', (_, i) => (i % 2 === 0 ? 'rgba(15,23,42,0.03)' : 'transparent'));

    // Lane labels
    g.selectAll('.lane-label')
      .data(BOROUGHS)
      .join('text')
      .attr('x', (d) => x(d) + x.bandwidth() / 2)
      .attr('y', -12)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-weight', '600')
      .attr('fill', '#94a3b8')
      .attr('letter-spacing', '0.05em')
      .text((d) => d.toUpperCase());

    // Axes
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickSize(0).tickFormat(''))
      .call((ax) => ax.select('.domain').attr('stroke', '#e2e8f0'));

    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(-w))
      .call((ax) => ax.select('.domain').remove())
      .call((ax) => ax.selectAll('line').attr('stroke', '#f1f5f9'))
      .call((ax) => ax.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10));

    // Dots
    const jw = x.bandwidth() * 0.65;
    const tooltip = d3.select('body').select('.jitter-tooltip');
    const tip = tooltip.empty()
      ? d3.select('body').append('div').attr('class', 'jitter-tooltip')
          .style('position', 'fixed').style('pointer-events', 'none')
          .style('background', 'white').style('border', '1px solid #e2e8f0')
          .style('border-radius', '8px').style('padding', '8px 12px')
          .style('font-size', '12px').style('color', '#0f172a')
          .style('box-shadow', '0 4px 12px rgba(0,0,0,0.08)').style('opacity', 0).style('z-index', 100)
      : tooltip;

    g.selectAll('.dot')
      .data(jitteredData)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.borough) + x.bandwidth() / 2 + d._jitter * jw)
      .attr('cy', (d) => y(d.rating))
      .attr('r', 3)
      .attr('fill', (d) => blueSaturationScale(d.rating))
      .attr('opacity', 0.4)
      .on('mouseover', function (e, d) {
        d3.select(this).attr('r', 7).attr('opacity', 1).attr('stroke', '#0f172a').attr('stroke-width', 1.5);
        tip.style('opacity', 1).html(
          `<strong>${d.borough}</strong><br/>Rating: <b>${d.rating?.toFixed(2)}</b><br/>Phòng: ${d.bedrooms}PN / ${d.bathrooms}PT`
        ).style('left', e.clientX + 14 + 'px').style('top', e.clientY - 8 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('r', 3).attr('opacity', 0.6).attr('stroke', 'none');
        tip.style('opacity', 0);
      });

    // Y label
    svg.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -(height / 2)).attr('y', 12)
      .attr('text-anchor', 'middle').attr('font-size', 10).attr('fill', '#94a3b8')
      .text('Review Score Rating');

    return () => {
      d3.select('.jitter-tooltip').remove();
    };
  }, [jitteredData]);

  return (
    <div className="w-full">
      <p className="text-xs text-slate-400 mb-2 font-medium tracking-tight">
        Phân bổ chi tiết: <span className="font-semibold text-slate-600">{title}</span>
      </p>
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}