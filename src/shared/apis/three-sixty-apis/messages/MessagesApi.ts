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
} from "firebase/firestore";
import AppApi from "../../AppApi";
import AppStore from "../../../stores/AppStore";
import { db } from "../../../config/firebase-config";
import { IPrivateMessage } from "../../../models/three-sixty-feedback-models/messages/MessagesModel";
import { IChatModel } from "../../../models/three-sixty-feedback-models/messages/ChatModel";

export default class PrivateMessageApi {
  constructor(private api: AppApi, private store: AppStore) {}

  async getAll(uid: string) {
    const myPath = `PrivateMessages/${uid}/UserMessage`;

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

  async getById(id: string, pid: string, uid: string) {
    const myPath = `PrivateMessages/${uid}/UserMessage`;

    const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IPrivateMessage;

      this.store.messages.load([item]);
    });

    return unsubscribe;
  }

  async getChatIdByUsers(users: string[]): Promise<string> {
    const myPath = 'PrivateMessages';

    try {
        const querySnapshot = await getDocs(collection(db, myPath));
        for (const doc of querySnapshot.docs) {
            const chatData = doc.data();
            if (Array.isArray(chatData.users) && users.every(user => chatData.users.includes(user))) {
                return doc.id;
            }
        }
        return ""; // No matching chat found
    } catch (error) {
        console.error('Error retrieving chatId by users:', error);
        return "";
    }
  }

  async updateMessageReadStatus(chatId: string, messageId: string, read: boolean): Promise<void> {
    try {
      const messageRef = doc(db, `PrivateMessages/${chatId}/UserMessages`, messageId);
      await updateDoc(messageRef, { read });
    } catch (error) {
      console.error("Error updating message read status:", error);
    }
  }
  

  async create(item: IPrivateMessage, uid: string, chatModel: IChatModel) {
    const myPath = `PrivateMessages/${uid}/UserMessages`;
    const chatDocRef = doc(db, `PrivateMessages/${uid}`);
    await setDoc(chatDocRef, { chatId: uid, users: chatModel.users }, { merge: true });

    const itemRef = doc(collection(db, myPath));
    item.id = itemRef.id;

    // create in db
    try {
      await setDoc(itemRef, item, {
        merge: true,
      });
      // create in store
      this.store.messages.load([item]);
    } catch (error) {
      console.log(error);
    }
  }

  async createMessage(item: IPrivateMessage, uid: string) {
    const myPath = `PrivateMessages/${uid}/UserMessages`;
    const itemRef = doc(collection(db, myPath));
    item.id = itemRef.id;

    // create in db
    try {
      await setDoc(itemRef, item, {
        merge: true,
      });
      // create in store
      this.store.messages.load([item]);
    } catch (error) {
      console.log(error);
    }
  }

  async update(message: IPrivateMessage, uid: string) {
    const myPath = `PrivateMessages/${uid}/UserMessage`;
    try {
      await updateDoc(doc(db, myPath, message.id), {
        ...message,
      });

      this.store.messages.load([message]);
    } catch (error) {
      console.log(error);
    }
  }

  async delete(id: string, uid: string) {
    const myPath = `PrivateMessages/${uid}/UserMessage`;
    try {
      await deleteDoc(doc(db, myPath, id));
      this.store.messages.remove(id);
    } catch (error) {
      console.log(error);
    }
  }
}
