'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as d3 from 'd3';

const ListingsDataContext = createContext(null);

function parseRow(d) {
  const bedCount = +d.bedrooms || 0;
  const bathCount = d.bathrooms_text?.toLowerCase().includes('half')
    ? 0.5
    : parseFloat(d.bathrooms_text?.match(/[\d.]+/)?.[0] || d.bathrooms || 0);

  return {
    id: d.id,
    host_id: parseInt(d.host_id) || 0,
    host_name: d.host_name || 'Unknown',
    borough: d.neighbourhood_group_cleansed || 'Other',
    neighbourhood: d.neighbourhood_cleansed || d.neighbourhood_group_cleansed || 'Other',
    room_type: d.room_type || 'Unknown',
    bedrooms: bedCount,
    bathrooms: bathCount,
    bedrooms_grouped: bedCount >= 4 ? '4+' : bedCount.toString(),
    bathrooms_grouped: bathCount >= 3 ? '3+' : bathCount.toString(),
    minimum_nights: +d.minimum_nights || 1,
    accommodates: +d.accommodates || 0,
    price: !d.price ? 0 : parseFloat(d.price.replace(/[$,\s]/g, '')),
    number_of_reviews: parseInt(d.number_of_reviews) || 0,
    review_scores_rating: parseFloat(d.review_scores_rating) || null,
    review_scores_accuracy: parseFloat(d.review_scores_accuracy) || null,
    review_scores_cleanliness: parseFloat(d.review_scores_cleanliness) || null,
    review_scores_checkin: parseFloat(d.review_scores_checkin) || null,
    review_scores_communication: parseFloat(d.review_scores_communication) || null,
    review_scores_location: parseFloat(d.review_scores_location) || null,
    review_scores_value: parseFloat(d.review_scores_value) || null,
    rating: parseFloat(d.review_scores_rating) || null,
    superhost: ['t', 'true', 'TRUE', 'True'].includes(String(d.host_is_superhost).trim()),
    host_response_time: d.host_response_time || 'Unknown',
    host_listings_count: parseFloat(d.host_listings_count) || 0,
  };
}

export function ListingsDataProvider({ children }) {
  const [allData, setAllData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [scoreData, setScoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    d3.csv('/data/listings.csv')
      .then((rows) => {
        const mapped = rows.map(parseRow).filter((item) => item.price > 0);
        setRawData(mapped);
        setAllData(mapped.filter((item) => item.rating !== null && item.rating > 0));
        setScoreData(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error('D3 Load Error:', err);
        setError(err);
        setLoading(false);
      });
  }, []);

  const value = useMemo(
    () => ({ allData, rawData, scoreData, loading, error }),
    [allData, rawData, scoreData, loading, error]
  );

  return <ListingsDataContext.Provider value={value}>{children}</ListingsDataContext.Provider>;
}

export function useListingsData() {
  const context = useContext(ListingsDataContext);
  if (!context) {
    throw new Error('useListingsData must be used within ListingsDataProvider');
  }
  return context;
}
