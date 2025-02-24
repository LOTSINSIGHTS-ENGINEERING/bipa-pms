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
import { IServiceRating } from "../../models/three-sixty-feedback-models/ServiceRating";
import { ICommitteeRating } from "../../models/three-sixty-feedback-models/CommitteeRating";

  export default class ServiceRatingApi {
    constructor(private api: AppApi, private store: AppStore) { }
  
    async getAll(uid: string) {
      const myPath = `ServiceRating/${uid}/UserRating`;
  
      const $query = query(collection(db, myPath));
      // new promise
      return await new Promise<Unsubscribe>((resolve, reject) => {
        // on snapshot
        const unsubscribe = onSnapshot(
          $query,
          // onNext
          (querySnapshot) => {
            const items: IServiceRating[] = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() } as IServiceRating);
            });
  
            this.store.serviceRating.load(items);
            resolve(unsubscribe);
          },
          // onError
          (error) => {
            reject();
          }
        );
      });
    }
  
    async getById(id: string,uid: string) {
      const myPath = `ServiceRating/${uid}/UserRating`;
  
      const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
        if (!doc.exists) return;
        const item = { id: doc.id, ...doc.data() } as IServiceRating;
  
        this.store.serviceRating.load([item]);
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
  
    async create(item: IServiceRating, uid: string, ) {
      console.log("Create Service Api entered",item)
      console.log("Create Service Api entered uid "+uid)      
      const myPath = `ServiceRating/${uid}/UserRating`;
      const itemRef = doc(collection(db, myPath));
      item.id = itemRef.id;
      console.log("Item Ref",  item.id );

      // create in db
      try {
        await setDoc(itemRef, item, {
          merge: true,
        });
        console.log("Service Create in api done successfully")      
        // create in store
        this.store.serviceRating.load([item]);
        console.log("Here is the item",item);      
      } catch (error) {
        // console.log(error);
      }
    }
  
    async update(object: IServiceRating, uid: string) {
      const myPath = `ProjectRating/${uid}/UserRating`;
      try {
        await updateDoc(doc(db, myPath, object.id), {
          ...object,
        });
  
        this.store.serviceRating.load([object]);
      } catch (error) { }
    }
  
    async delete(id: string, uid: string) {
      const myPath = `ServiceRating/${uid}/UserRating`;
      try {
        await deleteDoc(doc(db, myPath, id));
        this.store.serviceRating.remove(id);
      } catch (error) {
        console.log(error);
      }
    }
  }
  