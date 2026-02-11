/**
 * approximate conversion from meters to latitude degrees
 * 
 * @param meters amount of meters to convert
 * @returns approximate latitude degrees
 */
export function metersToLatDegrees(meters: number): number {
    return meters / 111000;
}

/**
 * approximate conversion from meters to longitude degrees
 * 
 * @param meters amount of meters to convert
 * @returns approximate longitude degrees
 */
export function metersToLonDegrees(meters: number, latitude: number): number {
    return meters / (111000 * Math.cos(latitude * (Math.PI / 180)));
}

/**
 * approximate conversion from kilometers to meters
 * 
 * @param meters amount of meters to convert
 * @returns kilometers
 */
export function metersToKm(meters: number) {
    return meters / 1000;
}

/**
 * conversion from kilometers to meters
 * 
 * @param km amount of km to convert
 * @returns meters
 */
export function kilometersToMeter(km: number) {
    return km * 1000;
}

/**
 * Computes the great-circle distance between two points
 * on Earth using the Haversine formula.
 *
 * @returns distance in kilometers
 */
export function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const R = 6371; // Earth's radius in kilometers

    const lat1Rad = toRad(lat1);
    const lon1Rad = toRad(lat2);
    const lat2Rad = toRad(lat2 - lat1);
    const lon2Rad = toRad(lon2 - lon1);

    const a =
        Math.sin(lat2Rad / 2) ** 2 +
        Math.cos(lat1Rad) * Math.cos(lon1Rad) *
        Math.sin(lon2Rad / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
