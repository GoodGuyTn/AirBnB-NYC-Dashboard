export default function ExperiencePage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Customer Experience
        </h1>
        <p className="text-slate-500 mt-2">
          Phân tích các yếu tố ảnh hưởng đến trải nghiệm và mức độ hài lòng của khách hàng.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Domain Task 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Beds/Baths vs Reviews (Task 1)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            [D3.js Heatmap/Bubble Chart Wrapper Here]
          </div>
        </div>

        {/* Placeholder for Domain Task 7 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Leniency: Manhattan vs Staten Island (Task 7)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            [D3.js Radar Chart Wrapper Here]
          </div>
        </div>

        {/* Placeholder for Domain Task 5 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Premium vs Budget in Brooklyn (Task 5)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            [D3.js Grouped Bar Chart Wrapper Here]
          </div>
        </div>
      </div>
    </div>
  );
}
