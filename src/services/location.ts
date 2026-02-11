import { 
    requestForegroundPermissionsAsync, 
    getCurrentPositionAsync, 
    LocationObject, 
    LocationAccuracy 
} from 'expo-location';

export async function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    // Try Expo Location first (mobile)
    if (requestForegroundPermissionsAsync && getCurrentPositionAsync) {
        try {
            const { status } = await requestForegroundPermissionsAsync();
            if (status === "granted") {
                const loc: LocationObject = await getCurrentPositionAsync({ accuracy: LocationAccuracy.Balanced });
                return {
                    lat: loc.coords.latitude,
                    lon: loc.coords.longitude,
                };
            } else {
                console.warn("Expo location permission denied, falling back to browser geolocation");
            }
        } catch (err) {
            console.warn("Expo location failed, falling back to browser geolocation", err);
        }
    }

    // Fallback to browser geolocation (desktop / unsupported)
    if (typeof navigator !== "undefined" && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        });

        return {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
        };
    }

    // Last-resort fallback
    throw new Error("Could not determine user location");
}