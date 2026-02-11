import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../firebase/hooks';
import { subscribeToMembers, subscribeToSession } from '../services/sessions';
import { subscribeToSessionVotes } from '../services/voting';
import { recommendRestaurants } from '../services/recommender';
import { Session, SessionMember, RecommendationResult, Vote } from '../types/models';

export default function Recommendations() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { sessionId } = route.params;

    const [members, setMembers] = useState<SessionMember[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [votes, setVotes] = useState<Record<string, Vote>>({}); // Store all votes
    const [results, setResults] = useState<RecommendationResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubSession = subscribeToSession(sessionId, setSession);
        const unsubMembers = subscribeToMembers(sessionId, setMembers);
        const unsubVotes = subscribeToSessionVotes(sessionId, setVotes); // Listen to votes
        
        return () => { unsubSession(); unsubMembers(); unsubVotes(); };
    }, [sessionId]);

    useEffect(() => {
        if (session && members.length > 0) {
            generate();
        }
    }, [session, members]);

    const generate = () => {
        if (!session) return;
        const profiles = members.map(m => m.profileSnapshot);
        const recs = recommendRestaurants(profiles, session.context);
        setResults(recs);
        setLoading(false);
    };

    const handleSelect = (r: RecommendationResult) => {
        navigation.navigate("RestaurantDetail", { restaurantId: r.restaurant.id, sessionId });
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator /></View>;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Top Recommendations</Text>
            <FlatList
                data={results}
                keyExtractor={item => item.restaurant.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item, index }) => {
                    // Get vote counts for this specific restaurant
                    const voteData = votes[item.restaurant.id] || { approvals: [], vetoes: [] };
                    const upCount = voteData.approvals?.length || 0;
                    const downCount = voteData.vetoes?.length || 0;

                    return (
                        <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
                            <View style={styles.rankBadge}>
                                <Text style={styles.rankText}>#{index + 1}</Text>
                            </View>
                            <View style={styles.info}>
                                <Text style={styles.name}>{item.restaurant.name}</Text>
                                <Text style={styles.meta}>
                                    {item.restaurant.cuisines.join(", ")} • {'$'.repeat(item.restaurant.priceTier)} • {item.restaurant.rating}★
                                </Text>
                                
                                {/* Vote Counts Row */}
                                <View style={styles.voteRow}>
                                    <View style={[styles.voteTag, styles.voteTagUp]}>
                                        <Text style={styles.voteText}>👍 {upCount}</Text>
                                    </View>
                                    <View style={[styles.voteTag, styles.voteTagDown]}>
                                        <Text style={styles.voteText}>👎 {downCount}</Text>
                                    </View>
                                </View>

                                <Text style={styles.explanation} numberOfLines={2}>{item.explanation}</Text>
                            </View>
                            <View style={styles.scoreBadge}>
                                <Text style={styles.scoreText}>{Math.round(item.score)}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 22, fontWeight: 'bold', padding: 20, backgroundColor: 'white' },
    card: { 
        flexDirection: 'row', 
        backgroundColor: 'white', 
        marginHorizontal: 15, 
        marginBottom: 10, 
        borderRadius: 12, 
        padding: 15, 
        alignItems: 'center', 
        shadowColor: '#000', 
        shadowOpacity: 0.1, 
        shadowRadius: 5, 
        elevation: 2 
    },
    rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    rankText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    info: { flex: 1 },
    name: { fontSize: 18, fontWeight: 'bold' },
    meta: { color: '#666', fontSize: 13, marginTop: 2 },
    explanation: { fontSize: 12, color: '#888', marginTop: 6 },
    scoreBadge: { marginLeft: 10, alignItems: 'center', minWidth: 40 },
    scoreText: { fontSize: 18, fontWeight: '900', color: '#007aff' },
    
    // New Vote Styles
    voteRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
    voteTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    voteTagUp: { backgroundColor: '#E8F5E9' },
    voteTagDown: { backgroundColor: '#FFEBEE' },
    voteText: { fontSize: 12, fontWeight: '600', color: '#333' }
});