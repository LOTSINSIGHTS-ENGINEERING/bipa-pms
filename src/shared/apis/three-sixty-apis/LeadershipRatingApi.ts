import {
  Firestore,
  Query,
    Unsubscribe,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    updateDoc,CollectionReference
  } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppApi from "../AppApi";
import AppStore from "../../stores/AppStore";
import { ILeadershipRating } from "../../models/three-sixty-feedback-models/LeadershipRating";


  export default class LeadershipRatingApi {
    constructor(private api: AppApi, private store: AppStore) {}

    async getAll(uid: string, description: string) {
      const myPath = `LeadershipRating/${description}/user/${uid}/ratings`;

      const $query = query(collection(db, myPath));
      // new promise
      return await new Promise<Unsubscribe>((resolve, reject) => {
        // on snapshot
        const unsubscribe = onSnapshot(
          $query,
          // onNext
          (querySnapshot) => {
            const items: ILeadershipRating[] = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() } as ILeadershipRating);
            });

            this.store.leadershipRating.load(items);
            resolve(unsubscribe);
          },
          // onError
          (error) => {
            reject();
          }
        );
      });
    }

async getAllNew(uids: string[], description: string): Promise<Unsubscribe[]> {
    const unsubscribePromises: Promise<Unsubscribe>[] = [];

    for (const uid of uids) {
      const myPath = `LeadershipRating/${description}/user/${uid}/ratings`;
      const $query = query(collection(db, myPath));

      const promise = new Promise<Unsubscribe>((resolve, reject) => {
        const unsubscribe = onSnapshot(
          $query,
          (querySnapshot) => {
            const items: ILeadershipRating[] = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() } as ILeadershipRating);
            });
            this.store.leadershipRating.load(items);
            resolve(unsubscribe);
          },
          (error) => {
            console.error(`Error fetching ratings for user ${uid}:`, error);
            reject(error);
          }
        );
      });

      unsubscribePromises.push(promise);
    }

    return await Promise.all(unsubscribePromises);
  }





    async getById(id: string, pid: string, uid: string, description: string) {
      const myPath = `LeadershipRating/${description}/${uid}`;

      const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
        if (!doc.exists) return;
        const item = { id: doc.id, ...doc.data() } as ILeadershipRating;

        this.store.leadershipRating.load([item]);
      });

      return unsubscribe;
    }

 
    async getAllLeadershipRatings(description: string, userUids: string[]) {
      const leadershipRatings: ILeadershipRating[] = [];

      for (const uid of userUids) {
        const myPath = `LeadershipRating/${description}/user/${uid}/ratings`;
        const ratingQuerySnapshot = await getDocs(collection(db, myPath));

        ratingQuerySnapshot.forEach((ratingDoc) => {
          const ratingData = ratingDoc.data();
          const leadershipRating: ILeadershipRating = {
            id: ratingDoc.id,
            overallRating: ratingData.overallRating,
            rateeId: ratingData.rateeId,
            dimension: ratingData.dimension,
            criteria: ratingData.values,
            date: ratingData.date,
            isflagged: false,
            department: "",
            description: "",
          };
          leadershipRatings.push(leadershipRating);
        });
      }

      return leadershipRatings;
    }
    async create(item: ILeadershipRating, uid: string, description: string) {
      const myPath = `LeadershipRating/${description}/user/${uid}/ratings`;

      const itemRef = doc(collection(db, myPath));
      item.id = itemRef.id;

      // create in db
      try {
        await setDoc(itemRef, item, {
          merge: true,
        });
        // create in store
        this.store.leadershipRating.load([item]);
      } catch (error) {
        console.log(error);
      }
    }

    async update(object: ILeadershipRating, uid: string, description: string) {
      const myPath = `LeadershipRating/${description}/user/${uid}/ratings`;
      try {
        await updateDoc(doc(db, myPath, object.id), {
          ...object,
        });
        this.store.leadershipRating.load([object]);
      } catch (error) {
        console.log("An error ocurred " + error);
      }
    }

    async delete(id: string, uid: string, description: string) {
      const myPath = `LeadershipRating/${description}/${uid}`;
      try {
        await deleteDoc(doc(db, myPath, id));
        this.store.leadershipRating.remove(id);
      } catch (error) {
        console.log(error);
      }
    }
 

    async deleteAllLeadershipRatings(uids: string[], description: string): Promise<void[]> {
      const deletePromises: Promise<void>[] = [];
    
      for (const uid of uids) {
        const myPath = `LeadershipRating/${description}/user/${uid}/ratings`;
        const ratingsRef = collection(db, myPath);
    
        // Create a promise to delete all ratings for the current user
        const deletePromise = new Promise<void>(async (resolve, reject) => {
          try {
            const querySnapshot = await getDocs(ratingsRef);
            const ratingDeletePromises: Promise<void>[] = [];
    
            // Iterate through each document in the ratings collection and delete
            querySnapshot.forEach((doc) => {
              const ratingDocRef = doc.ref;
              ratingDeletePromises.push(deleteDoc(ratingDocRef));
            });
    
            // Wait for all rating deletions to complete
            await Promise.all(ratingDeletePromises);
            
            // Resolve once all ratings for this user are deleted
            resolve();
          } catch (error) {
            console.error(`Error deleting ratings for user ${uid}:`, error);
            reject(error);
          }
        });
    
        deletePromises.push(deletePromise);
      }
    
      // Wait for all deletions to complete for all users
      return await Promise.all(deletePromises);
    }
    
    
  
    
    
    
    
  
 
  
 
  }
  