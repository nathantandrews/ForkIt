import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
    selectedPrices: number[]; // Array of selected prices
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
        gap: 10,
    },
    option: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    optionSelected: {
        backgroundColor: '#FFF8E1', // Light Gold/Yellow
        borderColor: '#FFC107',
    },
    text: {
        fontSize: 18,
        fontWeight: '600',
        color: '#8E8E93',
    },
    textSelected: {
        color: '#FF8F00',
        fontWeight: '800',
    }
});