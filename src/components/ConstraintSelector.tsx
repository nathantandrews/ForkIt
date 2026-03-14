import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';

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
        gap: theme.spacing.xs,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.radii.lg,
        backgroundColor: theme.colors.surface,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    label: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.textMain,
        fontWeight: theme.typography.weights.medium,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: theme.radii.sm,
        borderWidth: 2,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    checkmark: {
        color: '#fff',
        fontSize: theme.typography.sizes.md,
        fontWeight: theme.typography.weights.bold,
        marginTop: -2,
    },
    //dietary Styles
    rowSelectedDietary: {
        backgroundColor: theme.colors.success + '15',
        borderColor: theme.colors.success,
    },
    labelSelectedDietary: {
        color: theme.colors.success,
        fontWeight: theme.typography.weights.bold,
    },
    checkboxSelectedDietary: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
    //allergy Styles
    rowSelectedAllergy: {
        backgroundColor: theme.colors.error + '15',
        borderColor: theme.colors.error,
    },
    labelSelectedAllergy: {
        color: theme.colors.error,
        fontWeight: theme.typography.weights.bold,
    },
    checkboxSelectedAllergy: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
    },
});
