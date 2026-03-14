export function metersToLatDegrees(meters: number): number {
    return meters / 111000;
}

export function metersToLonDegrees(meters: number, latitude: number): number {
    return meters / (111000 * Math.cos(latitude * (Math.PI / 180)));
}

export function metersToKm(meters: number) {
    return meters / 1000;
}

export function kilometersToMeter(km: number) {
    return km * 1000;
}

export function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const R = 6371; // Earth's radius in kilometers

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}
