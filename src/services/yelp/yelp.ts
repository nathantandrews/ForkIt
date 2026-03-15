import { YelpBusiness, YelpSearchResponse } from "./yelp.types";

const YELP_KEY = process.env.EXPO_PUBLIC_YELP_KEY;
const YELP_BASE = "https://api.yelp.com/v3";

export async function fetchYelpRating(
    name: string,
    lat: number,
    lon: number
): Promise<number | undefined> {
    if (!YELP_KEY) return undefined;

    try {
        const params = new URLSearchParams({
            term: name,
            latitude: String(lat),
            longitude: String(lon),
            radius: "100",   // metres – very tight to avoid wrong matches
            limit: "1",
            categories: "restaurants",
        });

        const res = await fetch(`${YELP_BASE}/businesses/search?${params}`, {
            headers: {
                Authorization: `Bearer ${YELP_KEY}`,
            },
        });

        if (!res.ok) return undefined;

        const json: YelpSearchResponse = await res.json();
        const business = json.businesses?.[0];

        if (!business || business.review_count === 0) return undefined;

        return business.rating;
    } catch {
        return undefined;
    }
}
