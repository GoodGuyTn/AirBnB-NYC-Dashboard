# 📊 Airbnb NYC Dashboard - Host Analysis

Một ứng dụng dashboard tương tác để phân tích uy tín và mức độ chuyên nghiệp của các chủ nhà Airbnb tại New York City.

## 📋 Nội dung

### Task 1: Phân tích uy tín chủ nhà (Host Reputation Analysis)

**Mục tiêu:** Là một khách hàng tiềm năng, tôi muốn xem mối liên hệ giữa số lượng bài đánh giá (Number of reviews) và điểm xếp hạng trung bình (Review scores rating) của các chủ nhà để xác định những chủ nhà uy tín nhất trong khu vực.

**Biểu đồ:** Scatter Plot (Biểu đồ phân tán)

#### Dữ liệu sử dụng:
- **X-Axis (Trục hoành):** `number_of_reviews` (Định lượng) - Số lượng bài đánh giá
- **Y-Axis (Trục tung):** `review_scores_rating` (Định lượng) - Điểm xếp hạng trung bình
- **Mark:** Điểm (Points)
- **Color:** Các chủ nhà khác nhau được biểu thị bằng các điểm khác nhau

#### Phân tích:
- **Extremes (Cực trị):** Xác định những chủ nhà có điểm đánh giá cao nhất (điểm > 4.8/5.0)
- **Correlation (Tương quan):** Phân tích xem liệu những chủ nhà có nhiều lượt review thì điểm số có ổn định và cao hơn hay không
- **Discover (Khám phá):** Tìm ra nhóm chủ nhà có hiệu suất phục vụ tốt dựa trên phản hồi thực tế của người dùng

---

### Task 2: Phân tích mức độ chuyên nghiệp của chủ nhà (Host Professionalism)

**Mục tiêu:** Là một nhà phân tích thị trường, tôi muốn xem xét mối quan hệ giữa số lượng tài sản sở hữu (host_listings_count) và thời gian phản hồi (host_response_time) để xác định xem các chủ nhà sở hữu nhiều bất động sản có duy trì được tốc độ tương tác chuyên nghiệp với khách hàng hay không.

**Biểu đồ:** Grouped Bar Chart (Biểu đồ thanh nhóm)

#### Dữ liệu sử dụng:
- **X-Axis (Trục hoành):** `host_response_time` (Phân loại) - Thời gian phản hồi
  - Vài phút
  - Trong vài giờ
  - Trong vài ngày
  - Hơn một tháng
- **Y-Axis (Trục tung):** `host_listings_count` (Định lượng) - Số lượng tài sản trung bình
- **Mark:** Thanh (Bars)
- **Grouping:** Các thanh được nhóm theo thời gian phản hồi

#### Phân tích:
- **Dependency (Phụ thuộc):** Tìm sự tương quan giữa số tài sản sở hữu và thời gian phản hồi
- **Compare (So sánh):** So sánh thời gian phản hồi trung bình giữa các chủ nhà quản lý quy mô khác nhau
- **Discover (Khám phá):** Tìm ra nhóm chủ nhà quản lý chuyên nghiệp

---

## 🏗️ Cấu trúc Dự án

```
app/
├── components/
│   ├── HostReputationChart.js      # Biểu đồ phân tán uy tín chủ nhà
│   └── HostProfessionalismChart.js # Biểu đồ thanh chuyên nghiệp chủ nhà
├── lib/
│   └── data.js                     # Dữ liệu mẫu
├── globals.css                     # Kiểu toàn cục
├── layout.js                       # Layout gốc
├── page.js                         # Trang chính
└── page.module.css                 # Kiểu trang
```

## 🚀 Cách chạy

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Chạy Development Server
```bash
npm run dev
```

### 3. Truy cập Dashboard
Mở trình duyệt và truy cập: `http://localhost:3000`

## 📊 Công nghệ sử dụng

- **Next.js 16.2.1** - Framework React hiện đại
- **React 19.2.4** - UI Library
- **Recharts 2.10.3** - Thư viện vẽ biểu đồ
- **CSS Modules** - Quản lý kiểu trang

## 📈 Dữ liệu

Dữ liệu mẫu được cung cấp trong file `app/lib/data.js`. Bạn có thể:

1. **Sử dụng dữ liệu mẫu hiện tại:** Dữ liệu đã được chuẩn bị sẵn
2. **Kết nối với API thực:** Cập nhật các hàm `fetchHostReputationData()` và `fetchHostProfessionalismData()` trong `app/lib/data.js`
3. **Tải dữ liệu từ CSV:** Tạo một hàm xử lý file CSV

Ví dụ cấu trúc dữ liệu Task 1:
```javascript
{
  host_id: 1001,
  host_name: 'Alice Johnson',
  number_of_reviews: 125,
  review_scores_rating: 4.95
}
```

Ví dụ cấu trúc dữ liệu Task 2:
```javascript
{
  host_response_time: 'Vài phút',
  avg_listings_count: 4.2,
  host_count: 1250
}
```

## 🎨 Tùy chỉnh

### Thay đổi màu sắc
Cập nhật gradient màu trong `app/page.module.css`:
```css
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Thêm dữ liệu mới
1. Cập nhật dữ liệu trong `app/lib/data.js`
2. Nhập dữ liệu đó vào component tương ứng
3. Điều chỉnh kiểu theo nhu cầu

## 🔍 Phân tích Insight

### Task 1 - Host Reputation:
- **Insight 1:** Chủ nhà nào có số lượt review cao nhất?
- **Insight 2:** Có mối tương quan dương giữa số lượng reviews và điểm xếp hạng?
- **Insight 3:** Những chủ nhà mới (ít reviews) có thể được tin cậy không?

### Task 2 - Host Professionalism:
- **Insight 1:** Chủ nhà nào phản hồi nhanh nhất?
- **Insight 2:** Những chủ nhà quản lý nhiều tài sản có giảm hiệu suất không?
- **Insight 3:** Tốc độ phản hồi có ảnh hưởng đến số lượng tài sản?

## 📝 Hướng phát triển

- [ ] Thêm bộ lọc tương tác trên biểu đồ
- [ ] Xuất dữ liệu thành PDF/Excel
- [ ] Thêm biểu đồ thống kê thêm
- [ ] Kết nối với API Airbnb thực tế
- [ ] Thêm chức năng tìm kiếm chủ nhà cụ thể
- [ ] Tạo báo cáo chi tiết theo khu vực

## 📞 Liên hệ

Để có thêm thông tin hoặc hỗ trợ, vui lòng liên hệ với đội phát triển.

## 📄 Giấy phép

Dự án này được cung cấp để sử dụng giáo dục và phân tích.
