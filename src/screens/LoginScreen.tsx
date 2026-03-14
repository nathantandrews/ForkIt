
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

import { theme } from '../utils/theme';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            Alert.alert("Login Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>🍴</Text>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue your food journey</Text>
            </View>

            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={theme.colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={theme.colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.md }} />
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.linkButton}>
                    <Text style={styles.linkText}>
                        Don't have an account? <Text style={styles.linkTextHighlight}>Sign Up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logo: {
        fontSize: theme.typography.sizes.hero,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textMain,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.radii.md,
        marginBottom: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.textMain,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    buttonText: {
        color: '#fff',
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold,
    },
    linkButton: {
        marginTop: theme.spacing.xl,
        alignItems: 'center',
    },
    linkText: {
        color: theme.colors.textMuted,
        fontSize: theme.typography.sizes.md,
    },
    linkTextHighlight: {
        color: theme.colors.primary,
        fontWeight: theme.typography.weights.semibold,
    },
});
