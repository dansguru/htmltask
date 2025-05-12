export const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  export const calculatePercentage = (count: number, total: number): string => {
    return ((count / total) * 100).toFixed(2);
  };