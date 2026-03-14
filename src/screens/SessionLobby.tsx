import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Session, SessionMember } from '../types/models';
import { subscribeToSession, subscribeToMembers, updateSessionStatus } from '../services/sessions';
import { useAuth } from '../firebase/hooks';
import { theme } from '../utils/theme';

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

    useEffect(() => {
        if (session && session.status === "voting" && user?.uid !== session.hostUid) {
            navigation.replace("Recommendations", { sessionId });
        }
    }, [session?.status]);

    const handleStart = async () => {
        await updateSessionStatus(sessionId, "voting");
        navigation.replace("Recommendations", { sessionId });
    };

    if (!session) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const isHost = user?.uid === session.hostUid;

    return (
        <View style={styles.container}>
            <View style={styles.headerCard}>
                <Text style={styles.label}>SESSION CODE</Text>
                <TouchableOpacity onPress={() => Share.share({ message: `Join my ForkIt session: ${session.code}` })} activeOpacity={0.7}>
                    <Text style={styles.code}>{session.code}</Text>
                    <Text style={styles.shareHint}>Tap to share 🔗</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.membersHeader}>
                <Text style={styles.membersTitle}>Party Members</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{members.length}</Text>
                </View>
            </View>

            <FlatList
                data={members}
                keyExtractor={item => item.uid}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <View style={styles.memberCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.displayName ? item.displayName.charAt(0).toUpperCase() : '?'}
                            </Text>
                        </View>
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>
                                {item.uid === user?.uid ? "You" : (item.displayName || "Anonymous")}
                            </Text>
                            {item.uid === session.hostUid && (
                                <View style={styles.hostBadge}>
                                    <Text style={styles.hostBadgeText}>Host</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            />

            <View style={styles.footer}>
                {isHost ? (
                    <TouchableOpacity style={styles.btnPrimary} onPress={handleStart} activeOpacity={0.8}>
                        <Text style={styles.btnPrimaryText}>Start Matchmaking ✨</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.waitingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={styles.waitingText}>Waiting for host to start...</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.surface,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCard: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
        alignItems: 'center',
        borderBottomLeftRadius: theme.radii.xl,
        borderBottomRightRadius: theme.radii.xl,
        ...theme.shadows.sm,
        marginBottom: theme.spacing.xl,
    },
    label: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.bold,
        letterSpacing: 1.5,
        marginBottom: theme.spacing.sm,
    },
    code: {
        fontSize: theme.typography.sizes.hero,
        fontWeight: theme.typography.weights.black,
        color: theme.colors.primary,
        letterSpacing: 8,
        textAlign: 'center',
    },
    shareHint: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.primaryLight,
        textAlign: 'center',
        marginTop: theme.spacing.xs,
        fontWeight: theme.typography.weights.medium,
    },
    membersHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
        marginBottom: theme.spacing.md,
    },
    membersTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textMain,
    },
    badge: {
        backgroundColor: theme.colors.border,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.radii.round,
        marginLeft: theme.spacing.sm,
    },
    badgeText: {
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.textMain,
    },
    listContainer: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: 100, // accommodate footer
        gap: theme.spacing.sm,
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: theme.radii.lg,
        ...theme.shadows.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: theme.radii.round,
        backgroundColor: theme.colors.primaryLight + '30', // transparent primary
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    avatarText: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primaryDark,
    },
    memberInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    memberName: {
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.textMain,
    },
    hostBadge: {
        backgroundColor: theme.colors.secondary + '20',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.radii.sm,
    },
    hostBadgeText: {
        fontSize: theme.typography.sizes.xs,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.secondary,
        textTransform: 'uppercase',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
        paddingBottom: theme.spacing.xxl,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        ...theme.shadows.lg,
    },
    btnPrimary: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radii.md,
        alignItems: 'center',
        ...theme.shadows.md,
    },
    btnPrimaryText: {
        color: '#fff',
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
    },
    waitingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radii.md,
    },
    waitingText: {
        marginLeft: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.medium,
    }
});
