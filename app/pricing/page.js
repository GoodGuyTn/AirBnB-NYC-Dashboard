'use client';

import ScatterPlot from '../components/ScatterPlot';

export default function PricingPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Pricing Strategy
        </h1>
        <p className="text-slate-500 mt-2">
          Phân tích các yếu tố cấu thành giá và so sánh chiến lược định giá.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Domain Task 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Superhost vs Non-Superhost Premium (Task 2)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            [D3.js Line/Bar Chart Wrapper Here]
          </div>
        </div>

        {/* Placeholder for Domain Task 6 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Pricing Dependencies: Beds/Baths/Capacity (Task 6)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            [D3.js Heatmap/Correlation Chart Wrapper Here]
          </div>
        </div>

        {/* Placeholder for Domain Task 5 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Price by Room Type & Area Popularity (Task 5)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            [D3.js Grouped Bar/Scatter Chart Wrapper Here]
          </div>
        </div>

        {/* Task 8 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Revenue vs Occupancy by District (Task 8)
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <ScatterPlot />
          </div>
        </div>
      </div>
    </div>
  );
}
