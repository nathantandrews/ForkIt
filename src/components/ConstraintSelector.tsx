
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';

interface Props {
    options: string[];
    selected: string[];
    onToggle: (option: string) => void;
    type: 'dietary' | 'allergy';
}

export default function ConstraintSelector({ options, selected, onToggle, type }: Props) {
    const isAllergy = type === 'allergy';

    return (
        <View style={styles.container}>
            {options.map((option) => {
                const isSelected = selected.includes(option);
                return (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.row,
                            isSelected && (isAllergy ? styles.rowSelectedAllergy : styles.rowSelectedDietary)
                        ]}
                        onPress={() => onToggle(option)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.label,
                            isSelected && (isAllergy ? styles.labelSelectedAllergy : styles.labelSelectedDietary)
                        ]}>
                            {option}
                        </Text>

                        <View style={[
                            styles.checkbox,
                            isSelected && (isAllergy ? styles.checkboxSelectedAllergy : styles.checkboxSelectedDietary)
                        ]}>
                            {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    label: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#C7C7CC',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: -2,
    },
    // Dietary Styles
    rowSelectedDietary: {
        backgroundColor: '#E8F5E9', // Light green
        borderColor: '#4CAF50',
    },
    labelSelectedDietary: {
        color: '#2E7D32',
        fontWeight: '600',
    },
    checkboxSelectedDietary: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    // Allergy Styles
    rowSelectedAllergy: {
        backgroundColor: '#FFEBEE', // Light red
        borderColor: '#FF5252',
    },
    labelSelectedAllergy: {
        color: '#C62828',
        fontWeight: '600',
    },
    checkboxSelectedAllergy: {
        backgroundColor: '#FF5252',
        borderColor: '#FF5252',
    },
});
