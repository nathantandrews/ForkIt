import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useUserProfile } from '../firebase/hooks';
import { createSession } from '../services/sessions';
import { theme } from '../utils/theme';

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
            <View style={styles.header}>
                <Text style={styles.icon}>✨</Text>
                <Text style={styles.title}>New Session</Text>
                <Text style={styles.desc}>You will be the host.</Text>
            </View>

            {creating ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : (
                <TouchableOpacity style={styles.btn} onPress={handleCreate} activeOpacity={0.8}>
                    <Text style={styles.btnText}>Create & Enter Lobby</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.background,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    icon: {
        fontSize: theme.typography.sizes.hero,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textMain,
        marginBottom: theme.spacing.sm,
    },
    desc: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    btn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    btnText: {
        color: '#fff',
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold,
    }
});
