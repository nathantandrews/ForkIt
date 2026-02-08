export type GeoapifyPlace = {
    id: string;
    name: string;
    cuisine: string | null;
    categories: string[];
    location: {
        lat: number;
        lon: number;
    };
    address: {
        street: string;
        city: string | null;
        state: string | null;
        postcode: string | null;
        country: string | null;
    };
    contact: {
        phone: string | null;
        website: string | null;
    };
    hours: string | null;
};