'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { blueSaturationScale, COLOR_MIN, COLOR_MAX, blueInterpolator } from "@/lib/chartConfig";

export default function TreemapChart({ data, onCellClick }) {
  const svgRef = useRef(null);
  const legendRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !svgRef.current) return;

    const width = svgRef.current.parentElement.clientWidth;
    const height = 480;

    // LOGIC GOM NHÓM 4+ (Slide 108: Aggregation)
    const nested = d3.rollups(
      data,
      (v) => ({ count: v.length, avgRating: d3.mean(v, d => d.rating) || 0, rows: v }),
      (d) => (d.bedrooms >= 4 ? '4+' : d.bedrooms) + ' PN',
      (d) => (d.bathrooms >= 4 ? '4+' : d.bathrooms) + ' PT'
    );

    const treeData = {
      name: 'root',
      children: nested.map(([bed, baths]) => ({
        name: bed,
        children: baths.map(([bath, stats]) => ({
          name: bath, value: stats.count, avgRating: stats.avgRating, rawData: stats.rows,
        })),
      })),
    };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const root = d3.hierarchy(treeData).sum(d => d.value).sort((a, b) => b.value - a.value);
    d3.treemap().size([width, height]).paddingInner(1).paddingOuter(2)(root);

    const leaf = svg.selectAll('g').data(root.leaves()).join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)
      .on('click', (e, d) => {
        svg.selectAll('rect.cell').attr('stroke', 'none');
        d3.select(e.currentTarget).select('rect.cell').attr('stroke', '#000').attr('stroke-width', 2);
        onCellClick?.(`${d.data.name} - ${d.parent.data.name}`, d.data.rawData);
      });

    leaf.append('rect')
      .attr('class', 'cell')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => blueSaturationScale(d.data.avgRating));

    // LOGIC HIỂN THỊ CHỮ ĐA DÒNG (Slide 78: Accuracy)
    leaf.each(function(d) {
      const g = d3.select(this);
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;

      if (w > 65 && h > 35) {
        const text = g.append('text').attr('x', 5).attr('y', 15).attr('font-size', '10px').attr('font-weight', '700');
        
        // Dòng 1: Cấu hình
        text.append('tspan').attr('fill', d.data.avgRating > 4.5 ? 'white' : '#1e293b')
            .text(`${d.data.name} | ${d.parent.data.name}`);

        // Dòng 2: Điểm số (nếu đủ chiều cao)
        if (h > 45) {
          text.append('tspan').attr('x', 5).attr('dy', '1.4em')
              .attr('fill', d.data.avgRating > 4.5 ? 'rgba(255,255,255,0.8)' : '#64748b')
              .attr('font-weight', '400')
              .text(`Rating: ${d.data.avgRating.toFixed(2)}`);
        }
      }
    });

    leaf.append('title').text(d => `${d.data.name} | ${d.parent.data.name}\nRating: ${d.data.avgRating.toFixed(2)}\nCăn hộ: ${d.data.value}`);

    if (legendRef.current) {
      const lg = d3.select(legendRef.current); lg.selectAll('*').remove();
      const lw = 180, lh = 8;
      const lsvg = lg.append('svg').attr('width', lw + 10).attr('height', 30);
      const defs = lsvg.append('defs');
      const grad = defs.append('linearGradient').attr('id', 'blue-grad');
      [0, 1].forEach(t => grad.append('stop').attr('offset', `${t * 100}%`).attr('stop-color', blueInterpolator(t)));
      lsvg.append('rect').attr('width', lw).attr('height', lh).attr('fill', 'url(#blue-grad)');
      lsvg.append('text').attr('x', 0).attr('y', 22).attr('font-size', '9px').text(COLOR_MIN);
      lsvg.append('text').attr('x', lw).attr('y', 22).attr('font-size', '9px').attr('text-anchor', 'end').text(COLOR_MAX);
    }
  }, [data, onCellClick]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
          <span className="text-blue-500">PN</span>: Phòng Ngủ | <span className="text-blue-500">PT</span>: Phòng Tắm
        </div>
        <div ref={legendRef} />
      </div>
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}