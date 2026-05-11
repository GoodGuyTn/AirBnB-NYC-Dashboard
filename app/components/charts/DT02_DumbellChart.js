'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { SUPERHOST_COLOR, NONSUPERHOST_COLOR } from '@/lib/chartConfig';

const BOROUGHS = ['All', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

export default function DumbbellChart({ data }) {
  const [selectedBorough, setSelectedBorough] = useState('All');
  const [sortBy, setSortBy] = useState('price');

  const sortedRollup = useMemo(() => {
    const filtered = selectedBorough === 'All' ? data : data.filter(d => d.borough === selectedBorough);
    const groupFn = selectedBorough === 'All' ? (d => d.borough) : (d => d.neighbourhood);

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

    return rollup.sort((a, b) => {
      if (sortBy === 'price') return b.gapP - a.gapP;
      return b.gapR - a.gapR;
    });
  }, [data, selectedBorough, sortBy]);

  return (
    <div className="w-full space-y-6 overflow-x-hidden"> {/* ÉP KHÔNG CHO CUỘN NGANG */}
      {/* Menu điều khiển */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Khu vực</span>
          <div className="flex flex-wrap gap-1">
            {BOROUGHS.map((b) => (
              <button key={b} onClick={() => setSelectedBorough(b)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                  selectedBorough === b ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >{b}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Sắp xếp</span>
          <div className="flex bg-slate-900 p-1 rounded-full border border-white/5">
            <button onClick={() => setSortBy('price')}
              className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${sortBy === 'price' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
            >Giá chênh lệch</button>
            <button onClick={() => setSortBy('rating')}
              className={`px-4 py-1 rounded-full text-[10px] font-bold transition-all ${sortBy === 'rating' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
            >Rating chênh lệch</button>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
             <p className="text-xs font-bold text-sky-400 mb-4 uppercase tracking-tighter">● So sánh Giá (USD)</p>
             <DumbbellSVG 
                data={sortedRollup} 
                xValue1={d => d.nonP} xValue2={d => d.supP}
                xFormat={d => `$${d.toFixed(0)}`}
             />
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
             <p className="text-xs font-bold text-rose-400 mb-4 uppercase tracking-tighter">● So sánh Rating (1-5)</p>
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
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;
    
    // TÍNH TOÁN WIDTH ĐỘNG THEO PARENT
    const containerWidth = svgRef.current.parentElement.clientWidth;
    const margin = { top: 10, right: 70, bottom: 25, left: 160 }; // Giảm lề trái xuống 160 để tiết kiệm diện tích
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

    // Trục Y - Tên khu vực (Cắt chữ nếu quá dài)
    g.append("g").call(d3.axisLeft(y).tickSize(0).tickPadding(10))
     .call(g => g.select(".domain").remove())
     .selectAll("text")
     .style("fill", "#94a3b8")
     .style("font-size", "10px")
     .each(function(d) {
        const text = d3.select(this);
        if (d.length > 22) text.text(d.slice(0, 20) + "..."); // Cắt chữ để không lấn sang chart khác
     });

    const rows = g.selectAll(".row").data(data).enter().append("g");

    // Đường kẻ ngang mờ làm nền (Guide lines)
    rows.append("line")
        .attr("x1", -margin.left).attr("x2", chartWidth + margin.right)
        .attr("y1", d => y(d.name) + y.bandwidth()/2).attr("y2", d => y(d.name) + y.bandwidth()/2)
        .attr("stroke", "rgba(255,255,255,0.03)").attr("stroke-width", 1);

    // Thanh Dumbbell
    rows.append("line")
        .attr("x1", d => x(xValue1(d))).attr("x2", d => x(xValue2(d)))
        .attr("y1", d => y(d.name) + y.bandwidth()/2).attr("y2", d => y(d.name) + y.bandwidth()/2)
        .attr("stroke", "rgba(255,255,255,0.15)").attr("stroke-width", 4).attr("stroke-linecap", "round");

    rows.append("circle")
        .attr("cx", d => x(xValue1(d))).attr("cy", d => y(d.name) + y.bandwidth()/2)
        .attr("r", 5).attr("fill", NONSUPERHOST_COLOR).attr("stroke", "#0c0c0e").attr("stroke-width", 1);

    rows.append("circle")
        .attr("cx", d => x(xValue2(d))).attr("cy", d => y(d.name) + y.bandwidth()/2)
        .attr("r", 5).attr("fill", SUPERHOST_COLOR).attr("stroke", "#0c0c0e").attr("stroke-width", 1);

    // Con số chênh lệch (Gap) - Giới hạn không cho tràn lề phải
    rows.append("text")
        .attr("x", d => Math.min(x(Math.max(xValue1(d), xValue2(d))) + 8, chartWidth + 5))
        .attr("y", d => y(d.name) + y.bandwidth()/2 + 4)
        .style("fill", "#64748b").style("font-size", "9px").style("font-weight", "800")
        .text(d => {
            const gap = xValue2(d) - xValue1(d);
            return (gap >= 0 ? "+" : "") + xFormat(gap);
        });

    // Trục X (Nhãn giá/rating)
    g.append("g").attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(x).ticks(3).tickFormat(xFormat))
     .call(g => g.select(".domain").attr("stroke", "rgba(255,255,255,0.1)"))
     .selectAll("text").style("fill", "#475569").style("font-size", "9px");

  }, [data, xValue1, xValue2]);

  return <svg ref={svgRef} className="block mx-auto" />;
}