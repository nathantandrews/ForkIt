import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../types/models';

export const getUserById = async (uid: string): Promise<User | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data() as User;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

export const updateUserProfile = async (uid: string, profile: UserProfile): Promise<void> => {
    try {
        await setDoc(doc(db, 'users', uid), {
            profile,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

export const updateUserDisplayName = async (uid: string, displayName: string): Promise<void> => {
    try {
        await setDoc(doc(db, 'users', uid), {
            displayName,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (error) {
        console.error('Error updating display name:', error);
        throw error;
    }
};
