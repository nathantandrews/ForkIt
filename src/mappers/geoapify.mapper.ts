import { GeoapifyRestaurant } from "../services/geoapify/geoapify.types";
import { RestaurantDraft } from "../types/models";

//maps raw Geoapify/OSM cuisine slugs to the app's canonical cuisine labels.
//Geoapify cuisine strings can be semicolon-separated and lowercase.
const CUISINE_ALIAS_MAP: Record<string, string> = {
    //American
    american: "American",
    "american_diner": "American",
    diner: "American",
    //Italian
    italian: "Italian",
    pasta: "Italian",
    //Mexican
    mexican: "Mexican",
    tex_mex: "Mexican",
    // Japanese
    japanese: "Japanese",
    ramen: "Japanese",
    // Chinese
    chinese: "Chinese",
    dim_sum: "Chinese",
    // Thai
    thai: "Thai",
    // Indian
    indian: "Indian",
    // Mediterranean
    mediterranean: "Mediterranean",
    lebanese: "Mediterranean",
    middle_eastern: "Mediterranean",
    // Greek
    greek: "Greek",
    // French
    french: "French",
    // Korean
    korean: "Korean",
    // Vietnamese
    vietnamese: "Vietnamese",
    // Burgers
    burger: "Burgers",
    burgers: "Burgers",
    "american;burger": "Burgers",
    // Pizza
    pizza: "Pizza",
    // Sushi
    sushi: "Sushi",
    // Steakhouse
    steak: "Steakhouse",
    steakhouse: "Steakhouse",
    "steak_house": "Steakhouse",
    // Seafood
    seafood: "Seafood",
    fish: "Seafood",
    // Vegan
    vegan: "Vegan",
};

//normalize a raw cuisine string from the Geoapify API into one or more
//canonical app-level cuisine labels. Handles semicolon-separated values
//(e.g. "pizza;italian") and unknown slugs (lowercased, capitalized).
function normalizeCuisines(raw: string | null | undefined): string[] {
    if (!raw) return [];
    return raw
        .split(";")
        .map(c => c.trim().toLowerCase().replace(/\s+/g, "_"))
        .flatMap(slug => {
            const mapped = CUISINE_ALIAS_MAP[slug];
            if (mapped) return [mapped];
            const fallback = slug
                .replace(/_/g, " ")
                .replace(/\b\w/g, ch => ch.toUpperCase());
            return fallback ? [fallback] : [];
        })
        .filter((c, i, arr) => arr.indexOf(c) === i); //deduplicate
}

export function geoapifyToRestaurantDraft(gr: GeoapifyRestaurant): RestaurantDraft {
    //Combine the primary cuisine field and any catering.restaurant.* categories
    const rawCuisines = [
        gr.cuisine ?? "",
        ...(gr.categories ?? [])
            .filter(c => c.startsWith("catering.restaurant."))
            .map(c => c.replace("catering.restaurant.", "")),
    ].join(";");

    const cuisines = normalizeCuisines(rawCuisines);

    return {
        name: gr.name,

        cuisines,

        location: {
            lat: gr.location.lat,
            lon: gr.location.lon,
        },

        //optional address info if available
        address: gr.address
            ? {
                street: gr.address.street ?? null,
                city: gr.address.city ?? null,
                state: gr.address.state ?? null,
                postcode: gr.address.postcode ?? null,
                country: gr.address.country?.toUpperCase() ?? null,
            }
            : undefined,

        //optional contact info if available
        contact: gr.contact
            ? {
                phone: gr.contact.phone ?? null,
                website: gr.contact.website ?? null,
            }
            : undefined,

        //parsing string hours into structured 
        //array happens later
        openHours: undefined,
        openHoursRaw: gr.hours,

        //distance is determined from session context
        distance: undefined,

        //Geoapify does not provide these data fields, 
        //we have to piece it together from other apis
        dietarySupport: undefined,
        allergens: undefined,
        rating: undefined,
        priceTier: undefined,
        avgPrice: undefined,
    };
}