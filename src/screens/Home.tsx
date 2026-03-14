import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { theme } from '../utils/theme';

export default function Home() {
    const navigation = useNavigation<any>();

    const handleSignOut = () => {
        signOut(auth).catch((error) => console.error('Sign out error', error));
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ForkIt <Text style={styles.logoIcon}>🍴</Text></Text>
                <Text style={styles.subtitle}>Group dining decisions made easy.</Text>
            </View>

            <View style={styles.cardsContainer}>
                <TouchableOpacity
                    style={[styles.card, styles.primaryCard]}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('CreateSession')}
                >
                    <View style={styles.cardIconContainer}>
                        <Text style={styles.cardIcon}>✨</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, styles.primaryCardText]}>Start New Session</Text>
                        <Text style={[styles.cardSubtitle, styles.primaryCardTextOpaque]}>Host a new group decision</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('JoinSession')}
                >
                    <View style={[styles.cardIconContainer, styles.secondaryIconContainer]}>
                        <Text style={styles.cardIcon}>🤝</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Join Session</Text>
                        <Text style={styles.cardSubtitle}>Enter a code from a friend</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('ProfileSetup')}
                >
                    <View style={[styles.cardIconContainer, styles.secondaryIconContainer]}>
                        <Text style={styles.cardIcon}>👤</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>My Food Profile</Text>
                        <Text style={styles.cardSubtitle}>Update your preferences</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xxl + theme.spacing.xl,
    },
    header: {
        marginBottom: theme.spacing.xxl,
    },
    title: {
        fontSize: theme.typography.sizes.xxl + 4,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textMain,
        marginBottom: theme.spacing.xs,
    },
    logoIcon: {
        fontSize: theme.typography.sizes.xxl,
    },
    subtitle: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.medium,
    },
    cardsContainer: {
        gap: theme.spacing.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
        borderRadius: theme.radii.xl,
        ...theme.shadows.md,
    },
    primaryCard: {
        backgroundColor: theme.colors.primary,
    },
    cardIconContainer: {
        width: 50,
        height: 50,
        borderRadius: theme.radii.round,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    secondaryIconContainer: {
        backgroundColor: theme.colors.surface,
    },
    cardIcon: {
        fontSize: theme.typography.sizes.xl,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textMain,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
    },
    primaryCardText: {
        color: '#fff',
    },
    primaryCardTextOpaque: {
        color: 'rgba(255, 255, 255, 0.8)',
    },
    signOutButton: {
        marginTop: 'auto',
        paddingVertical: theme.spacing.lg,
        alignItems: 'center',
    },
    signOutText: {
        color: theme.colors.error,
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.semibold,
    },
});
