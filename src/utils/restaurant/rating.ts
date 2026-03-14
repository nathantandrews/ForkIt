export function parseRating(): number | undefined {
    const base = 1.5;
    const rating = (Math.random() * Math.random() * 1.75) + base;
    const finalRating = Math.min(Math.max(rating, 1), 5);
    return parseFloat(finalRating.toFixed(1));
}
