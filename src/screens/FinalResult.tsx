import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../firebase/hooks';
import { subscribeToSession } from '../services/sessions';

import { Session } from '../types/models';
import { theme } from '../utils/theme';

export default function FinalResult() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { sessionId } = route.params;

    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        return subscribeToSession(sessionId, setSession);
    }, [sessionId]);

    const handleHome = () => {
        navigation.popToTop();
    };

    if (!session || !session.finalizedRestaurantId) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Tallying the final votes...</Text>
            </View>
        );
    }

    const winner = session.finalizedRestaurant;

    return (
        <View style={styles.container}>
            <View style={styles.confettiContainer}>
                <Text style={styles.jumbo}>🎉</Text>
            </View>
            <Text style={styles.header}>We Have a Winner!</Text>
            <Text style={styles.subtext}>Your group has spoken. Let's eat!</Text>

            <View style={styles.card}>
                <View style={styles.winnerBadge}>
                    <Text style={styles.winnerBadgeText}>Top Choice</Text>
                </View>
                <Text style={styles.name}>{winner?.name}</Text>
                <Text style={styles.details}>
                    {winner?.cuisines.join(", ")} • {'$'.repeat(winner?.priceTier || 1)} • {winner?.rating}★
                </Text>
                {winner?.distance && (
                    <Text style={styles.distance}>
                        📍 {(winner.distance * 0.621371).toFixed(1)} mi away
                    </Text>
                )}
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleHome} activeOpacity={0.8}>
                <Text style={styles.btnPrimaryText}>Back to Dashboard</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
    },
    centered: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.medium,
    },
    confettiContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    jumbo: {
        fontSize: 80,
    },
    header: {
        fontSize: theme.typography.sizes.xxl + 4,
        fontWeight: theme.typography.weights.black,
        color: theme.colors.textMain,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    subtext: {
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginBottom: theme.spacing.xxl,
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.xxl,
        borderRadius: theme.radii.xl,
        alignItems: 'center',
        ...theme.shadows.lg,
        borderWidth: 2,
        borderColor: theme.colors.primaryLight + '30',
        marginBottom: theme.spacing.xxl,
        position: 'relative',
    },
    winnerBadge: {
        position: 'absolute',
        top: -15,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.round,
        ...theme.shadows.sm,
    },
    winnerBadgeText: {
        color: '#fff',
        fontWeight: theme.typography.weights.bold,
        fontSize: theme.typography.sizes.sm,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    name: {
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.black,
        color: theme.colors.textMain,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
        marginTop: theme.spacing.md,
    },
    details: {
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.sm,
        fontWeight: theme.typography.weights.medium,
    },
    distance: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.primaryDark,
        fontWeight: theme.typography.weights.semibold,
    },
    btnPrimary: {
        backgroundColor: theme.colors.textMain,
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.radii.lg,
        alignItems: 'center',
        ...theme.shadows.md,
    },
    btnPrimaryText: {
        color: '#fff',
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
    }
});
