  export const categoryList = [
    { key: "sales", icon: "🛍️", color: "#f87171" }, // đỏ hồng
    { key: "transportation", icon: "🚗", color: "#60a5fa" }, // xanh dương nhạt
    { key: "education", icon: "📚", color: "#fbbf24" }, // vàng
    { key: "entertainment", icon: "🎮", color: "#a78bfa" }, // tím nhạt
    { key: "shopping", icon: "🛒", color: "#fb923c" }, // cam sáng
    { key: "housing", icon: "🏠", color: "#34d399" }, // xanh lá nhạt
    { key: "health", icon: "🩺", color: "#ef4444" }, // đỏ
    { key: "travel", icon: "✈️", color: "#f18371" },
    { key: "rent", icon: "🏘️", color: "#4ade80" }, // xanh lá sáng
    { key: "bonus", icon: "🎁", color: "#facc15" }, // vàng sáng
    { key: "salary", icon: "💰", color: "#22c55e" }, // xanh lá cây
    { key: "food", icon: "🍽️", color: "#c084fc" }, // tím
    { key: "investment", icon: "📈", color: "#0ea5e9" }, // xanh cyan
    { key: "saving", icon: "🐖", color: "#FFB6C1" },
    { key: "other", icon: "🏳️", color: "#808080" },
  ];

  export const getCategoryMeta = (key) =>
    categoryList.find((c) => c.key === key) || {};