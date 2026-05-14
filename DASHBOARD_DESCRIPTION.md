# Bảng Mô Tả Chi Tiết Các Trang Dashboard (AirBnB NYC)

Tài liệu này cung cấp mô tả ngắn gọn, súc tích về ý nghĩa phân tích và cấu trúc biểu đồ của từng trang Dashboard trong hệ thống, giúp các thành viên trong nhóm và người sử dụng dễ dàng nắm bắt mục tiêu của từng Domain Task.

---

## Dashboard 1: Market Overview & Investment (Tổng quan Thị trường & Đầu tư)
**URL:** `/`  
**Các Task tích hợp:** Task 10, Task 11, Task 8, Task 9  
**Mục tiêu:** Phân tích quy mô thị trường, nhận diện xu hướng lưu trú và tương quan cung - cầu, đồng thời hỗ trợ định hướng rủi ro đầu tư tại New York.

- **Phân bố thời gian lưu trú tối thiểu (Task 10 - Grouped Violin Plot):** Khảo sát yêu cầu số đêm tối thiểu (Minimum Nights) nhằm phân loại thị trường giữa nhu cầu phục vụ khách du lịch ngắn ngày và khách thuê dài hạn theo từng quận.
- **Quy mô nguồn cung & Mức giá thị trường (Task 11 - Bubble Matrix Chart):** Thể hiện mối tương quan mật thiết giữa mật độ nguồn cung (kích thước bóng đại diện số lượng Listing) và giá thuê trung bình (màu sắc bóng) để xác định các trọng tâm phân khúc.
- **Hiệu quả đầu tư theo khu vực (Task 8 - Scatter Plot):** Đối chiếu trực tiếp giữa doanh thu ước tính và công suất phòng (Occupancy) nhằm nhận diện các khu vực sinh lời cao ("Mỏ vàng" - Gold Mine) hoặc các khu vực rủi ro ("Vùng bẫy" - Trap).
- **Tác động của tính năng Đặt phòng tức thì (Task 9 - Stacked Bar Chart):** Đánh giá mức độ ảnh hưởng của việc bật tính năng Instant Book lên khả năng lấp đầy phòng trung bình trong năm của các loại hình lưu trú.

---

## Dashboard 2: Pricing & Value (Giá cả & Giá trị)
**URL:** `/pricing`  
**Các Task tích hợp:** Task 2, Task 5  
**Mục tiêu:** Phân tích chuyên sâu các yếu tố cấu thành giá và so sánh các chiến lược định giá trên toàn thành phố.

- **Chiến lược định giá của Superhost (Task 2 - Dumbbell Chart):** So sánh chênh lệch mức giá và điểm đánh giá giữa nhóm chủ nhà đạt chuẩn Superhost và Host thông thường, qua đó đo lường giá trị của "phụ phí thương hiệu" (brand premium).
- **Mức giá theo loại phòng & Độ phổ biến khu vực (Task 5 - Grouped Bar Chart):** Trực quan hóa và so sánh chi tiết giá thuê trung bình của từng loại hình không gian (Private room, Entire home/apt, Shared room) giữa 5 quận của New York.

---

## Dashboard 3: Host Performance (Hiệu suất Chủ nhà)
**URL:** `/hosts`  
**Các Task tích hợp:** Task 3, Task 4  
**Mục tiêu:** Đánh giá uy tín, năng lực vận hành và mức độ chuyên nghiệp của đội ngũ chủ nhà (Host) trên hệ thống Airbnb.

- **Phân tích uy tín chủ nhà (Task 3 - Scatter Plot):** Phân tích mối quan hệ giữa số lượt đánh giá (đại diện cho kinh nghiệm phục vụ) và điểm xếp hạng tổng thể để nhận diện mức độ ổn định về uy tín.
- **Mức độ chuyên nghiệp của chủ nhà (Task 4 - Bar Chart):** Đo lường năng lực hỗ trợ khách hàng thông qua tốc độ phản hồi (Host Response Time) và mối liên hệ với quy mô danh mục tài sản mà Host quản lý (Host Listings Count).

---

## Dashboard 4: Customer Experience (Trải nghiệm Khách hàng)
**URL:** `/experience`  
**Các Task tích hợp:** Task 1, Task 7  
**Mục tiêu:** Khai thác phản hồi thực tế của khách hàng để đánh giá chất lượng cơ sở hạ tầng và mức độ hài lòng đối với các dịch vụ thành phần.

- **Cấu hình không gian lưu trú (Task 1a - Treemap Chart):** Trực quan hóa tỷ trọng nguồn cung của các nhóm cấu hình phòng ngủ và phòng tắm phổ biến nhất trên thị trường.
- **Phân bổ chi tiết độ hài lòng (Task 1b - Jitter Plot):** Hiển thị mức độ phân tán của điểm số đánh giá (Rating) trên từng nhóm cấu hình phòng cụ thể khi người dùng tương tác (click) từ biểu đồ Treemap.
- **So sánh đánh giá giữa các quận (Task 7 - Radar Chart):** Đối chiếu đa chiều các chỉ số thành phần (độ sạch sẽ, vị trí, giao tiếp, giá trị, thủ tục check-in) nhằm tìm ra khu vực dẫn đầu về trải nghiệm trọn vẹn cho khách hàng.
