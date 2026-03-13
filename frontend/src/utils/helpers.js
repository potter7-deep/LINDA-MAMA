/**
 * Linda Mama - Utility Functions
 * Common helper functions used across the application
 */

// Date formatting utilities
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(dateString).toLocaleDateString('en-US', defaultOptions);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateString);
};

// Pregnancy related utilities
export const getPregnancyWeek = (dueDate) => {
  if (!dueDate) return null;
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Average pregnancy is 280 days (40 weeks)
  const daysPregnant = 280 - diffDays;
  const weeks = Math.floor(daysPregnant / 7);
  
  return {
    weeks: Math.max(1, Math.min(40, weeks)),
    days: daysPregnant % 7,
    daysRemaining: diffDays
  };
};

export const getPregnancyTrimester = (weeks) => {
  if (weeks <= 12) return 1;
  if (weeks <= 26) return 2;
  return 3;
};

export const getPregnancyMilestones = (weeks) => {
  const milestones = {
    4: 'Baby is the size of a poppy seed',
    8: 'Baby can make manual movements',
    12: 'All major organs are formed',
    16: 'Baby can hear your voice',
    20: 'Halfway through pregnancy!',
    24: 'Baby can respond to sounds',
    28: 'Baby can dream',
    32: 'Baby is practicing breathing',
    36: 'Baby is gaining weight rapidly',
    40: 'Full term - ready to meet baby!'
  };
  
  // Find the closest milestone
  const milestoneWeeks = Object.keys(milestones).map(Number).sort((a, b) => a - b);
  const closest = milestoneWeeks.reduce((prev, curr) => 
    Math.abs(curr - weeks) < Math.abs(prev - weeks) ? curr : prev
  );
  
  return {
    week: closest,
    description: milestones[closest]
  };
};

// Severity and status helpers
export const getSeverityColor = (severity) => {
  const colors = {
    low: 'bg-success-100 text-success-700',
    medium: 'bg-warning-100 text-warning-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-danger-100 text-danger-700'
  };
  return colors[severity] || colors.low;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-warning-100 text-warning-700',
    acknowledged: 'bg-info-100 text-info-700',
    resolved: 'bg-success-100 text-success-700',
    active: 'bg-danger-100 text-danger-700',
    completed: 'bg-success-100 text-success-700'
  };
  return colors[status] || colors.pending;
};

// Validation helpers
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-()]{10,}$/;
  return re.test(phone);
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// String helpers
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, '');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Object helpers
export const parseJson = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Array helpers
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

export const sortByDate = (array, key = 'createdAt', order = 'desc') => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};

// Number formatting
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatWeight = (kg) => {
  if (!kg) return 'N/A';
  return `${kg} kg`;
};

export const formatBloodPressure = (bp) => {
  if (!bp) return 'Not recorded';
  return bp;
};

