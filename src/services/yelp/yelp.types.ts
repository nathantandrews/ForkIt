export type YelpBusiness = {
    id: string;
    name: string;
    rating: number;       // 1.0 – 5.0, in 0.5 steps
    review_count: number;
    coordinates: {
        latitude: number;
        longitude: number;
    };
};

export type YelpSearchResponse = {
    businesses: YelpBusiness[];
    total: number;
};
