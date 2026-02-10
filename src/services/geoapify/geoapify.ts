import { GeoapifyRestaurant } from "./geoapify.types";

const GEOAPIFY_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_KEY;

export async function fetchNearbyRestaurants(
    lat: number,
    lon: number,
    gridsize = 1, // how many more api queries in each direction
    stepMeters = 400 // the spacing between queries in meters (radius of query is 500)
): Promise<GeoapifyRestaurant[]> {
    const offsets = generateOffsets(lat, lon, gridsize, stepMeters);
    const results: GeoapifyRestaurant[] = [];
    for (const point of offsets) {
        const url =
            `https://api.geoapify.com/v2/place-details?` +
            `lat=${point.lat}&` +
            `lon=${point.lon}&` +
            `features=radius_500.restaurant,details,radius_500&` +
            `apiKey=${GEOAPIFY_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Geoapify request failed");
        const json = await res.json();
        const normalized = json.features.map(normalizePlace);
        results.push(...normalized);
    }

    // deduplicate results
    const uniqueResults = Array.from(
        new Map(results.map(r => [r.id, r])).values()
    );
    return uniqueResults;
}

function generateOffsets(lat: number, lon: number, gridSize = 1, stepMeters = 400) {
    const latStep = stepMeters / 111000; // convert meters to degrees
    const lonStep = stepMeters / (111000 * Math.cos((lat * Math.PI) / 180));

    const offsets: { lat: number; lon: number }[] = [];

    for (let i = -gridSize; i <= gridSize; i++) {
        for (let j = -gridSize; j <= gridSize; j++) {
            offsets.push({ lat: lat + i * latStep, lon: lon + j * lonStep });
        }
    }

    return offsets;
}

function normalizePlace(feature: any): GeoapifyRestaurant {
    const p = feature.properties;

    return {
        id: p.place_id,
        name: p.name,
        cuisine: p.catering?.cuisine ?? null,
        categories: (p.categories ?? []).filter((c: string) =>
            c.startsWith("catering.restaurant")
        ),
        location: {
            lat: p.lat,
            lon: p.lon,
        },
        address: {
            street: [p.housenumber, p.street].filter(Boolean).join(" "),
            city: p.city,
            state: p.state_code,
            postcode: p.postcode,
            country: p.country_code?.toUpperCase(),
        },
        contact: {
            phone: p.contact?.phone ?? null,
            website: p.website ?? null,
        },
        hours: p.opening_hours ?? null,
    };
}
