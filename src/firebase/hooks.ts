import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '../types/models';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            if (u) {
                setUser(u);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return { user, loading };
};

export const useUserProfile = (uid: string | undefined) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState<string>('');

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }

        const ref = doc(db, 'users', uid);
        const unsubscribe = onSnapshot(ref, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfile(data.profile as UserProfile);
                setDisplayName(data.displayName || data.email?.split('@')[0] || 'User');
            } else {
                setProfile(null);
                setDisplayName('');
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching user profile:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, [uid]);

    const updateProfile = async (newProfile: UserProfile) => {
        if (!uid) {
            throw new Error('No user ID provided');
        }
        const ref = doc(db, 'users', uid);
        try {
            await setDoc(ref, {
                profile: newProfile,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const updateDisplayName = async (newDisplayName: string) => {
        if (!uid) {
            throw new Error('No user ID provided');
        }
        const ref = doc(db, 'users', uid);
        try {
            await setDoc(ref, {
                displayName: newDisplayName,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating display name:', error);
            throw error;
        }
    };

    return { profile, loading, displayName, updateProfile, updateDisplayName };
};
