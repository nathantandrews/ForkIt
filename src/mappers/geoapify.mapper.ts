import { GeoapifyRestaurant } from "../services/geoapify/geoapify.types";
import { RestaurantDraft } from "../types/models";

export function geoapifyToRestaurantDraft(gr: GeoapifyRestaurant): RestaurantDraft {
    const cuisines = Array.from(
    new Set(
            [
                ...(gr.cuisine ? [gr.cuisine] : []),
                ...(gr.categories ?? [])
                    .filter(c => c.startsWith("catering.restaurant"))
                    .map(c => c.replace("catering.restaurant.", ""))
            ]
            .map(c => c.toLowerCase().trim())
        )
    );

    return {
        name: gr.name,

        cuisines: cuisines,

        location: {
            lat: gr.location.lat,
            lon: gr.location.lon,
        },

        // Optional address info if available
        address: gr.address
            ? {
                  street: gr.address.street ?? null,
                  city: gr.address.city ?? null,
                  state: gr.address.state ?? null,
                  postcode: gr.address.postcode ?? null,
                  country: gr.address.country?.toUpperCase() ?? null,
              }
            : undefined,

        // Optional contact info if available
        contact: gr.contact
            ? {
                  phone: gr.contact.phone ?? null,
                  website: gr.contact.website ?? null,
              }
            : undefined,
        
        // parsing string hours into structured 
        // array happens later
        openHours: undefined,
        openHoursRaw: gr.hours,
        
        // distance is determined from session context
        distance: undefined,
        
        // Geoapify does not provide these data fields, 
        // we have to piece it together from other apis
        dietarySupport: undefined,
        allergens: undefined,
        rating: undefined,
        priceTier: undefined,
        avgPrice: undefined,
    };
}