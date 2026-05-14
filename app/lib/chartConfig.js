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

// Blue saturation scale for continuous values
export const blueSaturationScale = {
  low: '#E3F2FD',
  mid: '#2196F3',
  high: '#1565C0',
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
