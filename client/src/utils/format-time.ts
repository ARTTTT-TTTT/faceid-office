export const formatTime = (utcString: string): string => {
  const date = new Date(utcString);
  if (isNaN(date.getTime())) return 'Incorrect time';

  const bangkokTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const hours = String(bangkokTime.getHours()).padStart(2, '0');
  const minutes = String(bangkokTime.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};
