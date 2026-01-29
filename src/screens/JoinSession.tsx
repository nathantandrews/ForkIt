import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useUserProfile } from '../firebase/hooks';
import { joinSession } from '../services/sessions';

export default function JoinSession() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { profile } = useUserProfile(user?.uid);
    const [code, setCode] = useState("");
    const [joining, setJoining] = useState(false);

    const handleJoin = async () => {
        if (!user || !profile) {
            Alert.alert("Error", "Profile not loaded");
            return;
        }
        if (code.length < 6) {
            Alert.alert("Invalid Code", "Code must be 6 characters");
            return;
        }

        setJoining(true);
        try {
            const sessionId = await joinSession(code, user.uid, profile);
            navigation.replace("SessionLobby", { sessionId });
        } catch (e: any) {
            console.error(e);
            Alert.alert("Join Failed", e.message || "Could not join session");
            setJoining(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Join Session</Text>
            <Text style={styles.desc}>Enter the 6-character code:</Text>

            <TextInput
                style={styles.input}
                placeholder="ABC123"
                value={code}
                onChangeText={t => setCode(t.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
            />

            {joining ? (
                <ActivityIndicator size="large" />
            ) : (
                <TouchableOpacity style={styles.btn} onPress={handleJoin}>
                    <Text style={styles.btnText}>Join Group</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    desc: { fontSize: 16, color: '#666', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 24, letterSpacing: 5, width: '80%', textAlign: 'center', marginBottom: 30 },
    btn: { backgroundColor: '#333', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
    btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
