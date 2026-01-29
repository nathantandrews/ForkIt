import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../firebase/hooks';
import { subscribeToSession, subscribeToMembers } from '../services/sessions';
import { subscribeToVotes, castVote, finalizeSession } from '../services/voting';
import { recommendRestaurants } from '../services/recommender';
import { Vote, Session, SessionMember, RecommendationResult } from '../types/models';

export default function RestaurantDetail() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { sessionId, restaurantId } = route.params;
    const { user } = useAuth();

    const [session, setSession] = useState<Session | null>(null);
    const [members, setMembers] = useState<SessionMember[]>([]);
    const [vote, setVote] = useState<Vote>({ restaurantId, approvals: [], vetoes: [] });
    const [rec, setRec] = useState<RecommendationResult | null>(null);

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
        if (session && members.length > 0) {
            // Re-run recommender to get specific explanation/score for this restaurant
            // Optimally, pass this via params, but param size limits can be tricky with complex objects. 
            // Re-calcing is cheap.
            const profiles = members.map(m => m.profileSnapshot);
            const results = recommendRestaurants(profiles, session.context);
            const found = results.find(r => r.restaurant.id === restaurantId);
            setRec(found || null);
        }
    }, [session, members, restaurantId]);

    const handleVote = (type: 'approve' | 'veto') => {
        if (!user) return;
        const isCurrent = type === 'approve' ? vote.approvals.includes(user.uid) : vote.vetoes.includes(user.uid);
        // toggle off if already selected
        castVote(sessionId, restaurantId, user.uid, isCurrent ? 'neutral' : type);
    };

    const handleFinalize = async () => {
        try {
            await finalizeSession(sessionId, restaurantId);
            // Sub listener will redirect
        } catch (e) {
            Alert.alert("Error", "Could not finalize");
        }
    };

    if (!rec || !session) return <View style={styles.container}><Text>Loading...</Text></View>;

    const isHost = user?.uid === session.hostUid;
    const approvalCount = vote.approvals.length;
    const vetoCount = vote.vetoes.length;
    const memberCount = members.length;

    const canAutoFinalize = approvalCount >= Math.ceil(memberCount / 2) && vetoCount === 0;

    const myVote = vote.approvals.includes(user?.uid || "") ? 'approve' : vote.vetoes.includes(user?.uid || "") ? 'veto' : 'neutral';

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.title}>{rec.restaurant.name}</Text>
            <Text style={styles.tags}>{rec.restaurant.cuisines.join(", ")} • {'$'.repeat(rec.restaurant.priceTier)}</Text>

            <View style={styles.scoreBox}>
                <Text style={styles.scoreLbl}>Match Score</Text>
                <Text style={styles.scoreVal}>{Math.round(rec.score)}</Text>
            </View>

            <Text style={styles.sectionHeader}>Why it's a match:</Text>
            <Text style={styles.explanation}>{rec.explanation}</Text>

            <View style={styles.voteContainer}>
                <Text style={styles.voteTitle}>Group Vote</Text>
                <View style={styles.bars}>
                    <View style={[styles.bar, { flex: approvalCount, backgroundColor: '#4caf50' }]} />
                    <View style={[styles.bar, { flex: vetoCount, backgroundColor: '#f44336' }]} />
                    <View style={[styles.bar, { flex: memberCount - approvalCount - vetoCount, backgroundColor: '#ddd' }]} />
                </View>
                <Text style={styles.tally}>{approvalCount} Approvals • {vetoCount} Vetoes</Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.btn, styles.btnApprove, myVote === 'approve' && styles.btnActive]}
                    onPress={() => handleVote('approve')}>
                    <Text style={styles.btnText}>👍 Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.btnVeto, myVote === 'veto' && styles.btnActive]}
                    onPress={() => handleVote('veto')}>
                    <Text style={styles.btnText}>👎 Veto</Text>
                </TouchableOpacity>
            </View>

            {(isHost || canAutoFinalize) && (
                <TouchableOpacity style={styles.finalizeBtn} onPress={handleFinalize}>
                    <Text style={styles.finalizeText}>
                        {canAutoFinalize ? "Consensus reached! Finalize" : "Force Finalize"}
                    </Text>
                </TouchableOpacity>
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
    title: { fontSize: 32, fontWeight: 'bold' },
    tags: { fontSize: 18, color: '#666', marginBottom: 20 },
    scoreBox: { alignSelf: 'flex-start', backgroundColor: '#eef', padding: 15, borderRadius: 10, marginBottom: 20 },
    scoreLbl: { fontSize: 12, color: '#55a', fontWeight: 'bold', textTransform: 'uppercase' },
    scoreVal: { fontSize: 32, fontWeight: '900', color: '#007aff' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    explanation: { fontSize: 16, lineHeight: 24, marginBottom: 30 },
    voteContainer: { padding: 20, backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 20 },
    voteTitle: { fontWeight: 'bold', marginBottom: 10 },
    bars: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
    bar: { height: '100%' },
    tally: { fontSize: 14, color: '#666', textAlign: 'center' },
    actions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    btn: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#eee', alignItems: 'center' },
    btnApprove: { backgroundColor: '#e8f5e9' },
    btnVeto: { backgroundColor: '#ffebee' },
    btnActive: { borderWidth: 2, borderColor: '#333' },
    btnText: { fontSize: 18, fontWeight: 'bold' },
    finalizeBtn: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center' },
    finalizeText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
