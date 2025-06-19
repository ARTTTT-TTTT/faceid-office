export const formatTime = (seconds: number, includeSeconds = true): string => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');

  if (!includeSeconds) {
    return `${hrs}:${mins}`;
  }

  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

export const formatThaiTime = (utcString: string): string => {
  const date = new Date(utcString);
  if (isNaN(date.getTime())) return 'Incorrect time';

  const bangkokTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const hours = String(bangkokTime.getHours()).padStart(2, '0');
  const minutes = String(bangkokTime.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};
