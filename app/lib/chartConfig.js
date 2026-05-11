import * as d3 from 'd3';

export const COLOR_MIN = 3.5;
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