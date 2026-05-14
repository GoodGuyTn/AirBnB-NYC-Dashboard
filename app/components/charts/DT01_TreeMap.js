'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { blueSaturationScale, COLOR_MIN, COLOR_MAX, blueInterpolator } from "@/lib/chartConfig";

export default function TreemapChart({ data, onCellClick }) {
  const svgRef = useRef(null);
  const legendRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = 480;

    // 1. LOGIC GOM NHÓM 4+ (Khắc phục tình trạng ô quá nhỏ)
    const formatValue = (val) => (val >= 4 ? '4+' : val);

    const nested = d3.rollups(
  data,
  (v) => ({
    count: v.length,
    avgRating: d3.mean(v, (d) => d.rating) || 0,
    rows: v,
  }),
  (d) => d.bedrooms_grouped + ' PN', 
  (d) => d.bathrooms_grouped + ' PT'  
);

    const treeData = {
      name: 'root',
      children: nested.map(([bed, baths]) => ({
        name: bed,
        children: baths.map(([bath, stats]) => ({
          name: bath,
          value: stats.count,
          avgRating: stats.avgRating,
          rawData: stats.rows,
        })),
      })),
    };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const root = d3.hierarchy(treeData)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    d3.treemap().size([width, height]).paddingInner(1).paddingOuter(2)(root);

    const leaf = svg.selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer')
      .on('click', (e, d) => {
        svg.selectAll('rect.cell').attr('stroke', 'none');
        d3.select(e.currentTarget).select('rect.cell').attr('stroke', '#000').attr('stroke-width', 2);
        onCellClick?.(`${d.parent.data.name} - ${d.data.name}`, d.data.rawData);
      });

    leaf.append('rect')
      .attr('class', 'cell')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('fill', (d) => blueSaturationScale(d.data.avgRating))
      .attr('rx', 0); // BỎ BORDER RADIUS ĐỂ GIỮ HÌNH VUÔNG

    // 2. LOGIC NHÃN THÔNG MINH (Bỏ chữ Nhóm, Tự động xuống hàng)
    leaf.each(function(d) {
      const g = d3.select(this);
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;

      // Chỉ hiện nhãn nếu ô đủ rộng (Slide 87 - Discriminability)
      if (w > 80 && h > 40) {
        const text = g.append('text').attr('x', 6).attr('y', 18).attr('font-size', '10px').attr('font-weight', '700');
        
        // Dòng 1: Cấu hình PN/PT
        text.append('tspan')
            .attr('fill', d.data.avgRating > 4.5 ? 'white' : '#1e293b')
            .text(`${d.parent.data.name} / ${d.data.name}`);

        // Dòng 2: Rating (Chỉ hiện nếu ô đủ cao để không bị lệch)
        if (h > 55) {
          text.append('tspan')
              .attr('x', 6)
              .attr('dy', '1.4em')
              .attr('fill', d.data.avgRating > 4.5 ? 'rgba(255,255,255,0.8)' : '#64748b')
              .attr('font-weight', '500')
              .text(`Rating: ${d.data.avgRating.toFixed(2)}`);
        }
      }
    });

    leaf.append('title').text((d) => `${d.parent.data.name} | ${d.data.name}\nRating: ${d.data.avgRating.toFixed(2)}\nSố lượng: ${d.data.value}`);

    // Legend
    if (legendRef.current) {
      const lg = d3.select(legendRef.current); lg.selectAll('*').remove();
      const lw = 200, lh = 10;
      const lsvg = lg.append('svg').attr('width', lw + 20).attr('height', 35);
      const defs = lsvg.append('defs');
      const grad = defs.append('linearGradient').attr('id', 'blue-grad');
      [0, 1].forEach((t) => grad.append('stop').attr('offset', `${t * 100}%`).attr('stop-color', blueInterpolator(t)));
      lsvg.append('rect').attr('width', lw).attr('height', lh).attr('fill', 'url(#blue-grad)');
      lsvg.append('text').attr('x', 0).attr('y', 25).attr('font-size', '9px').attr('fill', '#64748b').text(COLOR_MIN);
      lsvg.append('text').attr('x', lw).attr('y', 25).attr('font-size', '9px').attr('fill', '#64748b').attr('text-anchor', 'end').text(COLOR_MAX);
    }
  }, [data, onCellClick]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
          <span className="text-blue-500">PN</span>: Phòng Ngủ | <span className="text-blue-500">PT</span>: Phòng Tắm
        </div>
        <div ref={legendRef} />
      </div>
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}