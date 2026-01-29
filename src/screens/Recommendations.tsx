import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../firebase/hooks';
import { subscribeToMembers, subscribeToSession } from '../services/sessions';
import { recommendRestaurants } from '../services/recommender';
import { Session, SessionMember, RecommendationResult } from '../types/models';

export default function Recommendations() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { sessionId } = route.params;

    const [members, setMembers] = useState<SessionMember[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [results, setResults] = useState<RecommendationResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubSession = subscribeToSession(sessionId, setSession);
        const unsubMembers = subscribeToMembers(sessionId, setMembers);
        return () => { unsubSession(); unsubMembers(); };
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
                renderItem={({ item, index }) => (
                    <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
                        <View style={styles.rankBadge}>
                            <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.restaurant.name}</Text>
                            <Text style={styles.meta}>
                                {item.restaurant.cuisines.join(", ")} • {'$'.repeat(item.restaurant.priceTier)} • {item.restaurant.rating}★
                            </Text>
                            <Text style={styles.explanation} numberOfLines={2}>{item.explanation}</Text>
                        </View>
                        <View style={styles.scoreBadge}>
                            <Text style={styles.scoreText}>{Math.round(item.score)}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 22, fontWeight: 'bold', padding: 20, backgroundColor: 'white' },
    card: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 15, marginBottom: 10, borderRadius: 12, padding: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    rankBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rankText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    info: { flex: 1 },
    name: { fontSize: 18, fontWeight: 'bold' },
    meta: { color: '#666', marginVertical: 4 },
    explanation: { fontSize: 12, color: '#888' },
    scoreBadge: { marginLeft: 10, alignItems: 'center' },
    scoreText: { fontSize: 18, fontWeight: '900', color: '#007aff' }
});
