export default function HostsPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Host Performance
        </h1>
        <p className="text-slate-500 mt-2">
          Đánh giá sự uy tín và độ chuyên nghiệp của các Host dựa trên tương tác với khách hàng.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Domain Task 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Reviews vs Ratings (Task 3)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            [D3.js Scatter Plot Wrapper Here]
          </div>
        </div>

        {/* Placeholder for Domain Task 4 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-slate-700">
            Host Listings vs Response Time (Task 4)
          </h2>
          <div className="flex-1 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
            [D3.js Bar/Box Plot Wrapper Here]
          </div>
        </div>
      </div>
    </div>
  );
}
