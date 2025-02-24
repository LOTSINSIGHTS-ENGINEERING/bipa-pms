import {
  Unsubscribe,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppApi from "../AppApi";
import AppStore from "../../stores/AppStore";
import { IValueRating } from "../../models/three-sixty-feedback-models/ValueRating";
import { IValueRatingScores } from "../../models/three-sixty-feedback-models/ValueRatingScores";

export default class ValueRatingApi {
  constructor(private api: AppApi, private store: AppStore) {}

  async getAll(uid: string, description: string) {
    const myPath = `ValueRating/${description}/user/${uid}/ratings`;
    const $query = query(collection(db, myPath));
    // new promise
    return await new Promise<Unsubscribe>((resolve, reject) => {
      // on snapshot
      const unsubscribe = onSnapshot(
        $query,
        // onNext
        (querySnapshot) => {
          const items: IValueRating[] = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as IValueRating);
          });

          this.store.valueRating.load(items);
          resolve(unsubscribe);
        },
        // onError
        (error) => {
          reject();
        }
      );
    });
  }

 async  getAllNew(uids: string[], description: string): Promise<Unsubscribe[]> {
  const unsubscribePromises: Promise<Unsubscribe>[] = [];
  
  for (const uid of uids) {
    const myPath = `ValueRating/${description}/user/${uid}/ratings`;
    const $query = query(collection(db, myPath));

    const promise = new Promise<Unsubscribe>((resolve, reject) => {
      const unsubscribe = onSnapshot(
        $query,
        (querySnapshot) => {
          const items: IValueRating[] = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as IValueRating);
          });
          this.store.valueRating.load(items);
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




  async getById(id: string, uid: string, description: string) {
    const myPath = `ValueRating/${description}/${uid}`;

    const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IValueRating;

      this.store.valueRating.load([item]);
    });

    return unsubscribe;
  }

  // async getUserMessage(pid: string, uid: string) {
  //   const myPath = `BodyCoperate/${pid}/PrivateMessages/${uid}/`;
  //   const messageRef = collection(db, myPath, "UserMessage");
  //   const unsubscribe = onSnapshot(messageRef, (querySnapshot) => {
  //     const updatedMessages = querySnapshot.docs.map((doc) =>
  //       doc.data() as IPrivateMessage
  //     );
  //     this.store.communication.privateMessage.load([updatedMessages])
  //   });

  //   return () => unsubscribe();
  // }

  // async getUserMessage(pid: string, uid: string) {
  //   const myPath = `BodyCoperate/${pid}/PrivateMessages/${uid}/`;
  //   const messageRef = collection(db, myPath, "UserMessage");
  //   const unsubscribe = onSnapshot(messageRef, (querySnapshot) => {
  //     const updatedMessages = querySnapshot.docs.map((doc) => {
  //       const data = doc.data() as IPrivateMessage;
  //       return {
  //         ...data,
  //         dateAndTime: data.dateAndTime ? new Date(data.dateAndTime) : null
  //       };
  //     });
  //     this.store.communication.privateMessage.load(updatedMessages);
  //   });

  //   return () => unsubscribe();
  // }

  // async create(item: IValueRating, uid: string, description: string) {
  //   const myPath = `ValueRating/${description}/user/${uid}/ratings`;
  //   const itemRef = doc(collection(db, myPath));
  //   item.id = itemRef.id;
  //   try {
  //     await setDoc(itemRef, item, {
  //       merge: true,
  //     });
  //     this.store.valueRating.load([item]);
  //   } catch (error) {
  //     console.log("An error ocurred " + error);
  //   }
  // }
  async create(item: IValueRating, uid: string, description: string) {
    const myPath = `ValueRating/${description}/user/${uid}/ratings`;

    const itemRef = doc(collection(db, myPath));
    item.id = itemRef.id;

    // create in db
    try {
      await setDoc(itemRef, item, {
        merge: true,
      });
      // create in store
      this.store.valueRating.load([item]);
    } catch (error) {
      console.log(error);
    }
  }


  async update(object: IValueRating, uid: string, description: string) {
    const myPath = `ValueRating/${description}/user/${uid}/ratings`;
    try {
      await updateDoc(doc(db, myPath, object.id), {
        ...object,
      });
      this.store.valueRating.load([object]);
    } catch (error) {
      console.log("An error ocurred " + error);
    }
  }
  async updateValueScore(
    object: IValueRating,
    uid: string,
    valueScore: IValueRatingScores,
    description: string
  ) {
    const myPath = `ValueRating/${description}/${uid}`;
    const chatDocRef = doc(db, `PrivateMessages/${uid}`);
    await setDoc(
      chatDocRef,
      { id: uid, valueScore: valueScore.totalValueScore },
      { merge: true }
    );

    try {
      await updateDoc(doc(db, myPath, object.id), {
        ...object,
      });

      this.store.valueRating.load([object]);
    } catch (error) {}
  }
  async delete(id: string, uid: string, description: string) {
    const myPath = `ValueRating/${description}/${uid}`;
    try {
      await deleteDoc(doc(db, myPath, id));
      this.store.valueRating.remove(id);
    } catch (error) {
      console.log(error);
    }
  }

  async getAllValueRatings(description: string, userUids: string[]): Promise<IValueRating[]> {
    const valueRatings: IValueRating[] = [];

    for (const uid of userUids) {
      const myPath = `ValueRating/${description}/user/${uid}/ratings`;
      console.log(`Fetching ratings for path: ${myPath}`);
      const ratingQuerySnapshot = await getDocs(collection(db, myPath));

      console.log(`Number of documents fetched for user ${uid}: ${ratingQuerySnapshot.size}`);

      const userRatings: IValueRating[] = [];
      ratingQuerySnapshot.forEach((ratingDoc) => {
        const ratingData = ratingDoc.data();
        console.log(`Fetched data for doc ID ${ratingDoc.id}:`, ratingData);

        const date = ratingData.date?.toDate ? ratingData.date.toDate() : new Date(ratingData.date);

        const valueRating: IValueRating = {
          id: ratingDoc.id,
          overallRating: ratingData.overallRating,
          rateeId: ratingData.rateeId,
          dimension: ratingData.dimension,
          values: ratingData.values,
          date: date, // Ensured date is a Date object
          department: ratingData.department,
          description: "",
          isflagged: false
        };
        userRatings.push(valueRating);
        valueRatings.push(valueRating);
      });
      this.store.valueRating.load(userRatings);
    }

    console.log('All value ratings fetched:', valueRatings);
    return valueRatings;
  }

  async deleteAllValueRatings(uids: string[], description: string): Promise<void[]> {
    const deletePromises: Promise<void>[] = [];
  
    for (const uid of uids) {
      const myPath = `ValueRating/${description}/user/${uid}/ratings`;
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
