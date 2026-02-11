import { useEffect, useState } from "react";
import { RestaurantDraft } from "../types/models";
import { fetchNearbyRestaurants } from "../services/restaurant";
import { getCurrentLocation } from "../services/location";

export function RestaurantList() {
    const [restaurants, setRestaurants] = useState<RestaurantDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                // const { lat, lon } = await getCurrentLocation(); // currently not working on my pc for some reason
                const { lat, lon } = { lat: 33.650039, lon: -117.839058 }; // coords for UCI University Town Center
                const drafts = await fetchNearbyRestaurants(lat, lon);
                setRestaurants(drafts);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Restaurants</h2>
            <ul>
                {restaurants.map((r: RestaurantDraft, i: number) => (
                    <li key={i}>
                        <strong>{r.name}</strong> <br />
                        Cuisines: {r.cuisines.join(", ") || "Unknown"} <br />
                        Address: {r.address?.street || ""}, {r.address?.city || ""} <br />
                        Phone: {r.contact?.phone || "N/A"} <br />
                        Website: {r.contact?.website || "N/A"}
                    </li>
                ))}
            </ul>
        </div>
    );
}