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

export const getBarChartData = (
  records: any[],
): { month: string; count: number }[] => {
  const monthMap: { [key: string]: number } = {};

  records.forEach(record => {
    if (record['out_of_service_date']) {
      const date = new Date(record['out_of_service_date']);
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
      monthMap[monthName] = (monthMap[monthName] || 0) + 1;
    }
  });

  return Object.keys(monthMap).map(month => ({
    month,
    count: monthMap[month],
  }));
};
