import { db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { fetchNearbyGeoapifyRestaurants } from "./geoapify/geoapify";
import { haversineDistance, kilometersToMeter, metersToLatDegrees, metersToLonDegrees } from "../utils/restaurant/geo";
import { RestaurantDraft } from "../types/models";
import { geoapifyToRestaurantDraft } from "../mappers/geoapify.mapper";

export async function fetchNearbyRestaurants(
    lat: number,
    lon: number,
    radiusKm: number = 5,
    minResults: number = 10
): Promise<RestaurantDraft[]> {
    const center = { lat, lon };
    let restaurants: RestaurantDraft[] = [];

    const radiusMeters = kilometersToMeter(radiusKm);
    const latDelta = metersToLatDegrees(radiusMeters);
    const lonDelta = metersToLonDegrees(radiusMeters, lat);

    if (restaurants.length < minResults) {
        const apiData = await fetchNearbyGeoapifyRestaurants(lat, lon, radiusKm);
        const mappedDrafts = apiData.map(geoapifyToRestaurantDraft);
        const combined = [...restaurants, ...mappedDrafts];
        restaurants = Array.from(
            new Map(combined.map(r => [dedupKey(r), r])).values()
        );
    }

    return restaurants;
}

const dedupKey = (r: RestaurantDraft) =>
    `${r.name.toLowerCase().trim()}|${r.location.lat.toFixed(6)}|${r.location.lon.toFixed(6)}`;

export function filterByDistance(
    drafts: RestaurantDraft[],
    center: { lat: number; lon: number },
    maxKm: number
) {
    const { lat, lon } = center;
    return drafts.filter(d => {
        return haversineDistance(
            lat,
            lon,
            d.location.lat,
            d.location.lon
        ) <= maxKm;
    });
}