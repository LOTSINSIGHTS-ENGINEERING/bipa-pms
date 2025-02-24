import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs, Unsubscribe } from "firebase/firestore";

import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IRateAssignment } from "../../models/three-sixty-feedback-models/RateAssignments";

export default class RatingAssignmentApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private generalPath() {
        return "ratingAssignment";
    }

    async create(object: IRateAssignment) {
        const path = this.generalPath();
        if (!path) return;

        try {
            const itemRef = doc(collection(db, path));
            object.id = itemRef.id;
            await setDoc(itemRef, object, { merge: true });
        } catch (error) {
            console.error("Error creating rating assignment:", error);
        }
    }

    async update(object: IRateAssignment) {
        const path = this.generalPath();
        if (!path || !object.id) return;

        try {
            await updateDoc(doc(db, path, object.id), { ...object });
            this.store.ratingAssignments.load([object]);
        } catch (error) {
            console.error("Error updating rating assignment:", error);
        }
    }

    async delete(object: IRateAssignment) {
        const path = this.generalPath();
        if (!path || !object.id) return;

        try {
            await deleteDoc(doc(db, path, object.id));
            this.store.ratingAssignments.remove(object.id);
        } catch (error) {
            console.error("Error deleting rating assignment:", error);
        }
    }

    async getAll(): Promise<Unsubscribe | void> {
        const path = this.generalPath();
        if (!path) return;

        const $query = query(collection(db, path));

        try {
            return await new Promise<Unsubscribe>((resolve, reject) => {
                const unsubscribe = onSnapshot($query, (querySnapshot) => {
                    const assignments: IRateAssignment[] = [];
                    querySnapshot.forEach((doc) => {
                        assignments.push({ id: doc.id, ...doc.data() } as IRateAssignment);
                    });
                    this.store.ratingAssignments.load(assignments);
                    resolve(unsubscribe);
                }, (error) => {
                    reject(error);
                });
            });
        } catch (error) {
            console.error("Error fetching rating assignments:", error);
        }
    }

    async hasActiveTerm(): Promise<boolean> {
        const path = this.generalPath();
        if (!path) return false;

        try {
            const $query = query(collection(db, path), where("midtermReview.status", "==", "In Progress"));
            const querySnapshot = await getDocs($query);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error checking active term:", error);
            return false;
        }
    }
}
