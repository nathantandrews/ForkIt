import { RestaurantDraft } from "../types/models";
import { haversineDistance } from "../utils/restaurant/geo";
import { parseHoursString } from "../utils/restaurant/hours";


export function enrichRestaurantDraft(
    draft: RestaurantDraft,
    options: { centerLat: number; centerLon: number }
): RestaurantDraft {
    const { centerLat, centerLon } = options;

    // parse hours
    const openHours = 
        "openHoursRaw" in draft
            ? parseHoursString((draft as any).openHoursRaw ?? null)
            : draft.openHours;

    // compute distance from center
    const distance = haversineDistance(
        centerLat,
        centerLon,
        draft.location.lat,
        draft.location.lon
    );
    return {
        ...draft,
        openHours,
        distance,
    };
}