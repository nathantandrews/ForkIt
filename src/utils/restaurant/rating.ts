const FALLBACK_RATING = 4.0;

export function parseRating(realRating?: number): number {
    if (realRating !== undefined) return realRating;
    return FALLBACK_RATING;
}
