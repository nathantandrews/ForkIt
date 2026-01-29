
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CUISINES } from '../data/constants';

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
                        <Text style={[styles.label, isSelected && styles.labelSelected]}>
                            {cuisine}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const { width } = Dimensions.get('window');
const GAP = 10;
const ITEM_WIDTH = (width - 40 - (GAP * 2)) / 3; // 3 columns, assuming 20px padding on container

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
        justifyContent: 'flex-start',
    },
    chip: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#E5E5EA',
        padding: 5,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    chipSelected: {
        backgroundColor: '#E3F2FD', // Light blue bg
        borderColor: '#007AFF',
    },
    icon: {
        fontSize: 24,
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        color: '#333',
        textAlign: 'center',
    },
    labelSelected: {
        color: '#007AFF', // Blue text
        fontWeight: '700',
    },
});
