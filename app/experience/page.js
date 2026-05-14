"use client";
import { useState } from "react";
import { useListingsData } from "@/hooks/useListingsData";
import TreemapChart from "../components/charts/DT01_TreeMap";
import JitterPlot from "../components/charts/DT01_JitterPlot";
import RadarChart from "../components/charts/DT07_RadarChart";

export default function ExperiencePage() {
  const { allData, scoreData, loading } = useListingsData();
  const [selectedGroup, setSelectedGroup] = useState({ title: "Toàn thành phố", data: [] });

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-slate-500 font-mono">Đang tải dữ liệu Experience...</p>
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-8 bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">CUSTOMER EXPERIENCE</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Hạ tầng & Đánh giá chi tiết trải nghiệm khách hàng.</p>
      </header>

      {/* TASK 1: TREEMAP - TRẢI DÀI TOÀN MÀN HÌNH */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
        <div className="mb-4">
          <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
            1a. Phân bố cấu hình phòng ngủ và phòng tắm 
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click vào ô để xem phân bổ chi tiết ở biểu đồ bên dưới
          </p>
        </div>
        <TreemapChart data={allData} onCellClick={(t, s) => setSelectedGroup({ title: t, data: s })} />
      </section>

      {/* GRID CHO JITTER PLOT VÀ RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TASK 1: JITTER PLOT */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col min-h-[500px] hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-rose-500 rounded-full" />
              1b. Phân bổ chi tiết: {selectedGroup.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Biểu đồ Jitter Plot thể hiện phân bổ rating
            </p>
          </div>
          <div className="flex-1">
            <JitterPlot data={selectedGroup.data.length > 0 ? selectedGroup.data : allData} title={selectedGroup.title} />
          </div>
        </section>

        {/* TASK 7: RADAR CHART */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col min-h-[500px] hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-teal-500 rounded-full" />
              7. So sánh đánh giá giữa các quận
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Radar Chart so sánh điểm review giữa các khu vực NYC
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <RadarChart data={scoreData} />
          </div>
        </section>
      </div>
    </div>
  );
}