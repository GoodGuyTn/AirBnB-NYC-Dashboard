# AirBnB NYC Dashboard

Dự án xây dựng Dashboard phân tích dữ liệu AirBnB tại New York City cho môn Trực quan hóa Dữ liệu.

## Thông tin nhóm

### Nhóm 4 - Lớp 23HTTT2

- 23127138 - Phan Trung Tuấn
- 23127468 - Bùi Quang Sơn
- 23127363 - Võ Nhật Hào
- 23127340 - Ngô Thế Đạt
- 23127349 - Hà Minh Đức

## Công nghệ sử dụng

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Visualization:** D3.js

## Hướng dẫn chạy dự án

1. Cài đặt thư viện:

```bash
npm install
```

2. Đảm bảo file dữ liệu nằm trong thư mục `public/data/`:
- `listings.csv`

3. Chạy môi trường phát triển:

```bash
npm run dev
```

4. Mở trình duyệt tại:

```text
http://localhost:3000
```

## Build production

```bash
npm run build
npm start
```

## Cấu trúc trang (Tabs)

Dự án gồm 4 trang chính tương ứng các nhóm bài toán:

- `/` (Market Overview & Investment): Task 7, 8, 9, 10
- `/pricing` (Pricing & Value): Task 2, 5
- `/hosts` (Host Performance): Task 3, 4
- `/experience` (Customer Experience): Task 1, 6

## Cấu trúc thư mục chính

```text
app/
  components/charts/   # Các chart D3 theo từng task
  hooks/               # Hook xử lý dữ liệu dùng chung
  hosts/               # Trang Host Performance
  pricing/             # Trang Pricing & Value
  experience/          # Trang Customer Experience
  page.js              # Trang dashboard chính
public/data/
  listings.csv
```

## Ghi chú

- Dữ liệu được nạp một lần qua context dùng chung để giảm tải khi chuyển trang.
