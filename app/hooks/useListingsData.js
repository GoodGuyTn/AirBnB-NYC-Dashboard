'use client';
import { useState, useEffect } from 'react';
import * as d3 from 'd3';

function parseRow(d) {
  return {
    id: d.id,
    borough: d.neighbourhood_group_cleansed || 'Other',
    neighbourhood: d.neighbourhood_cleansed || d.neighbourhood_group_cleansed || 'Other',
    bedrooms: +d.bedrooms || 0,
    bathrooms: d.bathrooms_text?.toLowerCase().includes('half')
      ? 0.5
      : parseFloat(d.bathrooms_text?.match(/[\d.]+/)?.[0] || 0),
    accommodates: +d.accommodates || 0,
    price: !d.price ? 0 : parseFloat(d.price.replace(/[$,\s]/g, '')),
    rating: parseFloat(d.review_scores_rating) || null,
    superhost: ['t', 'true', 'TRUE', 'True'].includes(String(d.host_is_superhost).trim()),
  };
}

export function useListingsData() {
  const [allData, setAllData]   = useState([]);   // rows có rating (dashboard 1)
  const [rawData, setRawData]   = useState([]);   // toàn bộ rows có price (dashboard 2)
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    d3.csv('/data/listings.csv')
      .then((rows) => {
        const mapped = rows.map(parseRow).filter((d) => d.price > 0);
        setRawData(mapped);
        setAllData(mapped.filter((d) => d.rating !== null && d.rating > 0));
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { allData, rawData, loading, error };
}