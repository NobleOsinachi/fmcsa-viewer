export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const getTimestamp = (date: string) => {
  const _date = new Date(date);
  return Math.floor(_date.getTime() / 1000);
}