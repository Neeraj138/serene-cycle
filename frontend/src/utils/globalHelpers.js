// Utility function to convert date object to Unix timestamp
export const convertDateToUnix = (dateObj) => {
    const { year, month, date } = dateObj;
    const dateTime = new Date(year, month - 1, date); // month is zero-based
  
    const startTime = Math.floor(dateTime.setHours(0, 0, 0, 0) / 1000); // Start of the day (Unix timestamp)
    const endTime = Math.floor(dateTime.setHours(23, 59, 59, 999) / 1000); // End of the day (Unix timestamp)
  
    return { startTime, endTime };
};