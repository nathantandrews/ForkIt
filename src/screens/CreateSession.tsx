import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useUserProfile } from '../firebase/hooks';
import { createSession } from '../services/sessions';

export default function CreateSession() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { profile } = useUserProfile(user?.uid);
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!user || !profile) return;
        setCreating(true);
        try {
            const sessionId = await createSession(user.uid, profile);
            navigation.replace("SessionLobby", { sessionId });
        } catch (e) {
            console.error(e);
            setCreating(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>New Session</Text>
            <Text style={styles.desc}>You will be the host.</Text>

            {creating ? (
                <ActivityIndicator size="large" />
            ) : (
                <TouchableOpacity style={styles.btn} onPress={handleCreate}>
                    <Text style={styles.btnText}>Create & Enter Lobby</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    desc: { fontSize: 16, color: '#666', marginBottom: 30 },
    btn: { backgroundColor: '#007aff', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
    btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
