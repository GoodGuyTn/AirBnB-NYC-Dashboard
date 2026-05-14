import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const csvFilePath = path.normalize(
  'C:\\Users\\duc20\\OneDrive\\Desktop\\y3t2\\trực quan hóa DL\\data đã làm sạch\\listings_cleaned.csv'
);

// Hàm đọc CSV file
function readCSVFile() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Hàm xử lý dữ liệu cho Phân tích uy tín chủ nhà (Task 1 - Scatter Plot)
export async function fetchHostReputationData() {
  try {
    const allData = await readCSVFile();
    
    // Lọc và transform dữ liệu
    const reputationData = allData
      .filter((row) => {
        // Chỉ lấy dữ liệu có số reviews và rating hợp lệ
        const reviews = parseInt(row.number_of_reviews) || 0;
        const rating = parseFloat(row.review_scores_rating) || 0;
        return reviews > 0 && rating > 0;
      })
      .map((row, index) => ({
        id: index,
        host_id: parseInt(row.host_id) || 0,
        host_name: row.host_name || 'Unknown',
        number_of_reviews: parseInt(row.number_of_reviews) || 0,
        review_scores_rating: parseFloat(row.review_scores_rating) || 0,
      }))
      .sort((a, b) => b.review_scores_rating - a.review_scores_rating)
      .slice(0, 100); // Giới hạn 100 hosts để biểu đồ dễ đọc

    return reputationData;
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu Reputation:', error);
    return [];
  }
}

// Hàm xử lý dữ liệu cho Phân tích mức độ chuyên nghiệp (Task 2 - Grouped Bar Chart)
export async function fetchHostProfessionalismData() {
  try {
    const allData = await readCSVFile();

    // Nhóm dữ liệu theo host_response_time
    const groupedData = {};

    allData.forEach((row) => {
      const responseTime = row.host_response_time || 'Unknown';
      const listingsCount = parseFloat(row.host_listings_count) || 0;

      if (!groupedData[responseTime]) {
        groupedData[responseTime] = {
          host_response_time: responseTime,
          totalListings: 0,
          host_count: 0,
        };
      }

      groupedData[responseTime].totalListings += listingsCount;
      groupedData[responseTime].host_count += 1;
    });

    // Transform dữ liệu nhóm
    const professionalismData = Object.values(groupedData)
      .map((group) => ({
        host_response_time: group.host_response_time,
        avg_listings_count: parseFloat(
          (group.totalListings / group.host_count).toFixed(2)
        ),
        host_count: group.host_count,
      }))
      .sort((a, b) => {
        // Sắp xếp theo thứ tự thời gian phản hồi logic
        const order = {
          'within an hour': 1,
          'within a few hours': 2,
          'within a day': 3,
          'a few days or more': 4,
          Unknown: 5,
        };
        return (order[a.host_response_time] || 99) - (order[b.host_response_time] || 99);
      });

    return professionalismData;
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu Professionalism:', error);
    return [];
  }
}
