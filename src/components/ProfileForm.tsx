import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { UserProfile } from '../types/models';
import { ALLERGIES, DIETARY_OPTS } from '../data/constants';
import CuisineSelector from './CuisineSelector';
import ConstraintSelector from './ConstraintSelector';
import PriceSelector from './PriceSelector';
import WeightedSlider from './WeightedSlider';

interface Props {
    initialProfile: UserProfile | null;
    onSave: (profile: UserProfile) => void;
    loading: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
    hard: { allergies: [], dietary: [] },
    soft: { likedCuisines: [], dislikedCuisines: [], targetPrice: [2] },
    weights: { cuisine: 5, price: 5, distance: 5 }
};

export default function ProfileForm({ initialProfile, onSave, loading }: Props) {
    const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

    useEffect(() => {
        if (initialProfile) {
            let safeTargetPrice = initialProfile.soft.targetPrice;
            if (typeof safeTargetPrice === 'number') {
                safeTargetPrice = [safeTargetPrice];
            } else if (!safeTargetPrice || safeTargetPrice.length === 0) {
                safeTargetPrice = [2]; 
            }

            setProfile({
                ...DEFAULT_PROFILE,
                ...initialProfile,
                soft: { 
                    ...DEFAULT_PROFILE.soft, 
                    ...initialProfile.soft,
                    targetPrice: safeTargetPrice 
                },
                weights: {
                    ...DEFAULT_PROFILE.weights,
                    ...initialProfile.weights
                }
            });
        }
    }, [initialProfile]);

    const toggleList = (list: string[], item: string): string[] => {
        return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    };

    const updateHard = (field: 'allergies' | 'dietary', item: string) => {
        setProfile(p => ({
            ...p,
            hard: { ...p.hard, [field]: toggleList(p.hard[field], item) }
        }));
    };

    const updateLike = (cuisine: string) => {
        setProfile(p => ({
            ...p,
            soft: { ...p.soft, likedCuisines: toggleList(p.soft.likedCuisines, cuisine) }
        }));
    };

    const togglePrice = (price: number) => {
        setProfile(p => {
            const current = p.soft.targetPrice || [];
            const updated = current.includes(price) 
                ? current.filter(x => x !== price) 
                : [...current, price];
            return { ...p, soft: { ...p.soft, targetPrice: updated } };
        });
    };
    
    const updateWeight = (field: 'cuisine' | 'price' | 'distance', value: number) => {
        setProfile(p => ({
            ...p,
            weights: { ...p.weights, [field]: value }
        }));
    };

    return (
        <View style={styles.mainContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.screenTitle}>Your Food Profile</Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

                {/* 1) CUISINE PREFERENCES */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>🍽️</Text>
                        <View>
                            <Text style={styles.sectionTitle}>Cuisines</Text>
                            <Text style={styles.sectionSubtitle}>Select cuisines you enjoy</Text>
                        </View>
                    </View>
                    <CuisineSelector
                        selectedCuisines={profile.soft.likedCuisines}
                        onToggle={updateLike}
                    />
                    
                    <View style={styles.sliderContainer}>
                        <WeightedSlider 
                            label="Importance (Cuisine)"
                            value={profile.weights.cuisine}
                            onValueChange={(v) => updateWeight('cuisine', v)}
                        />
                    </View>
                </View>

                <View style={styles.divider} />

                {/* 2) PRICE PREFERENCE */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>💸</Text>
                        <View>
                            <Text style={styles.sectionTitle}>Price Range</Text>
                            <Text style={styles.sectionSubtitle}>Select all that apply</Text>
                        </View>
                    </View>
                    <PriceSelector 
                        selectedPrices={profile.soft.targetPrice || []} 
                        onToggle={togglePrice} 
                    />

                    <View style={styles.sliderContainer}>
                        <WeightedSlider 
                            label="Importance (Budget)"
                            value={profile.weights.price}
                            onValueChange={(v) => updateWeight('price', v)}
                        />
                    </View>
                </View>

                <View style={styles.divider} />
                
                {/* 3) DISTANCE IMPORTANCE ONLY */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>🚗</Text>
                        <View>
                            <Text style={styles.sectionTitle}>Distance</Text>
                            <Text style={styles.sectionSubtitle}>Closer is better</Text>
                        </View>
                    </View>
                    
                    {/* Just the slider, no generic selector */}
                    <WeightedSlider 
                        label="Importance (Distance)"
                        value={profile.weights.distance}
                        onValueChange={(v) => updateWeight('distance', v)}
                    />
                </View>

                <View style={styles.divider} />

                {/* 4) HARD CONSTRAINTS (Dietary/Allergies) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>🥗</Text>
                        <View>
                            <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
                            <Text style={styles.sectionSubtitle}>Non-negotiable requirements</Text>
                        </View>
                    </View>
                    <ConstraintSelector
                        options={DIETARY_OPTS}
                        selected={profile.hard.dietary}
                        onToggle={(item) => updateHard('dietary', item)}
                        type="dietary"
                    />
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>⚠️</Text>
                        <View>
                            <Text style={styles.sectionTitle}>Allergies</Text>
                            <Text style={styles.sectionSubtitle}>Strict exclusions</Text>
                        </View>
                    </View>
                    <ConstraintSelector
                        options={ALLERGIES}
                        selected={profile.hard.allergies}
                        onToggle={(item) => updateHard('allergies', item)}
                        type="allergy"
                    />
                </View>

            </ScrollView>

            {/* FLOATING SAVE BUTTON */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                    onPress={() => onSave(profile)}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#fff' },
    container: { paddingHorizontal: 20 },
    headerContainer: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#000',
    },
    section: {
        marginTop: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionIcon: {
        fontSize: 32,
        marginRight: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    sliderContainer: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E5EA',
        marginVertical: 10,
        marginTop: 30,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    saveBtn: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveBtnDisabled: {
        backgroundColor: '#A0C4FF',
        shadowOpacity: 0,
    },
    saveBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 18,
    }
});