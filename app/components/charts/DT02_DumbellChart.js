'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { SUPERHOST_COLOR, NONSUPERHOST_COLOR } from '@/lib/chartConfig';

// Danh sách lựa chọn mới
const NAV_OPTIONS = ['Tổng quan', 'Tất cả', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

export default function DumbbellChart({ data }) {
  const [selectedBorough, setSelectedBorough] = useState('Tổng quan');
  const [sortBy, setSortBy] = useState('price');

  const sortedRollup = useMemo(() => {
    // 1. Logic lọc và xác định hàm gom nhóm (Group Function)
    let filtered = data;
    let groupFn;

    if (selectedBorough === 'Tổng quan') {
      // Nhóm theo Quận (chỉ hiện 5 dòng)
      groupFn = (d) => d.borough;
    } else if (selectedBorough === 'Tất cả') {
      // Hiện toàn bộ các khu phố trên toàn thành phố (Danh sách rất dài)
      groupFn = (d) => d.neighbourhood;
    } else {
      // Lọc theo một quận cụ thể và hiện các khu phố trong đó
      filtered = data.filter(d => d.borough === selectedBorough);
      groupFn = (d) => d.neighbourhood;
    }

    // 2. Thực hiện Rollup dữ liệu
    let rollup = d3.rollups(filtered, (v) => {
      const sup = v.filter(d => d.superhost);
      const non = v.filter(d => !d.superhost);
      const supP = d3.mean(sup, d => d.price) || 0;
      const nonP = d3.mean(non, d => d.price) || 0;
      const supR = d3.mean(sup, d => d.rating) || 0;
      const nonR = d3.mean(non, d => d.rating) || 0;
      return {
        supP, nonP, gapP: supP - nonP,
        supR, nonR, gapR: supR - nonR,
        count: v.length
      };
    }, groupFn)
      .map(([name, v]) => ({ name, ...v }))
      .filter(d => d.supP > 0 && d.nonP > 0);

    // 3. Logic Sắp xếp đồng bộ
    return rollup.sort((a, b) => {
      if (sortBy === 'price') return b.gapP - a.gapP;
      return b.gapR - a.gapR;
    });
  }, [data, selectedBorough, sortBy]);

  return (
    <div className="w-full space-y-6 overflow-x-hidden text-white">
      {/* Menu điều khiển */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">

        {/* Hàng 1: Khu vực + Sắp xếp */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest shrink-0">Khu vực</span>
            <div className="flex flex-wrap gap-1">
              {NAV_OPTIONS.map((b) => (
                <button key={b} onClick={() => setSelectedBorough(b)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${selectedBorough === b ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >{b}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Sắp xếp</span>
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
              <button onClick={() => setSortBy('price')}
                className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${sortBy === 'price' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >Giá chênh lệch</button>
              <button onClick={() => setSortBy('rating')}
                className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${sortBy === 'rating' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >Rating chênh lệch</button>
            </div>
          </div>
        </div>

        {/* Hàng 2: Legend chú thích */}
        <div className="flex items-center gap-4 flex-wrap pt-0.5">

          {/* Regular Host dot */}
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" className="shrink-0">
              <circle cx="6" cy="6" r="5" fill={NONSUPERHOST_COLOR} stroke="white" strokeWidth="1.5" />
            </svg>
            <span className="text-[10px] text-slate-500 font-semibold">Regular Host</span>
          </div>

          {/* Superhost dot */}
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" className="shrink-0">
              <circle cx="6" cy="6" r="5" fill={SUPERHOST_COLOR} stroke="white" strokeWidth="1.5" />
            </svg>
            <span className="text-[10px] text-slate-500 font-semibold">Superhost</span>
          </div>

          {/* Divider */}
          <div className="w-px h-3 bg-slate-200 shrink-0" />

          {/* Gap label */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-semibold">Mức chênh lệch</span>
          </div>

        </div>
      </div>

      {/* Biểu đồ */}
      <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-sky-600 mb-4 uppercase tracking-tighter">● So sánh Giá (USD)</p>
            <DumbbellSVG
              data={sortedRollup}
              xValue1={d => d.nonP} xValue2={d => d.supP}
              xFormat={d => `$${d.toFixed(0)}`}
            />
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-rose-500 mb-4 uppercase tracking-tighter">● So sánh Rating</p>
            <DumbbellSVG
              data={sortedRollup}
              xValue1={d => d.nonR} xValue2={d => d.supR}
              xFormat={d => d.toFixed(2)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DumbbellSVG({ data, xValue1, xValue2, xFormat }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const containerWidth = svgRef.current.parentElement.clientWidth;
    const margin = { top: 10, right: 70, bottom: 25, left: 160 };
    const width = containerWidth;
    const chartWidth = width - margin.left - margin.right;
    const rowHeight = 32;
    const height = data.length * rowHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height + margin.top + margin.bottom);

    svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const allVals = data.flatMap(d => [xValue1(d), xValue2(d)]);
    const x = d3.scaleLinear()
      .domain([d3.min(allVals) * 0.98, d3.max(allVals) * 1.02])
      .range([0, chartWidth]);

    const y = d3.scaleBand().domain(data.map(d => d.name)).range([0, height]).padding(0.6);

    // Trục Y
    g.append("g").call(d3.axisLeft(y).tickSize(0).tickPadding(10))
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .style("fill", "#94a3b8")
      .style("font-size", "10px")
      .each(function (d) {
        const text = d3.select(this);
        if (d.length > 22) text.text(d.slice(0, 20) + "...");
      });

    const rows = g.selectAll(".row").data(data).enter().append("g");

    // Grid mờ
    g.append('g').attr('class', 'grid')
      .call(d3.axisBottom(x).ticks(4).tickSize(height).tickFormat(''))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '3,3'));

    // Dẫn hướng ngang
    rows.append("line")
      .attr("x1", -margin.left).attr("x2", chartWidth + margin.right)
      .attr("y1", d => y(d.name) + y.bandwidth() / 2).attr("y2", d => y(d.name) + y.bandwidth() / 2)
      .attr("stroke", "rgba(0,0,0,0.03)").attr("stroke-width", 1);

    // Thanh nối
    rows.append("line")
      .attr("x1", d => x(xValue1(d))).attr("x2", d => x(xValue2(d)))
      .attr("y1", d => y(d.name) + y.bandwidth() / 2).attr("y2", d => y(d.name) + y.bandwidth() / 2)
      .attr("stroke", "#cbd5e1").attr("stroke-width", 4).attr("stroke-linecap", "round");

    // Tooltip setup
    const tip = d3.select('body').select('.db-tip').empty()
      ? d3.select('body').append('div').attr('class', 'db-tip')
        .style('position', 'fixed').style('pointer-events', 'none')
        .style('background', 'white').style('border', '1px solid #e2e8f0')
        .style('border-radius', '8px').style('padding', '8px 12px')
        .style('font-size', '12px').style('color', '#0f172a')
        .style('box-shadow', '0 4px 12px rgba(0,0,0,0.1)')
        .style('opacity', 0).style('z-index', 50)
      : d3.select('body').select('.db-tip');

    // Chấm Regular Host
    rows.append("circle")
      .attr("cx", d => x(xValue1(d))).attr("cy", d => y(d.name) + y.bandwidth() / 2)
      .attr("r", 5).attr("fill", NONSUPERHOST_COLOR).attr("stroke", "#000")
      .attr("stroke-opacity", 0.5).attr("stroke-width", 1).attr("fill-opacity", 0.6)
      .on('mouseover', function (e, d) {
        d3.select(this).raise().attr("fill-opacity", 1).attr("r", 8);
        tip.style('opacity', 1).html(`<b>${d.name}</b><br><span style="color:#f43f5e">Regular:</span> ${xFormat(xValue1(d))}`)
          .style('left', e.clientX + 14 + 'px').style('top', e.clientY - 8 + 'px');
      })
      .on('mousemove', e => tip.style('left', e.clientX + 14 + 'px').style('top', e.clientY - 8 + 'px'))
      .on('mouseout', function () { d3.select(this).attr("fill-opacity", 0.6).attr("r", 5); tip.style('opacity', 0); });

    // Chấm Superhost
    rows.append("circle")
      .attr("cx", d => x(xValue2(d))).attr("cy", d => y(d.name) + y.bandwidth() / 2)
      .attr("r", 5).attr("fill", SUPERHOST_COLOR).attr("stroke", "#000")
      .attr("stroke-opacity", 0.5).attr("stroke-width", 1).attr("fill-opacity", 0.6)
      .on('mouseover', function (e, d) {
        d3.select(this).raise().attr("fill-opacity", 1).attr("r", 8);
        tip.style('opacity', 1).html(`<b>${d.name}</b><br><span style="color:#0ea5e9">Superhost:</span> ${xFormat(xValue2(d))}`)
          .style('left', e.clientX + 14 + 'px').style('top', e.clientY - 8 + 'px');
      })
      .on('mousemove', e => tip.style('left', e.clientX + 14 + 'px').style('top', e.clientY - 8 + 'px'))
      .on('mouseout', function () { d3.select(this).attr("fill-opacity", 0.6).attr("r", 5); tip.style('opacity', 0); });

    // Nhãn Gap
    rows.append("text")
      .attr("x", d => Math.min(x(Math.max(xValue1(d), xValue2(d))) + 8, chartWidth + 5))
      .attr("y", d => y(d.name) + y.bandwidth() / 2 + 4)
      .style("fill", "#64748b").style("font-size", "9px").style("font-weight", "800")
      .text(d => xFormat(Math.abs(xValue2(d) - xValue1(d))));

    // Trục X (Bottom)
    g.append("g").attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(4).tickFormat(xFormat))
      .call(g => g.select(".domain").attr("stroke", "#e2e8f0"))
      .selectAll("text").style("fill", "#475569").style("font-size", "9px");

  }, [data, xValue1, xValue2, xFormat]);

  return <svg ref={svgRef} className="block mx-auto" />;
}
