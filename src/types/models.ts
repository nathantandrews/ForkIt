export interface DietaryRestrictions {
    allergies: string[];
    dietary: string[]; // "vegan", "gluten-free", etc.
    hardMaxBudget?: number;
    hardMaxDistance?: number;
}

export interface SoftPreferences {
    likedCuisines: string[];
    dislikedCuisines: string[];
    targetPrice?: number; // 1-4 tier or dollars
    distancePreference?: "near" | "balanced" | "far";
}

export interface Weights {
    cuisine: number; // 1-5
    price: number;
    distance: number;
}

export interface UserProfile {
    hard: DietaryRestrictions;
    soft: SoftPreferences;
    weights: Weights;
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
    createdAt: number;
    updatedAt: number;
    profile: UserProfile;
}

export interface SessionMember {
    uid: string;
    joinedAt: number;
    profileSnapshot: UserProfile;
    displayName: string;
}

export interface SessionContext {
    timeOfDay: "breakfast" | "lunch" | "dinner" | "late";
    now: number; // timestamp
    location: {
        lat: number;
        lng: number;
    };
}

export interface Session {
    id: string;
    code: string;
    hostUid: string;
    status: "open" | "finalized";
    context: SessionContext;
    memberUids: string[];
    finalizedRestaurantId?: string;
}

export type RestaurantDraft = {
    name: string;
    cuisines: string[];
    location: {
        lat: number;
        lon: number;
    };
    priceTier?: 1 | 2 | 3 | 4;
    avgPrice?: number;
    distance?: number;
    openHours?: Array<{
        days: number[];
        start: string;
        end: string;
    }>;
    openHoursRaw?: string | null;

    dietarySupport?: {
        veganFriendly: boolean;
        glutenFreeOptions: boolean;
        halalOptions: boolean;
        vegetarianFriendly: boolean;
    };

    allergens?: string[];
    rating?: number;
    
    address?: {
        street: string;
        city?: string | null;
        state?: string | null;
        postcode?: string | null;
        country?: string | null;
    };
    contact?: {
        phone?: string | null;
        website?: string | null;
    };
}

export interface Restaurant {
    id: string;
    name: string;
    cuisines: string[];
    priceTier: 1 | 2 | 3 | 4;
    avgPrice?: number;
    location: {
        lat: number;
        lon: number;
    }
    distance: number; // relative to group center provided in context
    openHours: Array<{
        days: number[]; // 0=Sun, 6=Sat
        start: string; // "09:00"
        end: string;   // "22:00"
    }>;
    dietarySupport: {
        veganFriendly: boolean;
        glutenFreeOptions: boolean;
        halalOptions: boolean;
        vegetarianFriendly: boolean;
    };
    allergens: string[];
    rating?: number;

    address: {
        street: string;
        city?: string | null;
        state?: string | null;
        postcode?: string | null;
        country?: string | null;
    };
    contact?: {
        phone?: string | null; // "+1 234-567-8910"
        website?: string | null;
    };
}

export interface Vote {
    restaurantId: string;
    approvals: string[]; // uids
    vetoes: string[];    // uids
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
