import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../firebase/hooks';
import { subscribeToSession, subscribeToMembers } from '../services/sessions';
import { subscribeToVotes, castVote, finalizeSession } from '../services/voting';
import { recommendRestaurants } from '../services/recommender';
import { Vote, Session, SessionMember, RecommendationResult } from '../types/models';
import { theme } from '../utils/theme';

export default function RestaurantDetail() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { sessionId, restaurantId, restaurantData } = route.params;
    const { user } = useAuth();

    const [session, setSession] = useState<Session | null>(null);
    const [members, setMembers] = useState<SessionMember[]>([]);
    const [vote, setVote] = useState<Vote>({ restaurantId, approvals: [], vetoes: [] });
    const [rec, setRec] = useState<RecommendationResult | null>(restaurantData || null);
    const [loading, setLoading] = useState(!restaurantData);

    useEffect(() => {
        const unsubSession = subscribeToSession(sessionId, (s) => {
            setSession(s);
            if (s?.status === "finalized" && s.finalizedRestaurantId) {
                navigation.replace("FinalResult", { sessionId });
            }
        });
        const unsubMembers = subscribeToMembers(sessionId, setMembers);
        const unsubVotes = subscribeToVotes(sessionId, restaurantId, setVote);
        return () => { unsubSession(); unsubMembers(); unsubVotes(); };
    }, [sessionId, restaurantId]);

    useEffect(() => {
        if (!restaurantData && session && members.length > 0) {
            setLoading(true);
            const profiles = members.map(m => m.profileSnapshot);
            recommendRestaurants(profiles, session.context).then(results => {
                const found = results.find(r => r.restaurant.id === restaurantId);
                if (!found) {
                    console.warn('Restaurant not found in recommendations:', restaurantId);
                }
                setRec(found || null);
                setLoading(false);
            }).catch(error => {
                console.error('Error fetching restaurant details:', error);
                setRec(null);
                setLoading(false);
            });
        }
    }, [session, members, restaurantId, restaurantData]);

    const handleVote = (type: 'approve' | 'veto') => {
        if (!user) return;
        const isCurrent = type === 'approve' ? vote.approvals.includes(user.uid) : vote.vetoes.includes(user.uid);
        castVote(sessionId, restaurantId, user.uid, isCurrent ? 'neutral' : type);
    };

    const handleFinalize = async () => {
        if (!rec?.restaurant) {
            Alert.alert("Error", "Restaurant data not available");
            return;
        }
        try {
            console.log('Finalizing session:', sessionId, 'with restaurant:', restaurantId);
            await finalizeSession(sessionId, restaurantId, rec.restaurant);
        } catch (e: any) {
            console.error('Finalize error:', e?.code, e?.message, e);
            Alert.alert("Error", `Could not finalize: ${e?.message || 'Unknown error'}`);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading details...</Text>
            </View>
        );
    }

    if (!rec || !session) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>
                    Restaurant not found in recommendations.{'\n'}Please go back and try another option.
                </Text>
            </View>
        );
    }

    const isHost = user?.uid === session.hostUid;
    const approvalCount = vote.approvals.length;
    const vetoCount = vote.vetoes.length;
    const memberCount = members.length;
    const neutralCount = Math.max(0, memberCount - approvalCount - vetoCount);

    const canAutoFinalize = approvalCount >= Math.ceil(memberCount / 2) && vetoCount === 0;

    const myVote = vote.approvals.includes(user?.uid || "") ? 'approve' : vote.vetoes.includes(user?.uid || "") ? 'veto' : 'neutral';

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) }]}>
            <View style={styles.heroSection}>
                <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{rec.restaurant.name}</Text>
                <Text style={styles.tags}>
                    {rec.restaurant.cuisines.join(", ")} • {'$'.repeat(rec.restaurant.priceTier)}{rec.restaurant.rating > 0 ? ` • ${rec.restaurant.rating}★` : ''}
                </Text>
            </View>

            <View style={styles.card}>
                <View style={styles.scoreRow}>
                    <View style={styles.scoreIconContainer}>
                        <Text style={styles.scoreIcon}>⭐</Text>
                    </View>
                    <View>
                        <Text style={styles.scoreLbl}>Match Score</Text>
                        <Text style={styles.scoreVal}>{Math.round(rec.score)}%</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionHeader}>Why it's a match</Text>
                <Text style={styles.explanation}>{rec.explanation}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionHeader}>Group Vote</Text>

                <View style={styles.barsContainer}>
                    {approvalCount > 0 && <View style={[styles.bar, { flex: approvalCount, backgroundColor: theme.colors.success }]} />}
                    {vetoCount > 0 && <View style={[styles.bar, { flex: vetoCount, backgroundColor: theme.colors.error }]} />}
                    {neutralCount > 0 && <View style={[styles.bar, { flex: neutralCount, backgroundColor: theme.colors.border }]} />}
                </View>

                <View style={styles.tallyRow}>
                    <Text style={styles.tallyApprove}>{approvalCount} Approvals</Text>
                    <Text style={[styles.tallyNeutral, { flex: 1, textAlign: 'center' }]}>{neutralCount} Waiting</Text>
                    <Text style={styles.tallyVeto}>{vetoCount} Vetoes</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.btn, styles.btnApprove, myVote === 'approve' && styles.btnActiveApprove]}
                        activeOpacity={0.8}
                        onPress={() => handleVote('approve')}>
                        <Text style={[styles.btnText, myVote === 'approve' && styles.btnActiveText]}>
                            {myVote === 'approve' ? "👍 Approved" : "👍 Approve"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, styles.btnVeto, myVote === 'veto' && styles.btnActiveVeto]}
                        activeOpacity={0.8}
                        onPress={() => handleVote('veto')}>
                        <Text style={[styles.btnText, myVote === 'veto' && styles.btnActiveText]}>
                            {myVote === 'veto' ? "👎 Vetoed" : "👎 Veto"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {(isHost || canAutoFinalize) && (
                <TouchableOpacity
                    style={[styles.finalizeBtn, canAutoFinalize ? styles.finalizeBtnReady : null]}
                    activeOpacity={0.9}
                    onPress={handleFinalize}
                >
                    <Text style={styles.finalizeText}>
                        {canAutoFinalize ? "🎉 Consensus Reached! Finalize" : "Force Finalize"}
                    </Text>
                </TouchableOpacity>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.medium,
    },
    errorText: {
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.textMuted,
        textAlign: 'center',
        padding: theme.spacing.xl,
        lineHeight: 28,
    },
    heroSection: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        borderBottomLeftRadius: theme.radii.lg,
        borderBottomRightRadius: theme.radii.lg,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.black,
        color: '#fff',
        marginBottom: theme.spacing.xs,
    },
    tags: {
        fontSize: theme.typography.sizes.sm,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: theme.typography.weights.medium,
    },
    card: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.md,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scoreIconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.radii.round,
        backgroundColor: theme.colors.primaryLight + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    scoreIcon: {
        fontSize: theme.typography.sizes.lg,
    },
    scoreLbl: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.bold,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    scoreVal: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: theme.typography.weights.black,
        color: theme.colors.primaryDark,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.sm,
    },
    sectionHeader: {
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textMain,
        marginBottom: theme.spacing.xs,
    },
    explanation: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        lineHeight: 20,
    },
    barsContainer: {
        flexDirection: 'row',
        height: 8,
        borderRadius: theme.radii.round,
        overflow: 'hidden',
        marginTop: theme.spacing.xs,
        marginBottom: theme.spacing.xs,
        backgroundColor: theme.colors.border,
    },
    bar: {
        height: '100%',
    },
    tallyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    tallyApprove: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.success,
        fontWeight: theme.typography.weights.bold,
    },
    tallyNeutral: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.medium,
    },
    tallyVeto: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.error,
        fontWeight: theme.typography.weights.bold,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    btn: {
        flex: 1,
        height: 44,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    btnApprove: {
        backgroundColor: theme.colors.success + '20',
    },
    btnVeto: {
        backgroundColor: theme.colors.error + '20',
    },
    btnActiveApprove: {
        borderColor: theme.colors.success,
        backgroundColor: theme.colors.success,
    },
    btnActiveVeto: {
        borderColor: theme.colors.error,
        backgroundColor: theme.colors.error,
    },
    btnText: {
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textMain,
    },
    btnActiveText: {
        color: '#fff',
    },
    finalizeBtn: {
        backgroundColor: theme.colors.textMain,
        height: 48,
        borderRadius: theme.radii.lg,
        marginHorizontal: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto', // Pushes to bottom
        ...theme.shadows.md,
    },
    finalizeBtnReady: {
        backgroundColor: theme.colors.primary,
    },
    finalizeText: {
        color: 'white',
        fontWeight: theme.typography.weights.bold,
        fontSize: theme.typography.sizes.md,
    }
});
