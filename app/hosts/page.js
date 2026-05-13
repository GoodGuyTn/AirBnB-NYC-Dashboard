"use client";

import { useListingsData } from "@/hooks/useListingsData";
import DumbbellChart from "../components/charts/DT02_DumbellChart";

export default function HostsPage() {
  const { allData, rawData, loading } = useListingsData();

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-slate-500 font-mono">Đang phân tích hiệu suất Host...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Host Performance Analysis
        </h1>
        <p className="text-slate-500 mt-2">
          Đánh giá sự uy tín và hiệu quả kinh doanh giữa các nhóm Host (Superhost vs Regular).
        </p>
      </header>
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
            Superhost - Host
          </h2>
        </div>
        
        <div className="min-h-[400px]">
          <DumbbellChart data={rawData} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Placeholder for Domain Task 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col opacity-50">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">
            Reviews vs Ratings (Task 3)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 italic">
            [D3.js Scatter Plot của thành viên khác]
          </div>
        </div>

        {/* Placeholder for Domain Task 4 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col opacity-50">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">
            Host Listings vs Response Time (Task 4)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 italic">
            [D3.js Bar/Box Plot của thành viên khác]
          </div>
        </div>
      </div>
    </div>
  );
}