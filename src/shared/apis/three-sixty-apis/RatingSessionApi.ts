import {
  query,
  collection,
  updateDoc,
  doc,

  deleteDoc,
  onSnapshot,
  Unsubscribe,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
 
} from "firebase/storage";
import { db, storage } from "../../config/firebase-config";
// import { MAIL_EMAIL } from "../../functions/mailMessages";
import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";

import { IRatingSession } from "../../models/three-sixty-feedback-models/RatingSession";


export default class RatingSessionApi {
  constructor(private api: AppApi, private store: AppStore) {}

  private generalPath() {
    return "ratingSessions";
  }

  async getSessionById(id: string): Promise<IRatingSession | undefined> {
    const path = this.generalPath();
    if (!path) return undefined;
  
    const docRef = doc(db, path, id);
    const docSnapshot = await getDoc(docRef);
  
    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() } as IRatingSession;
    } else {
      return undefined;
    }
  }
  

  async create(object: IRatingSession) {
    const path = this.generalPath();
    if (!path) return;
  
    // Check if a session with the same id already exists
    const existingSession = await this.getSessionById(object.id);
    if (existingSession) {
      // Update the existing session instead of creating a new one
      await this.update(existingSession);
      return;
    }
  
    const itemRef = doc(collection(db, path));
    object.id = itemRef.id;
    try {
      await setDoc(itemRef, object, { merge: true });
    } catch (error) {}
  }
  

  async update(object: IRatingSession) {
    const path = this.generalPath();
    if (!path) return;
  
    try {
      console.log("Updating document at path:", path); // Log the path
      await updateDoc(doc(db, path, object.id), {
        ...object,
      });
      console.log("Document updated successfully:", object); // Log success
      this.store.ratingSession.load([object]);
    } catch (error) {
      console.error("Error updating document:", error); // Log error
    }
  }  

  async delete(object: IRatingSession) {
    const path = this.generalPath();
    if (!path) return;

    try {
      await deleteDoc(doc(db, path, object.id));
      this.store.ratingSession.remove(object.id);
    } catch (error) {}
  }

  async getAll() {
    this.store.ratingSession.removeAll();
  
    const path = this.generalPath();
    if (!path) return;
  
    const $query = query(collection(db, path));
  
    return await new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const object: IRatingSession[] = [];
          const uniqueSessions = new Set<string>();
  
          querySnapshot.forEach((doc) => {
            const session = {
              id: doc.id,
              ...doc.data(),
            } as IRatingSession;
  
            // Check if the session is a duplicate
            if (!uniqueSessions.has(session.id)) {
              uniqueSessions.add(session.id);
              object.push(session);
            }
          });
  
          this.store.ratingSession.load(object);
          resolve(unsubscribe);
        },
        (error) => {
          reject();
        }
      );
    });
  }
}
