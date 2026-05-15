'use client';

import { useListingsData } from '@/hooks/useListingsData';
import HostReputationChart from '../components/charts/DT03_HostReputationChart';
import HostProfessionalismChart from '../components/charts/DT04_HostProfessionalismChart';

export default function HostsPage() {
  const { rawData, loading } = useListingsData();

  // if (loading) return (
  //   <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
  //     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     <p className="mt-4 text-slate-500 font-mono">Đang phân tích hiệu suất Host...</p>
  //   </div>
  // );

  return (
    <div className="p-8 bg-slate-50 min-h-screen flex flex-col gap-8">
      <header className="border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              HOST PERFORMANCE
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Đánh giá uy tín và mức độ chuyên nghiệp của chủ nhà Airbnb tại NYC.
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

      <div className="grid grid-cols-1 gap-8">
        {/* Domain Task 3: Host Reputation */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
              3. Phân tích uy tín chủ nhà
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mối quan hệ giữa số lượng đánh giá và điểm xếp hạng (Scatter Plot)
            </p>
          </div>
          <div className="min-h-[420px]">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm">
                Đang dựng biểu đồ Scatter Plot...
              </div>
            ) : (
              <HostReputationChart data={rawData} />
            )}
          </div>
        </section>

        {/* Domain Task 4: Host Professionalism */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
              4. Mức độ chuyên nghiệp của chủ nhà
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mối quan hệ giữa thời gian phản hồi và số lượng tài sản quản lý (Bar Chart)
            </p>
          </div>
          <div className="min-h-[420px]">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm">
                Đang dựng biểu đồ Bar Chart...
              </div>
            ) : (
              <HostProfessionalismChart data={rawData} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}