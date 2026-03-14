import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

interface Props {
    value: number; //1-10
    onValueChange: (val: number) => void;
    label?: string;
}

export default function WeightedSlider({ value, onValueChange, label }: Props) {

    const handleDecrement = () => {
        if (value > 1) onValueChange(value - 1);
    };

    const handleIncrement = () => {
        if (value < 10) onValueChange(value + 1);
    };

    //calculate percentage for the visual bar (0% to 100%)
    const fillPercent = ((value - 1) / 9) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>{label || "Importance"}</Text>
                <Text style={styles.value}>{value}<Text style={styles.valueMax}>/10</Text></Text>
            </View>

            <View style={styles.controlsRow}>
                {/* Left Arrow */}
                <TouchableOpacity
                    style={[styles.button, value === 1 && styles.buttonDisabled]}
                    onPress={handleDecrement}
                    disabled={value === 1}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.buttonText, value === 1 && styles.textDisabled]}>◀</Text>
                </TouchableOpacity>

                {/* Visual Bar (Display Only) */}
                <View style={styles.barContainer}>
                    <View style={styles.trackBackground}>
                        <View style={[styles.trackFill, { width: `${fillPercent}%` }]} />
                    </View>
                </View>

                {/* Right Arrow */}
                <TouchableOpacity
                    style={[styles.button, value === 10 && styles.buttonDisabled]}
                    onPress={handleIncrement}
                    disabled={value === 10}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.buttonText, value === 10 && styles.textDisabled]}>▶</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.legend}>
                <Text style={styles.legendText}>Low</Text>
                <Text style={styles.legendText}>Critical</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.xs,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
        alignItems: 'center',
    },
    label: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMain,
        fontWeight: theme.typography.weights.semibold,
    },
    value: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.black,
        color: theme.colors.primary,
    },
    valueMax: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.medium,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: theme.radii.round,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buttonDisabled: {
        backgroundColor: theme.colors.background,
        borderColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.primary,
        fontWeight: theme.typography.weights.bold,
    },
    textDisabled: {
        color: theme.colors.border,
    },
    barContainer: {
        flex: 1,
        height: 44,
        justifyContent: 'center',
    },
    trackBackground: {
        height: 10,
        borderRadius: theme.radii.round,
        backgroundColor: theme.colors.border,
        width: '100%',
        overflow: 'hidden',
    },
    trackFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radii.round,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.xs,
        paddingHorizontal: 54,
    },
    legendText: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textMuted,
        fontWeight: theme.typography.weights.medium,
    }
});