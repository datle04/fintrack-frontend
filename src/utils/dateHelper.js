export const getStartOfMonth = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setUTCHours(0, 0, 0, 0); // Set to UTC start of day
  return start.toISOString(); // Or return Date object if your API accepts it
};

export const getEndOfMonth = (date) => {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setUTCHours(23, 59, 59, 999); // Set to UTC end of day
  return end.toISOString(); // Or return Date object if your API accepts it
};

// 💡 Hàm Helper: Tính cuối ngày (23:59:59.999Z)
export const getEndOfDay = (dateString) => {
    // Tạo đối tượng Date mới từ chuỗi ngày (sẽ mặc định là 00:00:00Z)
    const date = new Date(dateString);
    // Đặt giờ/phút/giây/mili giây sang cuối ngày UTC (để lấy hết dữ liệu của ngày đó)
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