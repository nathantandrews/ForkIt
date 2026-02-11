import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
    value: number; // 1-10
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

    // Calculate percentage for the visual bar (0% to 100%)
    const fillPercent = ((value - 1) / 9) * 100;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>{label || "Importance"}</Text>
                <Text style={styles.value}>{value}/10</Text>
            </View>

            <View style={styles.controlsRow}>
                {/* Left Arrow */}
                <TouchableOpacity 
                    style={[styles.button, value === 1 && styles.buttonDisabled]} 
                    onPress={handleDecrement}
                    disabled={value === 1}
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
        marginTop: 15,
        marginBottom: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    buttonDisabled: {
        opacity: 0.3,
        backgroundColor: '#fff',
    },
    buttonText: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: 'bold',
        marginTop: -2, // Center visually
    },
    textDisabled: {
        color: '#999',
    },
    barContainer: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
    },
    trackBackground: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E5EA',
        width: '100%',
        overflow: 'hidden',
    },
    trackFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 4,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        paddingHorizontal: 50, // Indent to align with bar starts
    },
    legendText: {
        fontSize: 10,
        color: '#8E8E93',
    }
});