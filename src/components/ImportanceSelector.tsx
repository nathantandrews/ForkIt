import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
    label: string;
    value: number; // 1-10
    onSelect: (val: number) => void;
}

export default function ImportanceSelector({ label, value, onSelect }: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}/10</Text>
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
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    barContainer: {
        flexDirection: 'row',
        height: 30,
        gap: 4,
    },
    segment: {
        flex: 1,
        backgroundColor: '#E5E5EA',
        borderRadius: 4,
    },
    segmentActive: {
        backgroundColor: '#4CD964', // Greenish
    },
    segmentCurrent: {
        backgroundColor: '#34C759', // Darker green for the tip
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    legendText: {
        fontSize: 10,
        color: '#8E8E93',
    }
});