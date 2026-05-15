"use client";
import { useState } from "react";
import { useListingsData } from "@/hooks/useListingsData";
import TreemapChart from "../components/charts/DT01_TreeMap";
import JitterPlot from "../components/charts/DT01_JitterPlot";
import RadarChart from "../components/charts/DT06_RadarChart";

export default function ExperiencePage() {
  const { allData, rawData, scoreData, loading } = useListingsData();
  const [selectedGroup, setSelectedGroup] = useState({ title: "Toàn thành phố", data: [] });

  return (
    <div className="p-8 flex flex-col gap-8 bg-slate-50 min-h-screen">
      <header className="border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              CUSTOMER EXPERIENCE
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Hạ tầng & Đánh giá chi tiết trải nghiệm khách hàng.
            </p>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs font-bold text-amber-700 uppercase">Đang tải dữ liệu NYC...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-700 uppercase">
                Sẵn sàng ({rawData.length.toLocaleString()} listings)
              </span>
            </div>
          )}
        </div>
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
        {loading ? (
          <div className="h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm">
            Đang dựng biểu đồ Treemap...
          </div>
        ) : (
          <TreemapChart data={allData} onCellClick={(t, s) => setSelectedGroup({ title: t, data: s })} />
        )}
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
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm">
                Đang dựng biểu đồ Jitter...
              </div>
            ) : (
              <JitterPlot data={selectedGroup.data.length > 0 ? selectedGroup.data : allData} title={selectedGroup.title} />
            )}
          </div>
        </section>

        {/* TASK 7: RADAR CHART */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col min-h-[500px] hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-teal-500 rounded-full" />
              6. So sánh đánh giá giữa các quận
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Radar Chart so sánh điểm review giữa các khu vực NYC
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm">
                Đang dựng biểu đồ Radar...
              </div>
            ) : (
              <RadarChart data={scoreData} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
