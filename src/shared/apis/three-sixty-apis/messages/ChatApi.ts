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
  import AppApi from "../../AppApi";
  import AppStore from "../../../stores/AppStore";
import { db } from "../../../config/firebase-config";
import { IPrivateMessage } from "../../../models/three-sixty-feedback-models/messages/MessagesModel";
import { IChatModel } from "../../../models/three-sixty-feedback-models/messages/ChatModel";

  export default class ChatApi {
    constructor(private api: AppApi, private store: AppStore) { }
  
    async getAll() {
      const myPath = `PrivateMessages`;
  
      const $query = query(collection(db, myPath));
      // new promise
      return await new Promise<Unsubscribe>((resolve, reject) => {
        // on snapshot
        const unsubscribe = onSnapshot(
          $query,
          // onNext
          (querySnapshot) => {
            const items: IPrivateMessage[] = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() } as IPrivateMessage);
            });
  
            this.store.messages.load(items);
            resolve(unsubscribe);
          },
          // onError
          (error) => {
            reject();
          }
        );
      });
    }
  
    async getById(id: string) {
      const myPath = `PrivateMessages`;
  
      const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
        if (!doc.exists) return;
        const item = { id: doc.id, ...doc.data() } as IPrivateMessage;
  
        this.store.messages.load([item]);
      });
  
      return unsubscribe;
    }
    async update(message: IChatModel) {
      const myPath = `PrivateMessages`;
      try {
        await updateDoc(doc(db, myPath, message.id), {
          ...message,
        });
  
        this.store.chat.load([message]);
      } catch (error) { }
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
  
    // async create(item: IPrivateMessage, uid: string, ) {
    //   const myPath = `PrivateMessages`;
      
    //   const chatDocRef = doc(db, `PrivateMessages/${uid}`);
    //   await setDoc(chatDocRef, { chatId: uid }, { merge: true });

    //   const itemRef = doc(collection(db, myPath));
    //   item.id = itemRef.id;
  
    //   // create in db
    //   try {
    //     await setDoc(itemRef, item, {
    //       merge: true,
    //     });
    //     // create in store
    //     this.store.messages.load([item]);
    //   } catch (error) {
    //     // console.log(error);
    //   }
    // }
  
    // async update(message: IPrivateMessage, uid: string) {
    //   const myPath = `PrivateMessages/${uid}/UserMessage`;
    //   try {
    //     await updateDoc(doc(db, myPath, message.id), {
    //       ...message,
    //     });
  
    //     this.store.messages.load([message]);
    //   } catch (error) { }
    // }
  
    async delete(id: string) {
      const myPath = `PrivateMessages`;
      try {
        await deleteDoc(doc(db, myPath, id));
        this.store.messages.remove(id);
      } catch (error) {
        console.log(error);
      }
    }
  }
  