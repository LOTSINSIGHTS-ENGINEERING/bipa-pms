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
import { IProjectRating } from "../../models/three-sixty-feedback-models/ProjectRating";

  export default class ProjectRatingApi {
    constructor(private api: AppApi, private store: AppStore) { }
  
    async getAll( uid: string) {
      const myPath = `ProjectRating/${uid}/UserRating`;
  
      const $query = query(collection(db, myPath));
      // new promise
      return await new Promise<Unsubscribe>((resolve, reject) => {
        // on snapshot
        const unsubscribe = onSnapshot(
          $query,
          // onNext
          (querySnapshot) => {
            const items: IProjectRating[] = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() } as IProjectRating);
            });
  
            this.store.projectRating.load(items);
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
      const myPath = `ProjectRating/${uid}/UserRating`;
  
      const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
        if (!doc.exists) return;
        const item = { id: doc.id, ...doc.data() } as IProjectRating;
  
        this.store.projectRating.load([item]);
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
  
    async create(item: IProjectRating, uid: string, ) {
      const myPath = `ProjectRating/${uid}/UserRating`;
  
      const itemRef = doc(collection(db, myPath));
      item.id = itemRef.id;
  
      // create in db
      try {
        await setDoc(itemRef, item, {
          merge: true,
        });
        // create in store
        this.store.projectRating.load([item]);
      } catch (error) {
        // console.log(error);
      }
    }
  
    async update(object: IProjectRating, uid: string) {
      const myPath = `ProjectRating/${uid}/UserRating`;
      try {
        await updateDoc(doc(db, myPath, object.id), {
          ...object,
        });
  
        this.store.projectRating.load([object]);
      } catch (error) { }
    }
  
    async delete(id: string, uid: string) {
      const myPath = `ProjectRating/${uid}/UserRating`;
      try {
        await deleteDoc(doc(db, myPath, id));
        this.store.projectRating.remove(id);
      } catch (error) {
        console.log(error);
      }
    }
  }
  