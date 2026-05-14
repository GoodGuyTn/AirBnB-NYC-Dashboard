'use client';

import { useListingsData } from '@/hooks/useListingsData';
import HostReputationChart from '../components/charts/DT02_HostReputationChart';
import HostProfessionalismChart from '../components/charts/DT03_HostProfessionalismChart';

export default function HostsPage() {
  const { rawData, loading } = useListingsData();

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-slate-500 font-mono">Đang phân tích hiệu suất Host...</p>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen flex flex-col gap-8">
      <header className="border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          HOST PERFORMANCE
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Đánh giá uy tín và mức độ chuyên nghiệp của chủ nhà Airbnb tại NYC.
        </p>
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
            <HostReputationChart data={rawData} />
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
            <HostProfessionalismChart data={rawData} />
          </div>
        </section>
      </div>
    </div>
  );
}