import _ from 'lodash';

export const BASE_NAME = 'Table reservation';
export const APP_DEFAULT_PATH = '/';
export const ROLES = ['guest', 'merchant', 'admin'] as const;
export const STORES_TYPES = ['bistro', 'cafe', 'restaurant'] as const;
export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const DAYS_OF_WEEK_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
