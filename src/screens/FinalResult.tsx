import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../firebase/hooks';
import { subscribeToSession } from '../services/sessions';
import { RESTAURANTS } from '../data/restaurants';
import { Session } from '../types/models';

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

    if (!session || !session.finalizedRestaurantId) return <View style={styles.container}><Text>Waiting for results...</Text></View>;

    const winner = RESTAURANTS.find(r => r.id === session.finalizedRestaurantId);

    return (
        <View style={styles.container}>
            <Text style={styles.jumbo}>🎉</Text>
            <Text style={styles.header}>We Have a Winner!</Text>

            <View style={styles.card}>
                <Text style={styles.name}>{winner?.name}</Text>
                <Text style={styles.details}>{winner?.cuisines.join(", ")} • {'$'.repeat(winner?.priceTier || 1)}</Text>
                <Text style={styles.hours}>Open today until...</Text>
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleHome}>
                <Text style={styles.btnText}>Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f0f8ff' },
    jumbo: { fontSize: 80, marginBottom: 20 },
    header: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, textAlign: 'center' },
    card: { backgroundColor: 'white', padding: 30, borderRadius: 20, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 50 },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    details: { fontSize: 18, color: '#666', marginBottom: 10 },
    hours: { fontSize: 14, color: '#888' },
    btn: { backgroundColor: '#007aff', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30 },
    btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
