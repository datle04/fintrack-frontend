export const getStartOfMonth = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setUTCHours(0, 0, 0, 0); 
  return start.toISOString(); 
};

export const getEndOfMonth = (date) => {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setUTCHours(23, 59, 59, 999); 
  return end.toISOString(); 
};

// 💡 Hàm Helper: Tính cuối ngày (23:59:59.999Z)
export const getEndOfDay = (dateString) => {
    const date = new Date(dateString);
    date.setUTCHours(23, 59, 59, 999);
    return date;
}

// Hàm Helper: Đảm bảo Start Date là 00:00:00.000Z
export const getStartOfDay = (dateString) => {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date;
}

export const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const present = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return { startOfYear, present };
};