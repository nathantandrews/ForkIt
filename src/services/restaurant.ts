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

    // @TODO need database access first

    // let restaurantsRef = collection(db, "restaurants");
    // const q = query(
    //     restaurantsRef,
    //     where("location.lat", ">=", lat - latDelta),
    //     where("location.lat", "<=", lat + latDelta),
    //     where("location.lon", ">=", lon - lonDelta),
    //     where("location.lon", ">=", lon + lonDelta),
    // );

    // const snapshot = await getDocs(q);
    // restaurants = snapshot.docs.map(doc => ({
    //     ...(doc.data() as RestaurantDraft),
    //     id: doc.id // Firestore ID
    // }));
    // restaurants = filterByDistance(restaurants, center, radiusKm);

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

/**
 * Filters a list of restaurants to only include those within a given distance
 * from a center point.
 *
 * Uses the Haversine formula to calculate the great-circle distance between
 * the restaurant and the center.
 *
 * @param drafts Array of RestaurantDraft objects to filter
 * @param center Latitude and longitude of the center point
 * @param maxKm Maximum distance (in kilometers) from the center to include
 * @returns Filtered array of RestaurantDrafts within the specified distance
 */
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