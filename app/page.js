'use client';
import { useListingsData } from '@/hooks/useListingsData';
import GroupedViolinPlot from './components/charts/DT10_GroupedViolinPlot';
import BubbleMatrix from './components/charts/DT11_BubbleMatrix';
import ScatterPlot from './components/charts/DT08_ScatterPlot';
import StackedBarChart from './components/charts/DT09_StackedBarChart';

export default function OverviewPage() {
  const { rawData, loading } = useListingsData();

  return (
    <div className="p-8 bg-slate-50 min-h-screen flex flex-col gap-8">
      <header className="border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              MARKET OVERVIEW & INVESTMENT
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Phân tích quy mô thị trường, nhận diện xu hướng lưu trú và tương quan cung - cầu tại NYC.
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

      {/* Task 10 & Task 11 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Domain Task 10 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
              10. Phân bố thời gian lưu trú tối thiểu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xu hướng ngắn hạn vs dài hạn theo từng khu vực và loại phòng (Grouped Violin Plot)
            </p>
          </div>
          <div className="flex-1 min-h-[420px] flex flex-col justify-center">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm">
                Đang dựng biểu đồ Violin...
              </div>
            ) : (
              <GroupedViolinPlot data={rawData} />
            )}
          </div>
        </section>

        {/* Domain Task 11 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
              11. Quy mô nguồn cung & Mức giá thị trường
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tương quan giữa số lượng Listing và Giá trung bình (Bubble Matrix Chart)
            </p>
          </div>
          <div className="flex-1 min-h-[420px] flex flex-col justify-center">
            {loading ? (
              <div className="h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm">
                Đang dựng biểu đồ Bubble Matrix...
              </div>
            ) : (
              <BubbleMatrix data={rawData} />
            )}
          </div>
        </section>
      </div>

      {/* Task 8 & Task 9 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Domain Task 8 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-rose-500 rounded-full" />
              8. Revenue vs Occupancy by District
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gold Mine vs Trap: Phân tích hiệu quả đầu tư theo khu vực (Scatter Plot)
            </p>
          </div>
          <div className="flex-1 min-h-[420px] flex flex-col justify-center">
            <ScatterPlot />
          </div>
        </section>

        {/* Domain Task 9 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h2 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              9. Instant Bookable Impact on Occupancy
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant Book vs Manual Approval (Stacked Bar Chart)
            </p>
          </div>
          <div className="flex-1 min-h-[420px] flex flex-col justify-center">
            <StackedBarChart />
          </div>
        </section>
      </div>
    </div>
  );
}
