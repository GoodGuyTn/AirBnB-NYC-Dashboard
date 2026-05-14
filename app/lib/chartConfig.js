import * as d3 from 'd3';

export const COLOR_MIN = 0.0;
export const COLOR_MAX = 5.0;

// Sử dụng interpolateBlues nhưng nén dải nồng độ để điểm 5.0 tối hơn hẳn
export const blueInterpolator = d3.interpolateBlues;

export const colorScale = d3
  .scalePow()
  .exponent(1.5) // Tăng độ dốc để màu đậm nhanh hơn ở vùng điểm cao
  .domain([COLOR_MIN, COLOR_MAX])
  .range([0.1, 1]); 

export const blueSaturationScale = (rating) => blueInterpolator(colorScale(rating));

export const SUPERHOST_COLOR   = '#0ea5e9'; // sky-500 — sáng, light theme
export const NONSUPERHOST_COLOR = '#f43f5e'; // rose-500

export const SCORE_FIELDS = [
  'review_scores_rating',
  'review_scores_accuracy',
  'review_scores_cleanliness',
  'review_scores_checkin',
  'review_scores_communication',
  'review_scores_location',
  'review_scores_value',
];

export const SCORE_LABELS = {
  review_scores_rating:       'Overall',
  review_scores_accuracy:     'Accuracy',
  review_scores_cleanliness:  'Cleanliness',
  review_scores_checkin:      'Check-in',
  review_scores_communication:'Communication',
  review_scores_location:     'Location',
  review_scores_value:        'Value',
};

// Color schemes and configurations for charts
export const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

export const ROOM_TYPES = ['Entire home/apt', 'Private room', 'Shared room', 'Hotel room'];

// Color palettes
export const ROOM_TYPE_COLORS = {
  'Entire home/apt': '#3b82f6',  // Blue
  'Private room': '#10b981',      // Green
  'Shared room': '#f59e0b',       // Amber
  'Hotel room': '#8b5cf6',        // Purple
};

export const BOROUGH_COLORS = {
  'Manhattan': '#ef4444',      // Red
  'Brooklyn': '#3b82f6',       // Blue
  'Queens': '#10b981',         // Green
  'Bronx': '#f59e0b',          // Amber
  'Staten Island': '#8b5cf6',  // Purple
};

// Chart dimensions and margins
export const CHART_DIMENSIONS = {
  margin: { top: 36, right: 20, bottom: 48, left: 44 },
  height: 420,
};

// Tooltip styles
export const TOOLTIP_STYLES = {
  position: 'fixed',
  pointerEvents: 'none',
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '12px',
  color: '#0f172a',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  zIndex: 100,
};

// Format functions
export const formatPrice = (price) => {
  if (!price) return '$0';
  return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString('en-US');
};

export const formatPercentage = (value) => {
  return (value * 100).toFixed(1) + '%';
};
