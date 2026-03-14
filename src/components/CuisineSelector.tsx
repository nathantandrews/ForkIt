import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CUISINES } from '../data/constants';
import { theme } from '../utils/theme';

interface Props {
    selectedCuisines: string[];
    onToggle: (cuisine: string) => void;
}

const CUISINE_ICONS: Record<string, string> = {
    "American": "🍔", "Italian": "🍝", "Mexican": "🌮", "Japanese": "🍣",
    "Chinese": "🥡", "Thai": "🍜", "Indian": "🍛", "Mediterranean": "🥙",
    "Greek": "🇬🇷", "French": "🇫🇷", "Korean": "🥘", "Vietnamese": "🍲",
    "Burgers": "🍔", "Pizza": "🍕", "Sushi": "🍣", "Steakhouse": "🥩",
    "Seafood": "🦞", "Vegan": "🥗"
};

const { width } = Dimensions.get('window');
const GAP = theme.spacing.sm;
const ITEM_WIDTH = Math.floor((width - (theme.spacing.xl * 2) - (GAP * 2)) / 3);

export default function CuisineSelector({ selectedCuisines, onToggle }: Props) {
    return (
        <View style={styles.grid}>
            {CUISINES.map((cuisine) => {
                const isSelected = selectedCuisines.includes(cuisine);
                return (
                    <TouchableOpacity
                        key={cuisine}
                        style={[styles.chip, isSelected && styles.chipSelected]}
                        onPress={() => onToggle(cuisine)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.icon}>{CUISINE_ICONS[cuisine] || "🍽️"}</Text>
                        <Text
                            style={[styles.label, isSelected && styles.labelSelected]}
                            numberOfLines={1}
                            adjustsFontSizeToFit //ensures text like "Mediterranean" fits
                        >
                            {cuisine}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
        justifyContent: 'flex-start',
    },
    chip: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 0.85,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radii.lg,
        backgroundColor: theme.colors.surface,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        padding: theme.spacing.xs,
        ...theme.shadows.sm,
    },
    chipSelected: {
        backgroundColor: theme.colors.primaryLight + '20',
        borderColor: theme.colors.primary,
        ...theme.shadows.md,
    },
    icon: {
        fontSize: theme.typography.sizes.xl,
        marginBottom: theme.spacing.xs,
    },
    label: {
        fontSize: theme.typography.sizes.xs,
        fontWeight: theme.typography.weights.medium,
        color: theme.colors.textMain,
        textAlign: 'center',
    },
    labelSelected: {
        color: theme.colors.primaryDark,
        fontWeight: theme.typography.weights.bold,
    },
});