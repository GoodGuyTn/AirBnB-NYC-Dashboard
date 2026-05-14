"use client";
import { useState } from "react";
import { useListingsData } from "@/hooks/useListingsData";
import TreemapChart from "../components/charts/DT01_TreeMap";
import JitterPlot from "../components/charts/DT01_JitterPlot";

export default function ExperiencePage() {
  const { allData, loading } = useListingsData();
  const [selectedGroup, setSelectedGroup] = useState({ title: "Toàn thành phố", data: [] });

  if (loading) return <div className="p-10 text-center font-mono text-slate-400">Loading NYC Data...</div>;

  return (
    <div className="p-8 flex flex-col gap-8 bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter">CUSTOMER EXPERIENCE</h1>
        <p className="text-slate-500 text-sm mt-2 uppercase tracking-widest font-bold">Hạ tầng & Đánh giá chi tiết</p>
      </header>

      {/* TREEMAP - TRẢI DÀI TOÀN MÀN HÌNH */}
      <section className="bg-white p-6 rounded-xl border border-slate-100 shadow-2xl">
        <h2 className="text-sm font-black text-slate-400 mb-6 flex items-center gap-3">
          <span className="w-1 h-4 bg-blue-500"></span> 01. MẬT ĐỘ HẠ TẦNG (MASTER)
        </h2>
        <TreemapChart data={allData} onCellClick={(t, s) => setSelectedGroup({ title: t, data: s })} />
      </section>

      {/* GRID CHO JITTER PLOT VÀ TASK KHÁC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* JITTER PLOT - CHIẾM 50% CHIỀU NGANG */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 flex flex-col min-h-[500px]">
          <h2 className="text-sm font-black text-slate-400 mb-6 flex items-center gap-3">
            <span className="w-1 h-4 bg-rose-500"></span> 02. PHÂN BỔ CHI TIẾT: {selectedGroup.title}
          </h2>
          <div className="flex-1">
            <JitterPlot data={selectedGroup.data.length > 0 ? selectedGroup.data : allData} title={selectedGroup.title} />
          </div>
        </div>

        {/* TASK 7 PLACEHOLDER - CHIẾM 50% CÒN LẠI */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 flex flex-col opacity-30">
          <h2 className="text-sm font-black text-slate-400 mb-6 uppercase italic">Leniency Analysis (Task 7)</h2>
          <div className="flex-1 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-slate-600">
             [Radar Chart]
          </div>
        </div>
      </div>

      {/* TASK 5 - CHUYỂN XUỐNG DƯỚI CÙNG */}
      <section className="bg-white p-6 rounded-xl border border-slate-100 opacity-30">
        <h2 className="text-sm font-black text-slate-400 mb-4 uppercase">Pricing vs Budget in Brooklyn (Task 5)</h2>
        <div className="h-[150px] border border-dashed border-white/10 rounded-lg flex items-center justify-center text-slate-600">
          [Grouped Bar Chart]
        </div>
      </section>
    </div>
  );
}