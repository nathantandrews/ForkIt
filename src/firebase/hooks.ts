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
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [uid]);

    const updateProfile = async (newProfile: UserProfile) => {
        if (!uid) return;
        const ref = doc(db, 'users', uid);
        await setDoc(ref, {
            profile: newProfile,
            updatedAt: Date.now()
        }, { merge: true });
    };

    return { profile, loading, updateProfile };
};
