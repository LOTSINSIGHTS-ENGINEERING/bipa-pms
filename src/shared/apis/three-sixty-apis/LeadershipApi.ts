import {
    query,
    collection,
    updateDoc,
    doc,
    where,
    arrayUnion, deleteDoc, onSnapshot, Unsubscribe, setDoc} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../../config/firebase-config";
// import { MAIL_EMAIL } from "../../functions/mailMessages";
import {ILeadership} from "../../models/three-sixty-feedback-models/Leadership";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { ILeadershipRatingScores } from "../../models/three-sixty-feedback-models/LeadershipRatingScores";
import { ILeadershipRating } from "../../models/three-sixty-feedback-models/LeadershipRating";

export default class LeadershipApi {
    static fetchLeadershipRatings() {
      throw new Error("Method not implemented.");
    }
    fetchLeadershipRatings() {
      throw new Error("Method not implemented.");
    }
    constructor(private api: AppApi, private store: AppStore) { }

    private generalPath() {
        return "leadership";
    }

    async create(object: ILeadership) {

        const path = this.generalPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        object.id = itemRef.id;
        try {
            await setDoc(itemRef, object, { merge: true, })
        } catch (error) {
        }
    }

    async update(object: ILeadership) {

        const path = this.generalPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, object.id), {
                ...object,
            });
            this.store.leadership.load([object]);
        } catch (error) {
            console.log(error);

        }
    }
    async updateLeadershipScore(object: ILeadershipRating, uid: string ,leadershipScore:ILeadershipRatingScores) {
        const myPath = `LeadershipRating/${uid}/UserRating`;
        const chatDocRef = doc(db, `PrivateMessages/${uid}`);
        await setDoc(chatDocRef, { id: uid , leadershipScore: leadershipScore.totalLeadershipScore}, { merge: true });
  
        try {
          await updateDoc(doc(db, myPath, object.id), {
            ...object,
          });
    
          this.store.leadershipRating.load([object]);
        } catch (error) { }
    }
    async delete(object: ILeadership) {

        const path = this.generalPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, object.id));
            this.store.value.remove(object.id);
        } catch (error) { }
    }

    async getAll() {

        this.store.leadership.removeAll();

        const path = this.generalPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const object: ILeadership[] = [];
                querySnapshot.forEach((doc) => {
                    object.push({ id: doc.id, ...doc.data() } as ILeadership);
                });
                this.store.leadership.load(object);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });

    }
    
}



