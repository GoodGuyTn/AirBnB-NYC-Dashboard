'use client';
import { useState, useEffect } from 'react';
import * as d3 from 'd3';

function parseRow(d) {
  // BƯỚC 1: Khai báo biến tạm để tính toán
  const bedCount = +d.bedrooms || 0;
  const bathCount = parseFloat(d.bathrooms) || 0;

  return {
    id: d.id,
    borough: d.neighbourhood_group_cleansed || 'Other',
    neighbourhood: d.neighbourhood_cleansed || d.neighbourhood_group_cleansed || 'Other',
    bedrooms: bedCount,
    bathrooms: bathCount,
    // BƯỚC 2: Sử dụng biến tạm đã khai báo
    bedrooms_grouped: bedCount >= 4 ? '4+' : bedCount.toString(),
    bathrooms_grouped: bathCount >= 3 ? '3+' : bathCount.toString(),
    
    accommodates: +d.accommodates || 0,
    price: !d.price ? 0 : parseFloat(d.price.replace(/[$,\s]/g, '')),
    rating: parseFloat(d.review_scores_rating) || null,
    superhost: ['t', 'true', 'TRUE', 'True'].includes(String(d.host_is_superhost).trim()),
  };
}

export function useListingsData() {
  const [allData, setAllData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    d3.csv('/data/listings.csv')
      .then((rows) => {
        const mapped = rows.map(parseRow).filter((d) => d.price > 0);
        setRawData(mapped);
        // Lọc lấy dữ liệu có đánh giá để vẽ Dashboard 1
        setAllData(mapped.filter((d) => d.rating !== null && d.rating > 0));
        setLoading(false);
      })
      .catch((err) => {
        console.error("D3 Load Error:", err);
        setLoading(false);
      });
  }, []);

  return { allData, rawData, loading };
}