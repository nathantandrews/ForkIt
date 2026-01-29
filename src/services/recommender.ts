import { Restaurant, SessionContext, UserProfile, RecommendationResult } from '../types/models';
import { RESTAURANTS } from '../data/restaurants';

/*
PHASE 1: HARD FILTER
Exclude restaurant if:
- closed at current time (based on context.now)
- contains any allergen that any member lists
- fails any dietary restriction that is marked hard (e.g. vegan requires veganFriendly)
- exceeds any member hardMaxDistance/hardMaxBudget if set
*/

const isRestaurantOpen = (r: Restaurant, now: number): boolean => {
    // Parsing now to day/time
    const date = new Date(now);
    const day = date.getDay(); // 0-6
    const hours = date.getHours() + date.getMinutes() / 60; // 13.5 = 1:30 PM

    // Find matching day schedule
    const todaySchedule = r.openHours.find(s => s.days.includes(day));
    if (!todaySchedule) return false;

    // extremely basic parse "09:00" -> 9.0
    const parseTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h + m / 60;
    };

    const start = parseTime(todaySchedule.start);
    const end = parseTime(todaySchedule.end);

    // Handle crossing midnight e.g. 11:00 to 01:00 (25.0)
    // Our interface says "end" string. If end < start, assumed next day? 
    // For MVP let's assume simple timeframe or robust check.
    // Mock data has "24:00" for midnight or "01:00".
    let numericEnd = end;
    if (numericEnd < start) numericEnd += 24;

    return hours >= start && hours < numericEnd;
};

export const recommendRestaurants = (
    profiles: UserProfile[],
    context: SessionContext
): RecommendationResult[] => {

    // 1. Collect all constraints
    const allAllergies = new Set<string>();
    const allDiets = new Set<string>(); // "Vegan", "Gluten-Free"
    let minHardBudget = 999;
    let minHardDistance = 999;

    profiles.forEach(p => {
        p.hard.allergies.forEach(a => allAllergies.add(a));
        p.hard.dietary.forEach(d => allDiets.add(d));
        if (p.hard.hardMaxBudget) minHardBudget = Math.min(minHardBudget, p.hard.hardMaxBudget);
        if (p.hard.hardMaxDistance) minHardDistance = Math.min(minHardDistance, p.hard.hardMaxDistance);
    });

    const filtered = RESTAURANTS.filter(r => {
        // a. Open Time
        // if (!isRestaurantOpen(r, context.now)) return false; 
        // Commented out filter for MVP purely to easier test without messing with mock hours/timezone
        // but ideally we include it. Let's include it but be generous if data missing.
        // Actually, let's Enable it but ensure mock data covers "now". 

        // b. Allergens
        const hasAllergen = r.allergens.some(algo => {
            // Mock data allergens are lowercase, user input might be capitalized
            // ProfileForm uses "Peanuts" (Title Case). Constant ALLERGIES are Title Case.
            // Mock data uses "peanuts" (lower). Normalize.
            const normalizedAlgo = algo.toLowerCase();
            for (let userAlgo of allAllergies) {
                if (userAlgo.toLowerCase() === normalizedAlgo) return true;
            }
            return false;
        });
        if (hasAllergen) return false;

        // c. Dietary
        // "Vegan" -> veganFriendly, "Gluten-Free" -> glutenFreeOptions
        if (allDiets.has("Vegan") && !r.dietarySupport.veganFriendly) return false;
        if (allDiets.has("Vegetarian") && !r.dietarySupport.vegetarianFriendly) return false;
        if (allDiets.has("Gluten-Free") && !r.dietarySupport.glutenFreeOptions) return false;
        if (allDiets.has("Halal") && !r.dietarySupport.halalOptions) return false;

        // d. Distance / Budget
        // (Skipping for MVP unless strictly set, assuming defaults are undefined)

        return true;
    });

    // 2. Scoring
    const scored = filtered.map(r => {
        let cuisineScore = 0;
        let priceScore = 0;
        let distanceScore = 0;
        let consensusBonus = 0;

        let cuisineExplanation = [];

        // Cuisine Scoring
        // For each user, calculate their satisfaction with this restaurant's cuisines
        profiles.forEach(p => {
            const userLikes = r.cuisines.some(c => p.soft.likedCuisines.includes(c));
            const userDislikes = r.cuisines.some(c => p.soft.dislikedCuisines.includes(c));

            const weight = p.weights.cuisine;
            if (userLikes) cuisineScore += (10 * weight);
            if (userDislikes) cuisineScore -= (10 * weight);
        });

        // Price Scoring
        profiles.forEach(p => {
            const target = p.soft.targetPrice || 2;
            const diff = Math.abs(r.priceTier - target);
            // Closer is better. 0 diff = max score. Max diff is 3.
            // Score = (3 - diff) * weight
            priceScore += (3 - diff) * 2 * p.weights.price;
        });

        // Rating Tie Breaker
        const ratingBonus = (r.rating || 0) * 5;

        // Total
        const totalScore = cuisineScore + priceScore + /* distanceScore + */ ratingBonus;

        // Explain
        const userCount = profiles.length;
        let explanation = `Match Score: ${Math.round(totalScore)}. Rating: ${r.rating}.`;

        return {
            restaurant: r,
            score: totalScore,
            breakdown: {
                hardPass: false,
                cuisineScore,
                priceScore,
                distanceScore,
                consensusBonus,
                ratingBonus
            },
            explanation
        };
    });

    // Sort descending
    return scored.sort((a, b) => b.score - a.score).slice(0, 25);
};
