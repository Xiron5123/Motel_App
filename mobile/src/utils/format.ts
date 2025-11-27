export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

export const formatPriceShort = (amount: number): string => {
    if (amount >= 1000000) {
        const millions = amount / 1000000;
        return `${millions % 1 === 0 ? millions : millions.toFixed(1)} triệu/tháng`;
    }
    return formatCurrency(amount) + '/tháng';
};

export const formatNumber = (num: string): string => {
    return num.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
