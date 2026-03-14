import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../firebase/hooks';
import { subscribeToMembers, subscribeToSession } from '../services/sessions';
import { subscribeToSessionVotes } from '../services/voting';
import { recommendRestaurants } from '../services/recommender';
import { Session, SessionMember, RecommendationResult, Vote } from '../types/models';
import { theme } from '../utils/theme';

export default function Recommendations() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { sessionId } = route.params;

    const [members, setMembers] = useState<SessionMember[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [votes, setVotes] = useState<Record<string, Vote>>({});
    const [results, setResults] = useState<RecommendationResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubSession = subscribeToSession(sessionId, setSession);
        const unsubMembers = subscribeToMembers(sessionId, setMembers);
        const unsubVotes = subscribeToSessionVotes(sessionId, setVotes);

        return () => { unsubSession(); unsubMembers(); unsubVotes(); };
    }, [sessionId]);

    useEffect(() => {
        if (session?.status === "finalized" && session.finalizedRestaurantId) {
            navigation.replace("FinalResult", { sessionId });
        }
    }, [session?.status, session?.finalizedRestaurantId]);

    useEffect(() => {
        if (session && members.length > 0) {
            generate();
        }
    }, [session, members]);

    const generate = async () => {
        if (!session) return;
        const profiles = members.map(m => m.profileSnapshot);
        const recs = await recommendRestaurants(profiles, session.context);
        setResults(recs);
        setLoading(false);
    };

    const handleSelect = (r: RecommendationResult) => {
        navigation.navigate("RestaurantDetail", {
            restaurantId: r.restaurant.id,
            sessionId,
            restaurantData: r
        });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Finding the perfect spots...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Top Picks</Text>
                <Text style={styles.headerSubtitle}>Based on everyone's preferences</Text>
            </View>

            <FlatList
                data={results}
                keyExtractor={item => item.restaurant.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item, index }) => {
                    const voteData = votes[item.restaurant.id] || { approvals: [], vetoes: [] };
                    const upCount = voteData.approvals?.length || 0;
                    const downCount = voteData.vetoes?.length || 0;

                    return (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.9}
                            onPress={() => handleSelect(item)}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.rankBadge}>
                                    <Text style={styles.rankText}>#{index + 1}</Text>
                                </View>
                                <View style={styles.scoreBadge}>
                                    <Text style={styles.scoreIcon}>⭐</Text>
                                    <Text style={styles.scoreText}>{Math.round(item.score)}</Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.name}>{item.restaurant.name}</Text>
                                <Text style={styles.meta}>
                                    {item.restaurant.cuisines.join(", ")} • {'$'.repeat(item.restaurant.priceTier)}{item.restaurant.rating > 0 ? ` • ${item.restaurant.rating}★` : ''}
                                    {item.restaurant.distance ? ` • ${(item.restaurant.distance * 0.621371).toFixed(1)} mi` : ''}
                                </Text>

                                <Text style={styles.explanation} numberOfLines={2}>{item.explanation}</Text>

                                <View style={styles.voteRow}>
                                    <View style={[styles.voteTag, styles.voteTagUp]}>
                                        <Text style={styles.voteTextUp}>👍 {upCount}</Text>
                                    </View>
                                    <View style={[styles.voteTag, styles.voteTagDown]}>
                                        <Text style={styles.voteTextDown}>👎 {downCount}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
    },
    loadingText: {
        marginTop: theme.spacing.lg,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.medium,
    },
    headerContainer: {
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
        borderBottomLeftRadius: theme.radii.xl,
        borderBottomRightRadius: theme.radii.xl,
        ...theme.shadows.sm,
        marginBottom: theme.spacing.md,
    },
    headerTitle: {
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.black,
        color: theme.colors.textMain,
    },
    headerSubtitle: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
        marginTop: theme.spacing.xs,
    },
    listContainer: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xxl,
        gap: theme.spacing.lg,
    },
    card: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.radii.xl,
        padding: theme.spacing.lg,
        ...theme.shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    rankBadge: {
        backgroundColor: theme.colors.textMain,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.round,
    },
    rankText: {
        color: '#fff',
        fontWeight: theme.typography.weights.bold,
        fontSize: theme.typography.sizes.sm,
    },
    scoreBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight + '20',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.round,
    },
    scoreIcon: {
        fontSize: theme.typography.sizes.sm,
        marginRight: 4,
    },
    scoreText: {
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primaryDark,
    },
    cardBody: {
        marginTop: theme.spacing.xs,
    },
    name: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textMain,
        marginBottom: theme.spacing.xs,
    },
    meta: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.medium,
        marginBottom: theme.spacing.sm,
    },
    explanation: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        lineHeight: 20,
        marginBottom: theme.spacing.md,
    },
    voteRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    voteTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.round,
    },
    voteTagUp: {
        backgroundColor: theme.colors.success + '20',
    },
    voteTagDown: {
        backgroundColor: theme.colors.error + '20',
    },
    voteTextUp: {
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.success,
    },
    voteTextDown: {
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.error,
    }
});