import { parse, format } from 'date-fns';

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const getTimestamp = (date: string) => {
  // const _date = new Date(date);
  // return Math.floor(_date.getTime() / 1000);

  const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
  const normalizedDate = format(parsedDate, 'yyyy-MM-dd');
  const _date = new Date(normalizedDate);
  return Math.floor(_date.getTime() / 1000);
};

export const capitalize = (str: string) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export const snake_format = (str: string) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '_')
    .replace(/[^\w_]+/g, '')
    .replace(/_+/g, '_');
};

const months: { [key: string]: number } = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export const getBarChartData = (
  records: any[],
): { month: string; count: number }[] => {
  const monthMap: { [key: string]: number } = {};

  records.forEach(record => {
    if (record['out_of_service_date']) {
      const date = new Date(record['out_of_service_date']);
      const monthName = new Intl.DateTimeFormat('en-US', {
        month: 'long',
      }).format(date);
      monthMap[monthName] = (monthMap[monthName] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthMap)
    .map(month => ({
      month,
      count: monthMap[month],
      monthIndex: months[month],
    }))
    .sort((a, b) => a.monthIndex - b.monthIndex);

  return sortedMonths;
};

export const isTableFiltered = (): boolean => {
  const defaultState = {
    columnOrder: [],
    filter: '',
    operatingStatus: '',
    entity: '',
    createdDt: '',
    modifiedDt: '',
    rowsPerPage: 10,
    page: 0,
    sortingState: [],
  };

  const savedState = JSON.parse(localStorage.getItem('tableState') || '{}');

  // Compare each part of the state to see if anything has been modified
  return (
    JSON.stringify(savedState.columnOrder || defaultState.columnOrder) !==
      JSON.stringify(defaultState.columnOrder) ||
    JSON.stringify(savedState.sortingState || defaultState.sortingState) !==
      JSON.stringify(defaultState.sortingState) ||
    savedState.filter !== defaultState.filter ||
    savedState.operatingStatus !== defaultState.operatingStatus ||
    savedState.entity !== defaultState.entity ||
    savedState.createdDt !== defaultState.createdDt ||
    savedState.modifiedDt !== defaultState.modifiedDt ||
    savedState.rowsPerPage !== defaultState.rowsPerPage ||
    savedState.page !== defaultState.page
  );
};

export const loadTableStateFromLocalStorage = () => {
  const state = localStorage.getItem('tableState');
  return state ? JSON.parse(state) : null;
};
