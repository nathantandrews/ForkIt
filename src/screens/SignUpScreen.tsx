
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

import { theme } from '../utils/theme';

export default function SignUpScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        setLoading(true);
        try {
            // 1. Create User Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create User Document in Firestore with proper UserProfile structure
            const defaultProfile = {
                hard: {
                    allergies: [],
                    dietary: []
                },
                soft: {
                    likedCuisines: [],
                    dislikedCuisines: [],
                    distancePreference: "balanced" as const
                },
                weights: {
                    cuisine: 3,
                    price: 3,
                    distance: 3
                }
            };

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.email?.split('@')[0] || 'User',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                profile: defaultProfile
            });

            // 3. Navigate (auth listener will handle navigation)
            // User will be redirected to ProfileSetup to complete their profile
        } catch (error: any) {
            Alert.alert("Sign Up Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>👋</Text>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join ForkIt to start grouping up!</Text>
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
                    <TouchableOpacity style={styles.button} onPress={handleSignUp} activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkButton}>
                    <Text style={styles.linkText}>
                        Already have an account? <Text style={styles.linkTextHighlight}>Login</Text>
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
