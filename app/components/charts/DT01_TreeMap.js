'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { blueSaturationScale, COLOR_MIN, COLOR_MAX, blueInterpolator } from "@/lib/chartConfig";

// ─── Tooltip React ─────────────────────────────────────────────────────────────
function Tooltip({ tip }) {
  if (!tip) return null;
  const { name, bath, count, avgRating, x, y } = tip;
  const left = Math.min(x + 14, window.innerWidth - 220);
  const top  = Math.max(y - 8, 8);

  return (
    <div className="pointer-events-none fixed z-50" style={{ left, top, minWidth: 190 }}>
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden text-[11px]">
        <div className="bg-blue-600 px-3 py-2 text-white font-bold text-[12px]">{name} / {bath}</div>
        <div className="px-3 py-2.5 space-y-1.5 text-slate-700">
          <div className="flex justify-between"><span className="text-slate-400">Số căn hộ:</span><span className="font-bold text-blue-600">{count.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Rating TB:</span><span className="font-bold text-slate-700">{avgRating.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}

export default function TreemapChart({ data, onCellClick }) {
  const svgRef = useRef(null);
  const [selectedBeds, setSelectedBeds] = useState([]);
  const [selectedBaths, setSelectedBaths] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  
  // STATE MỚI: Theo dõi ô đang được chọn để thực hiện Toggle
  const [activeCellKey, setActiveCellKey] = useState(null);

  const options = useMemo(() => {
    if (!data?.length) return { beds: [], baths: [] };
    return {
      beds: [...new Set(data.map(d => d.bedrooms))].sort((a, b) => a - b),
      baths: [...new Set(data.map(d => d.bathrooms))].sort((a, b) => a - b)
    };
  }, [data]);

  useEffect(() => {
    if (options.beds.length > 0 && selectedBeds.length === 0) setSelectedBeds(options.beds.map(String));
    if (options.baths.length > 0 && selectedBaths.length === 0) setSelectedBaths(options.baths.map(String));
  }, [options]);

  // Reset active cell khi filter thay đổi
  useEffect(() => { setActiveCellKey(null); }, [selectedBeds, selectedBaths]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(d => selectedBeds.includes(d.bedrooms.toString()) && selectedBaths.includes(d.bathrooms.toString()));
  }, [data, selectedBeds, selectedBaths]);

  useEffect(() => {
    if (!filteredData.length || !svgRef.current) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    const width = svgRef.current.parentElement.clientWidth;
    const height = 480;

    const nested = d3.rollups(filteredData,
      v => ({ count: v.length, avgRating: d3.mean(v, d => d.rating) || 0, rows: v }),
      d => d.bedrooms + ' PN', d => d.bathrooms + ' PT'
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
      .style('cursor', 'pointer');

    // LOGIC TOGGLE KHI CLICK
    leaf.on('click', (e, d) => {
      const currentKey = `${d.parent.data.name}-${d.data.name}`;
      
      if (activeCellKey === currentKey) {
        // Nếu nhấn lại ô cũ -> Hủy chọn
        setActiveCellKey(null);
        onCellClick?.("Toàn thành phố", []); // Trả về mặc định
      } else {
        // Nếu nhấn ô mới -> Chọn ô đó
        setActiveCellKey(currentKey);
        onCellClick?.(`${d.parent.data.name} - ${d.data.name}`, d.data.rawData);
      }
    });

    leaf.on('mousemove', (e, d) => {
      setTooltip({ name: d.parent.data.name, bath: d.data.name, count: d.data.value, avgRating: d.data.avgRating, x: e.clientX, y: e.clientY });
    }).on('mouseleave', () => setTooltip(null));

    leaf.append('rect')
      .attr('class', 'cell')
      .attr('width', d => d.x1 - d.x0).attr('height', d => d.y1 - d.y0)
      .attr('fill', d => blueSaturationScale(d.data.avgRating))
      // Cập nhật viền dựa trên trạng thái activeCellKey
      .attr('stroke', d => `${d.parent.data.name}-${d.data.name}` === activeCellKey ? '#000' : 'none')
      .attr('stroke-width', 3);

    leaf.each(function(d) {
      const g = d3.select(this); const w = d.x1 - d.x0; const h = d.y1 - d.y0;
      if (w > 65 && h > 35) {
        const text = g.append('text').attr('x', 5).attr('y', 15).attr('font-size', '10px').attr('font-weight', '700').attr('pointer-events', 'none');
        text.append('tspan').attr('fill', d.data.avgRating > 4.4 ? 'white' : '#1e293b').text(`${d.data.name} / ${d.parent.data.name}`);
        if (h > 45) {
          text.append('tspan').attr('x', 5).attr('dy', '1.4em').attr('fill', d.data.avgRating > 4.4 ? 'rgba(255,255,255,0.7)' : '#64748b').text(d.data.avgRating.toFixed(2));
        }
      }
    });
  }, [filteredData, activeCellKey]); // Thêm activeCellKey vào dependency để re-render viền

  const toggleFilter = (val, list, setter) => {
    const s = val.toString();
    setter(list.includes(s) ? list.filter(i => i !== s) : [...list, s]);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-4 gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight text-blue-600">Bộ lọc cấu hình Phòng Tắm (PT) và Phòng Ngủ (PN)</h3>
            <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">Nhấn vào ô vuông để lọc/chọn</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Đánh giá trung bình</span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400">{COLOR_MIN}</span>
              <div className="w-40 h-2.5 rounded-full" style={{ background: `linear-gradient(to right, ${blueInterpolator(0.1)}, ${blueInterpolator(1)})` }}></div>
              <span className="text-[10px] font-bold text-slate-600">{COLOR_MAX}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-slate-900">
          <div className="flex items-start gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase mt-1.5 min-w-[70px]">Phòng ngủ:</span>
            <div className="flex flex-wrap gap-1.5">
              {options.beds.map(b => (
                <button key={b} onClick={() => toggleFilter(b, selectedBeds, setSelectedBeds)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${selectedBeds.includes(b.toString()) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>
                  {b} PN
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase mt-1.5 min-w-[70px]">Phòng tắm:</span>
            <div className="flex flex-wrap gap-1.5">
              {options.baths.map(b => (
                <button key={b} onClick={() => toggleFilter(b, selectedBaths, setSelectedBaths)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${selectedBaths.includes(b.toString()) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>
                  {b} PT
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg ref={svgRef} className="w-full shadow-lg border border-slate-200" />
        {filteredData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-slate-400 italic">Chọn giá trị để xem biểu đồ</div>
        )}
      </div>
      <Tooltip tip={tooltip} />
    </div>
  );
}