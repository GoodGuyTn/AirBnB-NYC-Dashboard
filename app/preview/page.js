'use client';
import { useListingsData } from '@/hooks/useListingsData';
import RoomTypeBoroughPriceChart from '@/components/charts/DT05_RoomTypeBoroughPrice';
import RadarChart from '@/components/charts/DT07_RadarChart';

export default function PreviewRoomPricePage() {
  const { rawData, scoreData, loading, error } = useListingsData();

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-semibold">Đang tải dữ liệu listings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen bg-slate-50 text-red-600">
        Lỗi tải dữ liệu: {error.message || 'Không thể đọc file listings.csv'}
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Preview: Giá theo loại phòng & quận</h1>
        <p className="text-slate-500 mt-2 max-w-2xl">
          Biểu đồ riêng để bạn xem trước mức giá trung bình theo loại phòng trong Manhattan, Brooklyn và Staten Island mà không ảnh hưởng tới dashboard chính.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <RoomTypeBoroughPriceChart data={rawData} />
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <RadarChart data={scoreData} />
        </div>
      </div>
    </div>
  );
}
