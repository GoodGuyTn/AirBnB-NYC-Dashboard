import StackedBarChart from './components/StackedBarChart';

export default function OverviewPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Market & Investment Overview
        </h1>
        <p className="text-slate-500 mt-2">
          Phân tích tình trạng cung-cầu, mức độ sẵn sàng cho thuê và tỷ lệ lấp đầy.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Domain Task 9 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-100 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Instant Book vs Manual Approval(Task 9)
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <StackedBarChart />
          </div>
        </div>

        {/* Placeholder for Domain Task 10 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-100 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Minimum Nights Distribution (Task 10)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            [D3.js Grouped Violin Plot Wrapper Here]
          </div>
        </div>

        {/* Placeholder for Domain Task 11 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-100 flex flex-col lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Room Type Distribution & Average Price (Task 11)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            [D3.js Grouped Bar Chart Wrapper Here]
          </div>
        </div>
      </div>
    </div>
  );
}
