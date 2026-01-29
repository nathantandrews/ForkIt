
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { UserProfile, Weights } from '../types/models';
import { ALLERGIES, DIETARY_OPTS } from '../data/constants';
import CuisineSelector from './CuisineSelector';
import ConstraintSelector from './ConstraintSelector';

interface Props {
    initialProfile: UserProfile | null;
    onSave: (profile: UserProfile) => void;
    loading: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
    hard: { allergies: [], dietary: [] },
    soft: { likedCuisines: [], dislikedCuisines: [], distancePreference: "balanced" },
    weights: { cuisine: 3, price: 3, distance: 3 }
};

export default function ProfileForm({ initialProfile, onSave, loading }: Props) {
    const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
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

    return (
        <View style={styles.mainContainer}>
            <View style={styles.headerContainer}>
                <Text style={styles.screenTitle}>Your Food Profile</Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

                {/* 1) CUISINE PREFERENCES (SOFT) */}
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
                </View>

                <View style={styles.divider} />

                {/* 2) DIETARY RESTRICTIONS (HARD) */}
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

                <View style={styles.divider} />

                {/* 3) ALLERGIES (HARD) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>⚠️</Text>
                        <View>
                            <Text style={styles.sectionTitle}>Allergies</Text>
                            <Text style={styles.sectionSubtitle}>Restaurants containing these will be excluded</Text>
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
