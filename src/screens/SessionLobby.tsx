import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Session, SessionMember } from '../types/models';
import { subscribeToSession, subscribeToMembers } from '../services/sessions';
import { useAuth } from '../firebase/hooks';

export default function SessionLobby() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { sessionId } = route.params;
    const { user } = useAuth();

    const [session, setSession] = useState<Session | null>(null);
    const [members, setMembers] = useState<SessionMember[]>([]);

    useEffect(() => {
        const unsubSession = subscribeToSession(sessionId, setSession);
        const unsubMembers = subscribeToMembers(sessionId, setMembers);
        return () => {
            unsubSession();
            unsubMembers();
        };
    }, [sessionId]);

    const handleStart = () => {
        navigation.navigate("Recommendations", { sessionId });
    };

    if (!session) return <View style={styles.container}><Text>Loading...</Text></View>;

    const isHost = user?.uid === session.hostUid;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>SESSION CODE</Text>
            <TouchableOpacity onPress={() => Share.share({ message: `Join my ForkIt session: ${session.code}` })}>
                <Text style={styles.code}>{session.code}</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { marginTop: 30 }]}>MEMBERS ({members.length})</Text>
            <FlatList
                data={members}
                keyExtractor={item => item.uid}
                renderItem={({ item }) => (
                    <View style={styles.memberRow}>
                        <View style={styles.avatar} />
                        <Text style={styles.memberName}>
                            {item.uid === user?.uid ? "You" : (item.displayName || "Anonymous")}
                            {item.uid === session.hostUid && " (Host)"}
                        </Text>
                    </View>
                )}
            />

            {isHost ? (
                <TouchableOpacity style={styles.btn} onPress={handleStart}>
                    <Text style={styles.btnText}>Generate Recommendations</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.waiting}>
                    <Text style={styles.waitingText}>Waiting for host to start...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: 'white' },
    label: { fontSize: 14, color: '#888', fontWeight: 'bold', alignSelf: 'center' },
    code: { fontSize: 48, fontWeight: '900', color: '#333', alignSelf: 'center', letterSpacing: 4, marginVertical: 10 },
    memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd', marginRight: 15 },
    memberName: { fontSize: 16, fontWeight: '500' },
    btn: { backgroundColor: '#007aff', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    waiting: { padding: 20, alignItems: 'center' },
    waitingText: { color: '#666', fontStyle: 'italic' }
});
