import { requestForegroundPermissionsAsync, getCurrentPositionAsync, LocationObject, LocationAccuracy } from 'expo-location';

export async function getCurrentLocation(): Promise<LocationObject> {

    let { status } = await requestForegroundPermissionsAsync();
    if (status !== "granted") {
        throw new Error("Permission to access location was denied");
    }

    return await getCurrentPositionAsync({accuracy : LocationAccuracy.Balanced});
}