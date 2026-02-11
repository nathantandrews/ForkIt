import { kilometersToMeter, metersToLatDegrees, metersToLonDegrees } from "../../utils/restaurant/geo";
import { GeoapifyRestaurant } from "./geoapify.types";

const GEOAPIFY_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_KEY;

export async function fetchNearbyGeoapifyRestaurants(
    lat: number,
    lon: number,
    radiusKm: number
): Promise<GeoapifyRestaurant[]> {
    const queryRadiusMeters: 500 | 1000 = 1000; // only two radii sizes available for geoapify
    const radiusMeters = kilometersToMeter(radiusKm);
    const gridSize = Math.ceil(radiusMeters / queryRadiusMeters);
    const stepMeters = queryRadiusMeters * Math.SQRT1_2;
    const offsets = generateOffsets(lat, lon, gridSize, stepMeters);
    const results: GeoapifyRestaurant[] = [];
    for (const point of offsets) {
        const url =
            `https://api.geoapify.com/v2/place-details?` +
            `lat=${point.lat}&` +
            `lon=${point.lon}&` +
            `features=radius_${queryRadiusMeters}.restaurant,` + 
            `details,radius_${queryRadiusMeters}&` +
            `apiKey=${GEOAPIFY_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Geoapify request failed");
        const json = await res.json();
        const normalized = json.features
            .filter(isRestaurant)
            .map(normalizeRestaurant);
        results.push(...normalized);
    }

    // deduplicate results
    const uniqueResults = Array.from(
        new Map(results.map(r => [r.id, r])).values()
    );
    return uniqueResults;
}

function generateOffsets(lat: number, lon: number, gridSize = 1, stepMeters = 400) {
    const latStep = metersToLatDegrees(stepMeters);
    const lonStep = metersToLonDegrees(stepMeters, lat);

    const offsets: { lat: number; lon: number }[] = [];

    for (let i = -gridSize; i <= gridSize; i++) {
        for (let j = -gridSize; j <= gridSize; j++) {
            offsets.push({ lat: lat + i * latStep, lon: lon + j * lonStep });
        }
    }

    return offsets;
}

function isRestaurant(feature: any): boolean {
    const p = feature.properties;
    if (
        !p.name || 
        p.name.trim() === "" ||
        !p.catering?.cuisine
    ) { 
        return false; 
    }
    return true;
}

function normalizeRestaurant(restaurant: any): GeoapifyRestaurant {
    const p = restaurant.properties;

    return {
        id: p.place_id,
        name: p.name,
        cuisine: p.catering?.cuisine ?? null,
        categories: (p.categories ?? []).filter((c: string) =>
            !c.startsWith("catering.restaurant")
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
