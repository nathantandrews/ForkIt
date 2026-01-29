import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth, useUserProfile } from '../firebase/hooks';
import ProfileForm from '../components/ProfileForm';
import { UserProfile } from '../types/models';

export default function ProfileSetup() {
    const { user } = useAuth();
    const { profile, loading, updateProfile } = useUserProfile(user?.uid);
    const navigation = useNavigation<any>();

    const handleSave = async (newProfile: UserProfile) => {
        try {
            await updateProfile(newProfile);
            Alert.alert("Success", "Profile saved!");
            navigation.navigate("Home");
        } catch (e) {
            Alert.alert("Error", "Failed to save profile.");
        }
    };

    return (
        <View style={styles.container}>
            <ProfileForm
                initialProfile={profile}
                onSave={handleSave}
                loading={loading && !profile} // Only load if full initial load
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' }
});
