import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { UserProfile } from '../types/models';
import { ALLERGIES, DIETARY_OPTS } from '../data/constants';
import CuisineSelector from './CuisineSelector';
import ConstraintSelector from './ConstraintSelector';
import PriceSelector from './PriceSelector';
import WeightedSlider from './WeightedSlider';
import { theme } from '../utils/theme';

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

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

                {/*1. CUISINE PREFERENCES*/}
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

                {/*2. PRICE PREFERENCE*/}
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

                {/*3. DISTANCE IMPORTANCE ONLY*/}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>🚗</Text>
                        <View>
                            <Text style={styles.sectionTitle}>Distance</Text>
                            <Text style={styles.sectionSubtitle}>Closer is better</Text>
                        </View>
                    </View>

                    <WeightedSlider
                        label="Importance (Distance)"
                        value={profile.weights.distance}
                        onValueChange={(v) => updateWeight('distance', v)}
                    />
                </View>

                <View style={styles.divider} />

                {/*4. HARD CONSTRAINTS (Dietary/Allergies)*/}
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

            {/*FLOATING SAVE BUTTON*/}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                    onPress={() => onSave(profile)}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: theme.colors.background
    },
    container: {
        paddingHorizontal: theme.spacing.xl
    },
    scrollContent: {
        paddingBottom: 140 //accommodate floating footer
    },
    headerContainer: {
        paddingTop: 60,
        paddingBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
    },
    screenTitle: {
        fontSize: theme.typography.sizes.hero,
        fontWeight: theme.typography.weights.black,
        color: theme.colors.textMain,
    },
    section: {
        marginTop: theme.spacing.xxl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    sectionIcon: {
        fontSize: theme.typography.sizes.xxl,
        marginRight: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textMain,
    },
    sectionSubtitle: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    sliderContainer: {
        marginTop: theme.spacing.md,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.sm,
        marginTop: theme.spacing.xxl,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: theme.spacing.xl,
        paddingBottom: theme.spacing.xxl,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    saveBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md + 2,
        borderRadius: theme.radii.lg,
        alignItems: 'center',
        ...theme.shadows.md,
    },
    saveBtnDisabled: {
        backgroundColor: theme.colors.border,
        shadowOpacity: 0,
        elevation: 0,
    },
    saveBtnText: {
        color: 'white',
        fontWeight: theme.typography.weights.bold,
        fontSize: theme.typography.sizes.lg,
        letterSpacing: 0.5,
    }
});