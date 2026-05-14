'use client';

import { useListingsData } from '@/hooks/useListingsData';
import DumbbellChart from '../components/charts/DT02_DumbellChart';
import RoomTypeBoroughPriceChart from '../components/charts/DT05_RoomTypeBoroughPrice';

export default function PricingPage() {
  const { rawData, loading } = useListingsData();

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-slate-500 font-mono">Đang tải dữ liệu Pricing...</p>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen flex flex-col gap-8">
      <header className="border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          PRICING & VALUE
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Phân tích các yếu tố cấu thành giá và so sánh chiến lược định giá.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Domain Task 2: Superhost vs Non-Superhost */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-sky-500 rounded-full" />
              2. Superhost vs Non-Superhost
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh giá và đánh giá giữa các listing thuộc Superhost và Host thông thường 
            </p>
          </div>
          <div className="min-h-[400px]">
            <DumbbellChart data={rawData} />
          </div>
        </section>

        {/* Domain Task 5: Price by Room Type & Borough */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-violet-500 rounded-full" />
              5. Price by Room Type & Area Popularity
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mức giá trung bình theo loại phòng và quận (Grouped Bar Chart)
            </p>
          </div>
          <div className="min-h-[400px]">
            <RoomTypeBoroughPriceChart data={rawData} />
          </div>
        </section>
      </div>
    </div>
  );
}
