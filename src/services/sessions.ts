import {
    collection, doc, setDoc, getDocs, query, where,
    updateDoc, arrayUnion, onSnapshot, serverTimestamp,
    Timestamp, getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Session, UserProfile, SessionMember } from '../types/models';
import { getCurrentLocation } from './location';

// Generate a random 6-character code
const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export const createSession = async (hostUid: string, hostProfile: UserProfile): Promise<string> => {
    const code = generateCode();
    const sessionRef = doc(collection(db, "sessions"));
    const now = Date.now();

    // Get current location
    let location = { lat: 37.7749, lng: -122.4194 }; // Default SF
    try {
        const currentLoc = await getCurrentLocation();
        location = { lat: currentLoc.lat, lng: currentLoc.lon };
        console.log('Using current location:', location);
    } catch (error) {
        console.warn('Could not get current location, using default SF:', error);
    }

    // Fetch host's display name from Firestore
    const userDoc = await getDoc(doc(db, "users", hostUid));
    const displayName = userDoc.exists() ? userDoc.data().displayName || 'User' : 'User';

    const hostMember: SessionMember = {
        uid: hostUid,
        joinedAt: now,
        profileSnapshot: hostProfile,
        displayName: displayName
    };

    const newSession: Session = {
        id: sessionRef.id,
        code: code,
        hostUid: hostUid,
        status: "open",
        context: {
            timeOfDay: "dinner", // default
            now: now,
            location: location,
            radius: 5000 // 5km in meters
        },
        memberUids: [hostUid],
    };

    await setDoc(sessionRef, newSession);

    // Add host to members subcollection
    await setDoc(doc(db, "sessions", sessionRef.id, "members", hostUid), hostMember);

    return sessionRef.id;
};

export const joinSession = async (code: string, uid: string, profile: UserProfile): Promise<string> => {
    const q = query(collection(db, "sessions"), where("code", "==", code.toUpperCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        throw new Error("Session not found");
    }

    const sessionDoc = snapshot.docs[0];
    const sessionId = sessionDoc.id;
    const sessionData = sessionDoc.data() as Session;

    if (sessionData.status === "finalized") {
        throw new Error("Session is closed");
    }

    // Fetch user's display name from Firestore
    const userDoc = await getDoc(doc(db, "users", uid));
    const displayName = userDoc.exists() ? userDoc.data().displayName || 'User' : 'User';

    // Add to members
    const member: SessionMember = {
        uid,
        joinedAt: Date.now(),
        profileSnapshot: profile,
        displayName: displayName
    };

    // Run as transaction or batch ideally, but sequential is fine for MVP
    try {
        console.log("Adding member to subcollection:", sessionId, uid);
        await setDoc(doc(db, "sessions", sessionId, "members", uid), member);
        
        console.log("Updating memberUids array");
        await updateDoc(doc(db, "sessions", sessionId), {
            memberUids: arrayUnion(uid)
        });
    } catch (error: any) {
        console.error("Error in joinSession:", error.code, error.message);
        throw error;
    }

    return sessionId;
};

export const subscribeToSession = (sessionId: string, onUpdate: (session: Session | null) => void) => {
    return onSnapshot(doc(db, "sessions", sessionId), (doc) => {
        if (doc.exists()) {
            onUpdate(doc.data() as Session);
        } else {
            onUpdate(null);
        }
    });
};

export const subscribeToMembers = (sessionId: string, onUpdate: (members: SessionMember[]) => void) => {
    return onSnapshot(collection(db, "sessions", sessionId, "members"), (snapshot) => {
        const members = snapshot.docs.map(d => d.data() as SessionMember);
        onUpdate(members);
    });
};

export const updateSessionStatus = async (sessionId: string, status: string) => {
    await updateDoc(doc(db, "sessions", sessionId), { status });
};
