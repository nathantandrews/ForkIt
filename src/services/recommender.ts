import { Restaurant, SessionContext, UserProfile, RecommendationResult, RestaurantDraft } from '../types/models';

import { fetchNearbyRestaurants } from './restaurant';
import { enrichRestaurantDraft } from '../enrichers/restaurant.enricher';

// Convert RestaurantDraft to Restaurant format
const draftToRestaurant = (draft: RestaurantDraft, index: number): Restaurant => ({
    id: `api-${draft.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    name: draft.name,
    cuisines: draft.cuisines,
    priceTier: draft.priceTier || 2,
    rating: draft.rating || 0,
    location: {
        lat: draft.location.lat,
        lng: draft.location.lon,
        address: draft.address?.street || 'Address unavailable'
    },
    openHours: draft.openHours || [],
    dietarySupport: draft.dietarySupport || {
        veganFriendly: false,
        vegetarianFriendly: false,
        glutenFreeOptions: false,
        halalOptions: false
    },
    allergens: draft.allergens || [],
    distance: draft.distance,
    image: undefined
});


const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const recommendRestaurants = async (
    profiles: UserProfile[],
    context: SessionContext
): Promise<RecommendationResult[]> => {

    console.log('=== RECOMMENDER DEBUG ===');
    console.log('Number of profiles:', profiles.length);
    console.log('Context location:', context.location);
    profiles.forEach((p, i) => {
        console.log(`Profile ${i}:`, {
            likedCuisines: p.soft.likedCuisines,
            dislikedCuisines: p.soft.dislikedCuisines,
            targetPrice: p.soft.targetPrice,
            weights: p.weights
        });
    });

    let restaurantPool: Restaurant[] = [];

    if (context?.location) {
        try {
            console.log('Fetching nearby restaurants from API...');
            const drafts = await fetchNearbyRestaurants(
                context.location.lat,
                context.location.lng,
                5, // 5km radius
                20 // minimum 20 results
            );

            const enriched = drafts.map(draft =>
                enrichRestaurantDraft(draft, {
                    centerLat: context.location.lat,
                    centerLon: context.location.lng
                })
            );

            restaurantPool = enriched.map((draft, i) => draftToRestaurant(draft, i));
            console.log(`Fetched ${restaurantPool.length} restaurants from API`);
            if (restaurantPool.length > 0) {
                console.log('Sample API restaurant:', {
                    name: restaurantPool[0].name,
                    cuisines: restaurantPool[0].cuisines,
                    priceTier: restaurantPool[0].priceTier,
                    rating: restaurantPool[0].rating,
                    allergens: restaurantPool[0].allergens,
                    dietarySupport: restaurantPool[0].dietarySupport
                });
            }
        } catch (error) {
            console.error('Error fetching restaurants from API:', error);
            // No fallback data available anymore
            restaurantPool = [];
        }
    } else {
        console.log('No location in context, cannot fetch restaurants');
        restaurantPool = [];
    }

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

    console.log('Before filtering:', restaurantPool.length, 'restaurants');
    console.log('Hard constraints:', { allAllergies: Array.from(allAllergies), allDiets: Array.from(allDiets) });

    // Check if any restaurants have dietary data
    const restaurantsWithDietaryData = restaurantPool.filter(r =>
        r.dietarySupport.veganFriendly ||
        r.dietarySupport.vegetarianFriendly ||
        r.dietarySupport.glutenFreeOptions ||
        r.dietarySupport.halalOptions ||
        r.allergens.length > 0
    );
    console.log(`${restaurantsWithDietaryData.length}/${restaurantPool.length} restaurants have dietary/allergen data`);

    if (restaurantsWithDietaryData.length === 0 && (allDiets.size > 0 || allAllergies.size > 0)) {
        console.warn('⚠️  No restaurants have dietary/allergen data - filtering will be skipped. Users should verify manually.');
    }

    const filtered = restaurantPool.filter(r => {
        // a. Open Time check
        const hasDietaryData = r.dietarySupport.veganFriendly ||
            r.dietarySupport.vegetarianFriendly ||
            r.dietarySupport.glutenFreeOptions ||
            r.dietarySupport.halalOptions ||
            r.allergens.length > 0;

        // b. Allergens - only filter if we have allergen data
        if (hasDietaryData && r.allergens.length > 0) {
            const hasAllergen = r.allergens.some(algo => {
                const normalizedAlgo = algo.toLowerCase();
                for (let userAlgo of allAllergies) {
                    if (userAlgo.toLowerCase() === normalizedAlgo) return true;
                }
                return false;
            });
            if (hasAllergen) return false;
        }

        // c. Dietary - only filter if we have dietary data
        // If data is unavailable, allow through (user will need to check manually)
        if (hasDietaryData) {
            if (allDiets.has("Vegan") && !r.dietarySupport.veganFriendly) return false;
            if (allDiets.has("Vegetarian") && !r.dietarySupport.vegetarianFriendly) return false;
            if (allDiets.has("Gluten-Free") && !r.dietarySupport.glutenFreeOptions) return false;
            if (allDiets.has("Halal") && !r.dietarySupport.halalOptions) return false;
        }

        return true;
    });

    console.log('After filtering:', filtered.length, 'restaurants');
    if (filtered.length > 0) {
        console.log('Sample filtered restaurant:', {
            name: filtered[0].name,
            cuisines: filtered[0].cuisines,
            priceTier: filtered[0].priceTier,
            allergens: filtered[0].allergens
        });
    }

    // 2. Scoring
    const scored = filtered.map(r => {
        let cuisineScore = 0;
        let priceScore = 0;
        let distanceScore = 0;
        let consensusBonus = 0;

        const positiveReasons = new Set<string>();

        // Helper to normalize cuisine names (handle singular/plural, case)
        const normalizeCuisine = (cuisine: string): string => {
            return cuisine.toLowerCase().trim().replace(/s$/, '');
        };

        // Helper to check if two cuisines match
        const cuisinesMatch = (c1: string, c2: string): boolean => {
            const norm1 = normalizeCuisine(c1);
            const norm2 = normalizeCuisine(c2);
            return norm1 === norm2 || norm1.startsWith(norm2) || norm2.startsWith(norm1);
        };

        // Count how many users like each cuisine the restaurant serves
        const cuisineMatchCounts: Record<string, number> = {};

        profiles.forEach(p => {
            const matchedLikedCuisines = r.cuisines.filter(rCuisine =>
                p.soft.likedCuisines.some(userCuisine => cuisinesMatch(rCuisine, userCuisine))
            );
            const hasDislikedCuisine = r.cuisines.some(rCuisine =>
                p.soft.dislikedCuisines.some(userCuisine => cuisinesMatch(rCuisine, userCuisine))
            );

            const weight = p.weights.cuisine; // 1–10

            if (matchedLikedCuisines.length > 0) {
                cuisineScore += (10 * weight);
                matchedLikedCuisines.forEach(c => {
                    cuisineMatchCounts[c] = (cuisineMatchCounts[c] ?? 0) + 1;
                });
            }
            if (hasDislikedCuisine) {
                cuisineScore -= (8 * weight); // penalize disliked cuisines
            }
        });

        // Consensus multiplier: boost score when more of the group agrees
        const maxMatchCount = Math.max(0, ...Object.values(cuisineMatchCounts));
        const matchedLabels = Object.keys(cuisineMatchCounts);
        if (maxMatchCount > 0 && profiles.length > 1) {
            const consensusRatio = maxMatchCount / profiles.length;
            // 1.0x at 1/n consensus, up to 1.5x at full consensus
            const consensusMult = 1 + (0.5 * consensusRatio);
            cuisineScore *= consensusMult;
            consensusBonus = cuisineScore * (consensusMult - 1);

            if (maxMatchCount === profiles.length) {
                positiveReasons.add(`Everyone loves ${matchedLabels.join(" & ")}!`);
            } else if (maxMatchCount > 1) {
                positiveReasons.add(`${maxMatchCount}/${profiles.length} members like ${matchedLabels.join(" & ")}`);
            } else {
                positiveReasons.add(`Matches preference for ${matchedLabels.join(", ")}`);
            }
        } else if (maxMatchCount === 1) {
            positiveReasons.add(`Matches preference for ${matchedLabels.join(", ")}`);
        }

        // --- B. Price Scoring ---
        let perfectPriceMatches = 0;
        profiles.forEach(p => {
            const targets = p.soft.targetPrice || [];
            const weight = p.weights.price; // 1–10

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

        // C. Distance Scoring (continuous exponential decay)
        if (context && context.location) {
            const dist = getDistanceKm(context.location.lat, context.location.lng, r.location.lat, r.location.lng);

            profiles.forEach(p => {
                const weight = p.weights.distance; // 1–10
                const baseDistScore = 10 * Math.exp(-dist / 3);
                distanceScore += (baseDistScore * weight);
            });

            if (dist < 1) positiveReasons.add(`Very close (${(dist * 1000).toFixed(0)}m away)`);
            else if (dist < 2) positiveReasons.add(`Nearby (${dist.toFixed(1)}km away)`);
        }

        // D. Rating Bonus (only when real rating data is available)
        const rating = r.rating;
        let ratingBonus = 0;
        if (rating && rating > 0) {
            ratingBonus = rating * 2;
            if (rating >= 4.5) positiveReasons.add(`Highly rated (${rating}★)`);
        }

        // E. Dietary/Allergen Warning
        const hasDietaryData = r.dietarySupport.veganFriendly ||
            r.dietarySupport.vegetarianFriendly ||
            r.dietarySupport.glutenFreeOptions ||
            r.dietarySupport.halalOptions ||
            r.allergens.length > 0;

        if (!hasDietaryData && (allDiets.size > 0 || allAllergies.size > 0)) {
            positiveReasons.add("⚠️ Dietary/allergen info unavailable - verify before visiting");
        }

        // Total
        const totalScore = cuisineScore + priceScore + distanceScore + ratingBonus;

        // Small random tiebreaker (0–1) to add variety when scores are identical
        const tiebreaker = Math.random();

        // Explain
        const reasonsArray = Array.from(positiveReasons);
        let explanation = reasonsArray.length > 0
            ? `• ${reasonsArray.join("\n• ")}`
            : "A decent option based on general criteria.";

        return {
            restaurant: r,
            score: totalScore + tiebreaker,
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

    // Sort by score descending
    const sorted = scored.sort((a, b) => b.score - a.score).slice(0, 25);

    console.log('Top 5 raw scores:', sorted.slice(0, 5).map(s => ({
        name: s.restaurant.name,
        rawScore: Math.floor(s.score),
        breakdown: s.breakdown
    })));

    // Min-max normalization relative to the actual top and bottom scores.
    // This ensures the 0–100 range is always fully utilized and meaningful to users.
    const topScore = sorted[0]?.score ?? 1;
    const bottomScore = sorted[sorted.length - 1]?.score ?? 0;
    const scoreRange = Math.max(1, topScore - bottomScore);

    return sorted.map(item => ({
        ...item,
        score: Math.round(((item.score - bottomScore) / scoreRange) * 100)
    }));
};