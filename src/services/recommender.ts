import { Restaurant, SessionContext, UserProfile, RecommendationResult } from '../types/models';
import { RESTAURANTS } from '../data/restaurants';

/*
PHASE 1: HARD FILTER
Exclude restaurant if:
- closed at current time
- contains any allergen that any member lists
- fails any dietary restriction
*/

// Basic Haversine implementation
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const recommendRestaurants = (
    profiles: UserProfile[],
    context: SessionContext
): RecommendationResult[] => {

    // 1. Collect all constraints
    const allAllergies = new Set<string>();
    const allDiets = new Set<string>();
    let minHardBudget = 999;
    let minHardDistance = 999;

    profiles.forEach(p => {
        p.hard.allergies.forEach(a => allAllergies.add(a));
        p.hard.dietary.forEach(d => allDiets.add(d));
        if (p.hard.hardMaxBudget) minHardBudget = Math.min(minHardBudget, p.hard.hardMaxBudget);
        if (p.hard.hardMaxDistance) minHardDistance = Math.min(minHardDistance, p.hard.hardMaxDistance);
    });

    const filtered = RESTAURANTS.filter(r => {
        // a. Open Time check
        
        // b. Allergens
        const hasAllergen = r.allergens.some(algo => {
            const normalizedAlgo = algo.toLowerCase();
            for (let userAlgo of allAllergies) {
                if (userAlgo.toLowerCase() === normalizedAlgo) return true;
            }
            return false;
        });
        if (hasAllergen) return false;

        // c. Dietary
        if (allDiets.has("Vegan") && !r.dietarySupport.veganFriendly) return false;
        if (allDiets.has("Vegetarian") && !r.dietarySupport.vegetarianFriendly) return false;
        if (allDiets.has("Gluten-Free") && !r.dietarySupport.glutenFreeOptions) return false;
        if (allDiets.has("Halal") && !r.dietarySupport.halalOptions) return false;

        return true;
    });

    // 2. Scoring
    const scored = filtered.map(r => {
        let cuisineScore = 0;
        let priceScore = 0;
        let distanceScore = 0;
        let consensusBonus = 0;

        const positiveReasons = new Set<string>();

        // --- A. Cuisine Scoring ---
        profiles.forEach(p => {
            const userLikedCuisines = r.cuisines.filter(c => p.soft.likedCuisines.includes(c));
            const userDislikes = r.cuisines.some(c => p.soft.dislikedCuisines.includes(c));
            
            // Weight is 1-10
            const weight = p.weights.cuisine;

            if (userLikedCuisines.length > 0) {
                // Base 10 points * weight (1-10).
                cuisineScore += (10 * weight);
                positiveReasons.add(`Matches group preference for ${userLikedCuisines.join(", ")}`);
            }
            if (userDislikes) {
                cuisineScore -= (10 * weight);
            }
        });

        // --- B. Price Scoring ---
        let perfectPriceMatches = 0;
        profiles.forEach(p => {
            const targets = p.soft.targetPrice || [];
            const weight = p.weights.price; // 1-10

            let minDiff = 0; 
            if (targets.length > 0) {
                const diffs = targets.map(t => Math.abs(r.priceTier - t));
                minDiff = Math.min(...diffs);
            }

            const score = Math.max(0, 3 - minDiff);
            priceScore += score * 3 * weight;

            if (minDiff === 0 && targets.length > 0) perfectPriceMatches++;
        });

        if (perfectPriceMatches > 0) {
            if (perfectPriceMatches === profiles.length) positiveReasons.add("Perfect price match for everyone");
            else positiveReasons.add("Fits budget for some members");
        }

        // --- C. Distance Scoring ---
        if (context && context.location) {
            const dist = getDistanceKm(context.location.lat, context.location.lng, r.location.lat, r.location.lng);
            
            profiles.forEach(p => {
                const weight = p.weights.distance; // 1-10
                
                // Logic: Closer is always better.
                // Score falls off as distance increases.
                // < 1km = 10pts
                // < 3km = 8pts
                // < 5km = 6pts
                // < 10km = 4pts
                // > 10km = 1pt
                
                let baseDistScore = 0;
                if (dist < 1) baseDistScore = 10;
                else if (dist < 3) baseDistScore = 8;
                else if (dist < 5) baseDistScore = 6;
                else if (dist < 10) baseDistScore = 4;
                else baseDistScore = 1;

                // Multiply by user weight (1-10)
                distanceScore += (baseDistScore * weight);
            });
            
            if (dist < 2) positiveReasons.add("Very close to you");
        }

        // --- D. Rating Bonus ---
        const rating = r.rating || 0;
        const ratingBonus = rating * 5; 
        if (rating >= 4.5) positiveReasons.add(`Highly rated (${rating} stars)`);

        // --- Total ---
        const totalScore = cuisineScore + priceScore + distanceScore + ratingBonus;

        // Explain
        const reasonsArray = Array.from(positiveReasons);
        let explanation = reasonsArray.length > 0 
            ? `• ${reasonsArray.join("\n• ")}`
            : "A decent option based on general criteria.";

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

    return scored.sort((a, b) => b.score - a.score).slice(0, 25);
};