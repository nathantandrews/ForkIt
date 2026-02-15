import { doc, updateDoc, arrayUnion, arrayRemove, runTransaction, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Vote } from '../types/models';

const getVoteRef = (sessionId: string, restaurantId: string) =>
    doc(db, "sessions", sessionId, "votes", restaurantId);

export const castVote = async (sessionId: string, restaurantId: string, uid: string, type: 'approve' | 'veto' | 'neutral') => {
    const voteRef = getVoteRef(sessionId, restaurantId);

    await runTransaction(db, async (transaction) => {
        const voteDoc = await transaction.get(voteRef);

        let approvals: string[] = [];
        let vetoes: string[] = [];

        if (voteDoc.exists()) {
            const data = voteDoc.data() as Vote;
            approvals = data.approvals || [];
            vetoes = data.vetoes || [];
        }

        // Remove from both first
        const newApprovals = approvals.filter(id => id !== uid);
        const newVetoes = vetoes.filter(id => id !== uid);

        if (type === 'approve') {
            newApprovals.push(uid);
        } else if (type === 'veto') {
            newVetoes.push(uid);
        }

        transaction.set(voteRef, {
            restaurantId,
            approvals: newApprovals,
            vetoes: newVetoes,
            updatedAt: Date.now()
        }, { merge: true });
    });
};

export const subscribeToVotes = (sessionId: string, restaurantId: string, onUpdate: (vote: Vote) => void) => {
    return onSnapshot(getVoteRef(sessionId, restaurantId), (docSnap) => {
        if (docSnap.exists()) {
            onUpdate(docSnap.data() as Vote);
        } else {
            onUpdate({ restaurantId, approvals: [], vetoes: [] });
        }
    });
};

// NEW: Listen to all votes for the entire session efficiently
export const subscribeToSessionVotes = (sessionId: string, onUpdate: (votes: Record<string, Vote>) => void) => {
    const colRef = collection(db, "sessions", sessionId, "votes");
    return onSnapshot(colRef, (snapshot) => {
        const allVotes: Record<string, Vote> = {};
        snapshot.forEach((doc) => {
            allVotes[doc.id] = doc.data() as Vote;
        });
        onUpdate(allVotes);
    });
};

export const finalizeSession = async (sessionId: string, restaurantId: string, restaurant: any) => {
    // Clean the restaurant object by removing undefined values and converting to plain object
    const cleanRestaurant = JSON.parse(JSON.stringify(restaurant || {}));
    
    console.log('Finalizing with cleaned restaurant:', cleanRestaurant);
    
    await updateDoc(doc(db, "sessions", sessionId), {
        status: "finalized",
        finalizedRestaurantId: restaurantId,
        finalizedRestaurant: cleanRestaurant
    });
};