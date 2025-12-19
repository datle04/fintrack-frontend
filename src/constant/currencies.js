export const currencyMap = new Map(
    [
        ["VND", "₫ - Việt Nam Đồng"],
        ["USD", "$ - US Dollar"],
        ["EUR", "€ - Euro"],
        ["JPY", "¥ - Japanese Yen"],
        ["KRW", "₩ - South Korean Won"],
        ["SGD", "S$ - Singapore Dollar"]
    ]
);

export const getCurrencySymbol = (currency) => {
    const result = currencyMap.get(currency);
    return result.split("-")[0];
}