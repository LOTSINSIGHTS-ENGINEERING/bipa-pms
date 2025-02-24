import {
    Unsubscribe,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    setDoc,
    updateDoc,
  } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppApi from "../AppApi";
import AppStore from "../../stores/AppStore";
import { ICommitteeRating } from "../../models/three-sixty-feedback-models/CommitteeRating";

  export default class CommitteeRatingApi {
    constructor(private api: AppApi, private store: AppStore) { }
  
    async getAll(uid: string) {
      const myPath = `CommitteeRating/${uid}/UserRating`;
  
      const $query = query(collection(db, myPath));
      // new promise
      return await new Promise<Unsubscribe>((resolve, reject) => {
        // on snapshot
        const unsubscribe = onSnapshot(
          $query,
          // onNext
          (querySnapshot) => {
            const items: ICommitteeRating[] = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() } as ICommitteeRating);
            });
  
            this.store.committeeRating.load(items);
            resolve(unsubscribe);
          },
          // onError
          (error) => {
            reject();
          }
        );
      });
    }
  
    async getById(id: string, uid: string) {
      const myPath = `CommitteeRating/${uid}/UserRating`;
  
      const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
        if (!doc.exists) return;
        const item = { id: doc.id, ...doc.data() } as ICommitteeRating;
  
        this.store.committeeRating.load([item]);
      });
  
      return unsubscribe;
    }
  
    // async getUserMessag, uid: string) {
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
  
    // async getUserMessag, uid: string) {
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
  
    async create(item: ICommitteeRating, uid: string, ) {
      const myPath = `CommitteeRating/${uid}/UserRating`;
  
      const itemRef = doc(collection(db, myPath));
      item.id = itemRef.id;
  
      // create in db
      try {
        await setDoc(itemRef, item, {
          merge: true,
        });
        // create in store
        this.store.committeeRating.load([item]);
      } catch (error) {
        // console.log(error);
      }
    }
  
    async update(object: ICommitteeRating, uid: string) {
      const myPath = `ProjectRating/${uid}/UserRating`;
      try {
        await updateDoc(doc(db, myPath, object.id), {
          ...object,
        });
  
        this.store.committeeRating.load([object]);
      } catch (error) { }
    }
  
    async delete(id: string, uid: string) {
      const myPath = `CommitteeRating/${uid}/UserRating`;
      try {
        await deleteDoc(doc(db, myPath, id));
        this.store.committeeRating.remove(id);
      } catch (error) {
        console.log(error);
      }
    }
  }
  