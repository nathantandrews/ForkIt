export function parseRating(): number | undefined {
    const rating = 3.5 + Math.random() * 1.5;
    const finalRating = Math.min(Math.max(rating, 3.5), 5);
    return parseFloat(finalRating.toFixed(1));
}
