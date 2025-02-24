import {
    Unsubscribe,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    updateDoc,
    writeBatch,
  } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppApi from "../AppApi";
import AppStore from "../../stores/AppStore";
import { IServiceRating } from "../../models/three-sixty-feedback-models/ServiceRating";
import { ICommitteeRating } from "../../models/three-sixty-feedback-models/CommitteeRating";
import { ITemplateRating } from "../../models/three-sixty-feedback-models/TemplateRating";

  export default class TemplateRatingApi {
    constructor(private api: AppApi, private store: AppStore) { }
  
    async getAll() {
      const myPath = `TemplateRating`;
  
      const $query = query(collection(db, myPath));
      // new promise
      return await new Promise<Unsubscribe>((resolve, reject) => {
        // on snapshot
        const unsubscribe = onSnapshot(
          $query,
          // onNext
          (querySnapshot) => {
            const items: ITemplateRating[] = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() } as ITemplateRating);
            });
  
            this.store.templateRating.load(items);
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
      const myPath = `TemplateRating`;
  
      const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
        if (!doc.exists) return;
        const item = { id: doc.id, ...doc.data() } as ITemplateRating;
  
        this.store.templateRating.load([item]);
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
  
    async create(item: ITemplateRating, uid: string, ) {
      console.log("Create Service Api entered",item)
      console.log("Create Service Api entered uid "+uid)      
      const myPath = `TemplateRating`;
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
        this.store.templateRating.load([item]);
        console.log("Here is the item",item);      
      } catch (error) {
        // console.log(error);
      }
    }
  
    async update(object: ITemplateRating) {
      const myPath = `TemplateRating`;
      try {
        await updateDoc(doc(db, myPath, object.id), {
          ...object,
        });
  
        this.store.templateRating.load([object]);
      } catch (error) { }
    }
  
    async delete(id: string, uid: string) {
      const myPath = `TemplateRating`;
      try {
        await deleteDoc(doc(db, myPath, id));
        this.store.templateRating.remove(id);
      } catch (error) {
        console.log(error);
      }
    }
 
    async deleteAll() {
      const myPath = `TemplateRating`;
      const batch = writeBatch(db);
    
      try {
        const querySnapshot = await getDocs(collection(db, myPath));
        console.log("Number of documents to delete:", querySnapshot.size);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
    
        await batch.commit();
        this.store.templateRating.load([]); 
        console.log("All template ratings deleted successfully.");
        return "All template ratings deleted successfully."; 
      } catch (error) {
        console.log("Error deleting all template ratings:", error);
        return "Error deleting all template ratings."; 
      }
    }
    
}