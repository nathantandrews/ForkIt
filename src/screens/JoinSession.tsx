import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useUserProfile } from '../firebase/hooks';
import { joinSession } from '../services/sessions';
import { theme } from '../utils/theme';

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
            <View style={styles.header}>
                <Text style={styles.icon}>🤝</Text>
                <Text style={styles.title}>Join Session</Text>
                <Text style={styles.desc}>Enter the 6-character group code</Text>
            </View>

            <TextInput
                style={styles.input}
                placeholder="ABC 123"
                placeholderTextColor={theme.colors.textMuted}
                value={code}
                onChangeText={t => setCode(t.toUpperCase().replace(/\s/g, ''))}
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect={false}
            />

            {joining ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.md }} />
            ) : (
                <TouchableOpacity style={styles.btn} onPress={handleJoin} activeOpacity={0.8}>
                    <Text style={styles.btnText}>Join Group</Text>
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
    input: {
        backgroundColor: theme.colors.surface,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.lg,
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.bold,
        letterSpacing: 8,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        color: theme.colors.textMain,
    },
    btn: {
        backgroundColor: theme.colors.textMain,
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
