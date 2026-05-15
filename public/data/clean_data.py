import pandas as pd
import numpy as np
import re

def clean_airbnb_data(input_file, output_file):
    print("Đang đọc dữ liệu...")
    # Thay 'listings.csv' bằng đường dẫn file của bạn
    df = pd.read_csv(input_file, low_memory=False)
    print(f"Số lượng dòng ban đầu: {len(df)}")

    # 1. Bỏ các cột không cần thiết để giảm dung lượng file
    columns_to_drop = [
        'scrape_id', 'picture_url', 'host_url', 
        'host_thumbnail_url', 'host_picture_url', 'calendar_updated', 
        'calendar_last_scraped', 'neighborhood_overview', 'host_about'
    ]
    df.drop(columns=[c for c in columns_to_drop if c in df.columns], inplace=True)

    # 2. XỬ LÝ MISSING VALUES (NULL/BLANK) & ĐỊNH DẠNG THEO TỪNG NHÓM
    
    # 2.1 Nhóm Host (Chủ nhà)
    # host_response_rate, host_acceptance_rate: bỏ dấu % và chuyển thành số, fill bằng median
    for col in ['host_response_rate', 'host_acceptance_rate']:
        if col in df.columns:
            df[col] = df[col].astype(str).str.replace('%', '', regex=False)
            df[col] = pd.to_numeric(df[col], errors='coerce')
            df[col] = df[col].fillna(df[col].median())
            
    # host_is_superhost, host_has_profile_pic, host_identity_verified (hoặc host_identify_verified)
    bool_host_cols = ['host_is_superhost', 'host_has_profile_pic', 'host_identity_verified', 'host_identify_verified']
    for col in bool_host_cols:
        if col in df.columns:
            df[col] = df[col].replace({'t': True, 'f': False, 'True': True, 'False': False}).fillna(False).astype(bool)

    # host_listings_count, host_total_listings_count: fill bằng 1 (ít nhất có 1 listing hiện tại)
    for col in ['host_listings_count', 'host_total_listings_count']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(1)
            
    # host_neighbourhood, neighbourhood, host_verifications: fill blank = "Unknown" hoặc "None"
    if 'host_neighbourhood' in df.columns:
        df['host_neighbourhood'] = df['host_neighbourhood'].replace(r'^\s*$', np.nan, regex=True).fillna("Unknown")
    if 'neighbourhood' in df.columns:
        df['neighbourhood'] = df['neighbourhood'].replace(r'^\s*$', np.nan, regex=True).fillna("Unknown")
    if 'host_verifications' in df.columns:
        df['host_verifications'] = df['host_verifications'].replace(r'^\s*$', np.nan, regex=True).fillna("None")
        
    # host_response_time: fill blank = "Unknown"
    if 'host_response_time' in df.columns:
        df['host_response_time'] = df['host_response_time'].replace(r'^\s*$', np.nan, regex=True).fillna("Unknown")

    # 2.2 Nhóm thông tin phòng (Rooms & Beds)
    # bathrooms_text & bathrooms
    if 'bathrooms_text' in df.columns:
        # Regex lấy số (VD: 1.5, 2)
        extracted = df['bathrooms_text'].astype(str).str.extract(r'(\d+\.?\d*)')[0].astype(float)
        # Bắt trường hợp "Half-bath" = 0.5 phòng
        extracted.loc[df['bathrooms_text'].astype(str).str.contains('half', case=False, na=False)] = 0.5
        # Cập nhật vào cột bathrooms
        if 'bathrooms' not in df.columns:
            df['bathrooms'] = np.nan
        df['bathrooms'] = df['bathrooms'].fillna(extracted[0])
        df.drop(columns=['bathrooms_text'], inplace=True)
        
    # Fill null cho bathrooms, bedrooms, beds bằng median
    for col in ['bedrooms', 'beds', 'bathrooms']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            df[col] = df[col].fillna(df[col].median())

    # 2.3 Nhóm Đánh giá (Reviews)
    # Nếu chưa có review nào -> fill 0 cho tất cả score
    if 'reviews_per_month' in df.columns:
        df['reviews_per_month'] = pd.to_numeric(df['reviews_per_month'], errors='coerce').fillna(0)
    
    review_score_cols = [c for c in df.columns if c.startswith('review_scores_')]
    for col in review_score_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
    # first_review, last_review (hoặc final_review)
    for col in ['first_review', 'last_review', 'final_review']:
        if col in df.columns:
            # Đảm bảo định dạng chuẩn datetime, giá trị lỗi/trống sẽ thành NaT (Not a Time)
            # Khi xuất CSV, NaT sẽ biến thành ô trống (blank), an toàn cho JavaScript/Database
            df[col] = pd.to_datetime(df[col], errors='coerce')

    # 2.4 License
    if 'license' in df.columns:
        df['license'] = df['license'].astype(str).str.strip().str.upper() # Chuẩn hóa in hoa
        df['license'] = df['license'].replace(['NAN', 'NONE', ''], 'UNLICENSED') # Nếu rỗng -> UNLICENSED

    # 2.5 has_availability
    if 'has_availability' in df.columns:
        df['has_availability'] = df['has_availability'].replace({'t': True, 'f': False}).fillna(False).astype(bool)

    # 2.6 Xử lý text chung
    text_cols = ['name', 'description', 'host_name', 'host_location']
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].fillna("No description").str.strip()

    # 3. XỬ LÝ OUTLIERS (NGOẠI LỆ) & TÍNH TOÁN CHẶN TRÊN
    
    # 3.1 Price
    if 'price' in df.columns:
        if df['price'].dtype == 'O':
            df['price'] = df['price'].replace(r'[\$,]', '', regex=True)
        df['price'] = pd.to_numeric(df['price'], errors='coerce')
        # Xóa những dòng price = Null
        df = df.dropna(subset=['price'])
        # Lọc giá > 0
        df = df[df['price'] > 0]
        # Cắt outlier bằng Percentile 99% (Giữ lại 99% dữ liệu bình thường nhất)
        price_upper_bound = df['price'].quantile(0.99)
        # Cap giá trị: Bất kỳ cái nào > price_upper_bound sẽ bị ép về price_upper_bound hoặc xóa (ở đây chọn xóa)
        df = df[df['price'] <= price_upper_bound]
        
    # 3.2 Doanh thu ước tính (estimated_revenue_l365d)
    if 'estimated_revenue_l365d' in df.columns:
        df['estimated_revenue_l365d'] = pd.to_numeric(df['estimated_revenue_l365d'], errors='coerce').fillna(0)
        # Cắt outlier doanh thu bằng Percentile 99% tương tự
        rev_upper_bound = df['estimated_revenue_l365d'].quantile(0.99)
        df.loc[df['estimated_revenue_l365d'] > rev_upper_bound, 'estimated_revenue_l365d'] = rev_upper_bound

    # 3.3 Đêm tối thiểu / Tối đa (minimum_nights, maximum_nights)
    if 'minimum_nights' in df.columns:
        df['minimum_nights'] = pd.to_numeric(df['minimum_nights'], errors='coerce').fillna(1)
        # Bất kỳ ai yêu cầu > 365 đêm tối thiểu đều rất vô lý -> Ép về 365
        df.loc[df['minimum_nights'] > 365, 'minimum_nights'] = 365
        
    if 'maximum_nights' in df.columns:
        df['maximum_nights'] = pd.to_numeric(df['maximum_nights'], errors='coerce').fillna(365)
        # Default max stay của Airbnb trên UI là 1125 đêm (~3 năm). Nên ép về 1125 thay vì để vài nghìn
        df.loc[df['maximum_nights'] > 1125, 'maximum_nights'] = 1125
        
    if 'minimum_nights' in df.columns and 'maximum_nights' in df.columns:
        # Sửa lỗi min > max
        df.loc[df['minimum_nights'] > df['maximum_nights'], 'maximum_nights'] = df['minimum_nights']

    # 3.4 Tọa độ (Chỉ giữ trong phạm vi NYC)
    if 'latitude' in df.columns and 'longitude' in df.columns:
        df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
        df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
        df = df[(df['latitude'] >= 40.4) & (df['latitude'] <= 40.9)]
        df = df[(df['longitude'] >= -74.3) & (df['longitude'] <= -73.7)]

    # 4. Làm sạch Amenities
    if 'instant_bookable' in df.columns:
        df['instant_bookable'] = df['instant_bookable'].replace({'t': True, 'f': False}).fillna(False).astype(bool)

    if 'amenities' in df.columns:
        df['amenities'] = df['amenities'].astype(str).str.replace(r'[\[\]""]', '', regex=True)

    print(f"Số lượng dòng sau khi làm sạch: {len(df)}")
    if 'price' in df.columns:
        print(f"(Price Upper Bound 99% dùng để cắt Outlier là: ${price_upper_bound:.2f})")
    
    # 5. Lưu ra file CSV cuối cùng
    df.to_csv(output_file, index=False)
    print(f"✅ Đã lưu file sạch tại: {output_file}")

if __name__ == "__main__":
    # Thay file tương ứng với file của bạn nếu cần
    clean_airbnb_data('listings.csv', 'listings_cleaned.csv')
