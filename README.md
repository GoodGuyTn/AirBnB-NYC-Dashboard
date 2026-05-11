# AirBnB NYC Dashboard

Dự án Xây dựng Dashboard Phân tích Dữ liệu AirBnB tại New York City - Môn học Trực quan hóa Dữ liệu.
Nhóm 4 - Lớp 23HTTT2.

## 🚀 Công nghệ sử dụng
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (v4)
- **Visualization:** D3.js

## ⚠️ LƯU Ý QUAN TRỌNG DÀNH CHO CÁC THÀNH VIÊN TRONG NHÓM (QUẢN LÝ DỮ LIỆU)

> [!WARNING]
> **Không được commit các file `.csv` lớn lên GitHub!**
> Do file `calendar.csv` có dung lượng lên đến gần 700MB, vượt quá giới hạn 100MB/file của GitHub. Nếu cố tình commit và push, Git sẽ báo lỗi `HTTP 408` và chặn toàn bộ quá trình push.

**Cách xử lý Data khi clone project về:**
1. Thư mục `public/data/` đã được thêm vào `.gitignore`. 
2. Mọi người trong nhóm khi pull code mới về sẽ **không thấy các file CSV**.
3. **Mỗi người tự copy 3 file dữ liệu** (`calendar.csv`, `reviews.csv`, `listings.csv`) bỏ vào thư mục `public/data/` trên máy cá nhân của mình để code và chạy test cục bộ.
4. Tuyệt đối **không** cố gắng ép Git track thư mục này bằng các lệnh force add.

## 🛠 Hướng dẫn chạy dự án

1. Cài đặt các thư viện cần thiết:
```bash
npm install
```

2. Đảm bảo bạn đã chép các file `calendar.csv`, `reviews.csv`, `listings.csv` vào thư mục `public/data/`.

3. Chạy môi trường phát triển (Development server):
```bash
npm run dev
```

4. Mở trình duyệt và truy cập vào [http://localhost:3000](http://localhost:3000) để xem Dashboard.

## 📂 Cấu trúc Trang (Tabs)

Dự án được chia thành 4 trang chính tương ứng với các Domain Tasks:
- `/` (Overview & Supply): Chứa các Task 9, 10, 11
- `/pricing` (Pricing & Value): Chứa các Task 2, 6, 8
- `/hosts` (Host Performance): Chứa các Task 3, 4
- `/experience` (Customer Experience): Chứa các Task 1, 5, 7
