import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

interface Props {
    selectedPrices: number[]; //array of selected prices
    onToggle: (price: number) => void;
}

const PRICES = [1, 2, 3, 4];

export default function PriceSelector({ selectedPrices, onToggle }: Props) {
    return (
        <View style={styles.container}>
            {PRICES.map((price) => {
                const isSelected = selectedPrices.includes(price);
                return (
                    <TouchableOpacity
                        key={price}
                        style={[styles.option, isSelected && styles.optionSelected]}
                        onPress={() => onToggle(price)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.text, isSelected && styles.textSelected]}>
                            {'$'.repeat(price)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
    },
    option: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radii.lg,
        backgroundColor: theme.colors.surface,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    optionSelected: {
        backgroundColor: theme.colors.primaryLight + '20',
        borderColor: theme.colors.primary,
        ...theme.shadows.sm,
    },
    text: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.textMuted,
    },
    textSelected: {
        color: theme.colors.primaryDark,
        fontWeight: theme.typography.weights.bold,
    }
});