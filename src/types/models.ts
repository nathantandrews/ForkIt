export interface UserProfile {
    id?: string;
    displayName?: string;
    hard: HardConstraints;
    soft: SoftPreferences;
    weights: PreferenceWeights;
}

export interface HardConstraints {
    allergies: string[];
    dietary: string[];
    hardMaxDistance?: number;
    hardMaxBudget?: number;
}

export interface SoftPreferences {
    likedCuisines: string[];
    dislikedCuisines: string[];
    targetPrice: number[]; // Array of preferred price tiers
    // removed distancePreference
}

export interface PreferenceWeights {
    cuisine: number; // 1-10
    price: number;   // 1-10
    distance: number; // 1-10
}

export interface Restaurant {
    id: string;
    name: string;
    cuisines: string[];
    priceTier: 1 | 2 | 3 | 4;
    rating: number;
    location: { lat: number, lng: number, address: string };
    openHours: { days: number[], start: string, end: string }[];
    dietarySupport: {
        veganFriendly: boolean;
        vegetarianFriendly: boolean;
        glutenFreeOptions: boolean;
        halalOptions: boolean;
    };
    allergens: string[];
    image?: string;
}

export interface Session {
    id: string;
    hostUid: string;
    status: 'lobby' | 'active' | 'finalized';
    code: string;
    context: SessionContext;
    finalizedRestaurantId?: string;
}

export interface SessionContext {
    location: { lat: number, lng: number };
    radius: number; // in meters
    now: number; // timestamp
}

export interface SessionMember {
    uid: string;
    displayName: string;
    status: 'joined' | 'ready';
    profileSnapshot: UserProfile;
}

export interface Vote {
    restaurantId: string;
    approvals: string[];
    vetoes: string[];
}

export interface RecommendationResult {
    restaurant: Restaurant;
    score: number;
    breakdown: {
        hardPass: boolean;
        cuisineScore: number;
        priceScore: number;
        distanceScore: number;
        consensusBonus: number;
        ratingBonus: number;
    };
    explanation: string;
}