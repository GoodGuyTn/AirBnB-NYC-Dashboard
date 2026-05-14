'use client';
import { useState, useEffect } from 'react';
import * as d3 from 'd3';

function parseRow(d) {
  // BƯỚC 1: Khai báo biến tạm để tính toán
  const bedCount = +d.bedrooms || 0;
  const bathCount = d.bathrooms_text?.toLowerCase().includes('half')
      ? 0.5
      : parseFloat(d.bathrooms_text?.match(/[\d.]+/)?.[0] || d.bathrooms || 0);

  return {
    id: d.id,
    borough: d.neighbourhood_group_cleansed || 'Other',
    neighbourhood: d.neighbourhood_cleansed || d.neighbourhood_group_cleansed || 'Other',
    room_type: d.room_type || 'Unknown',
    bedrooms: bedCount,
    bathrooms: bathCount,
    // BƯỚC 2: Sử dụng biến tạm đã khai báo
    bedrooms_grouped: bedCount >= 4 ? '4+' : bedCount.toString(),
    bathrooms_grouped: bathCount >= 3 ? '3+' : bathCount.toString(),
    minimum_nights: +d.minimum_nights || 1,
    accommodates: +d.accommodates || 0,
    price: !d.price ? 0 : parseFloat(d.price.replace(/[$,\s]/g, '')),
    review_scores_rating: parseFloat(d.review_scores_rating) || null,
    review_scores_accuracy: parseFloat(d.review_scores_accuracy) || null,
    review_scores_cleanliness: parseFloat(d.review_scores_cleanliness) || null,
    review_scores_checkin: parseFloat(d.review_scores_checkin) || null,
    review_scores_communication: parseFloat(d.review_scores_communication) || null,
    review_scores_location: parseFloat(d.review_scores_location) || null,
    review_scores_value: parseFloat(d.review_scores_value) || null,
    rating: parseFloat(d.review_scores_rating) || null,
    superhost: ['t', 'true', 'TRUE', 'True'].includes(String(d.host_is_superhost).trim()),
  };
}

export function useListingsData() {
  const [allData, setAllData]   = useState([]);   // rows có rating (dashboard 1)
  const [rawData, setRawData]   = useState([]);   // toàn bộ rows có price (dashboard 2)
  const [scoreData, setScoreData] = useState([]); // rows có ít nhất 1 review score (radar chart)
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    d3.csv('/data/listings.csv')
      .then((rows) => {
        const mapped = rows.map(parseRow).filter((d) => d.price > 0);
        setRawData(mapped);
        // Lọc lấy dữ liệu có đánh giá để vẽ Dashboard 1
        setAllData(mapped.filter((d) => d.rating !== null && d.rating > 0));
        // Dữ liệu cho radar chart: tất cả bản ghi có price > 0 (tính trung bình từng trường riêng lẻ)
        setScoreData(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("D3 Load Error:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return { allData, rawData, scoreData, loading, error };
}