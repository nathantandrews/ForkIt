import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

interface Props {
    label: string;
    value: number; //1-10
    onSelect: (val: number) => void;
}

export default function ImportanceSelector({ label, value, onSelect }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}<Text style={styles.valueMax}>/10</Text></Text>
            </View>
            <View style={styles.barContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isActive = num <= value;
                    return (
                        <TouchableOpacity
                            key={num}
                            style={[
                                styles.segment,
                                isActive && styles.segmentActive,
                                num === value && styles.segmentCurrent
                            ]}
                            onPress={() => onSelect(num)}
                            activeOpacity={0.7}
                        />
                    );
                })}
            </View>
            <View style={styles.legend}>
                <Text style={styles.legendText}>Not Important</Text>
                <Text style={styles.legendText}>Very Important</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
        alignItems: 'baseline',
    },
    label: {
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.textMain,
    },
    value: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.bold,
        color: theme.colors.primary,
    },
    valueMax: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.medium,
    },
    barContainer: {
        flexDirection: 'row',
        height: 32,
        gap: 4,
    },
    segment: {
        flex: 1,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radii.sm,
    },
    segmentActive: {
        backgroundColor: theme.colors.primaryLight,
    },
    segmentCurrent: {
        backgroundColor: theme.colors.primary,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xs,
    },
    legendText: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.medium,
    }
});