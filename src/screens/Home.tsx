import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function Home() {
    const navigation = useNavigation<any>();

    const handleSignOut = () => {
        signOut(auth).catch(error => console.error('Sign out error', error));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ForkIt 🍴</Text>
            <Text style={styles.subtitle}>Group dining decisions made easy.</Text>

            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('CreateSession')}>
                <Text style={styles.btnText}>Start New Session</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('JoinSession')}>
                <Text style={styles.btnTextSecondary}>Join Session</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('ProfileSetup')}>
                <Text style={styles.btnTextOutline}>My Food Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnOutline, { marginTop: 15, borderColor: '#FF3B30' }]} onPress={handleSignOut}>
                <Text style={[styles.btnTextOutline, { color: '#FF3B30' }]}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' },
    title: { fontSize: 40, fontWeight: 'bold', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 50 },
    btnPrimary: { backgroundColor: '#007aff', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, marginBottom: 15, width: '100%', alignItems: 'center' },
    btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    btnSecondary: { backgroundColor: '#e0e0e0', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, marginBottom: 15, width: '100%', alignItems: 'center' },
    btnTextSecondary: { color: '#333', fontSize: 18, fontWeight: '600' },
    btnOutline: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, width: '100%', alignItems: 'center' },
    btnTextOutline: { color: '#666', fontSize: 16 }
});
