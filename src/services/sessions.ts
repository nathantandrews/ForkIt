import {
    collection, doc, setDoc, getDocs, query, where,
    updateDoc, arrayUnion, onSnapshot, serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Session, UserProfile, SessionMember } from '../types/models';

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
    const sessionId = code; // Using code as ID for simplicity, or generate separate ID. 
    // Let's use separate ID to avoid collisions if we wanted, but for MVP code as ID is easiest 
    // PROVIDING we check for collision.
    // For this prototype, we'll assume low collision or just use auto-id and store code field.
    // Let's use auto-id for doc, and query by code.

    const sessionRef = doc(collection(db, "sessions"));
    const now = Date.now();

    const hostMember: SessionMember = {
        uid: hostUid,
        joinedAt: now,
        profileSnapshot: hostProfile
    };

    const newSession: Session = {
        id: sessionRef.id,
        code: code,
        hostUid: hostUid,
        status: "open",
        context: {
            timeOfDay: "dinner", // default
            now: now,
            location: { lat: 37.7749, lng: -122.4194 } // default SF
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

    // Add to members
    const member: SessionMember = {
        uid,
        joinedAt: Date.now(),
        profileSnapshot: profile
    };

    // Run as transaction or batch ideally, but sequential is fine for MVP
    await setDoc(doc(db, "sessions", sessionId, "members", uid), member);

    // Update memberUids array on main doc for easy count/access
    await updateDoc(doc(db, "sessions", sessionId), {
        memberUids: arrayUnion(uid)
    });

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
