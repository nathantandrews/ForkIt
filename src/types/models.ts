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
    displayName?: string;
    profile: UserProfile;
}

export interface SessionMember {
    uid: string;
    joinedAt: number;
    profileSnapshot: UserProfile;
    displayName?: string;
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

export interface Restaurant {
    id: string;
    name: string;
    cuisines: string[];
    priceTier: 1 | 2 | 3 | 4;
    avgPrice?: number;
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
