export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const getTimestamp = (date: string) => {
  const _date = new Date(date);
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
