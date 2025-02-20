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
import AppApi from "../AppApi";
import AppStore from "../../stores/AppStore";
import { db } from "../../config/firebase-config";
import { ISection } from "../../models/job-card-model/Section";


export default class SectionApi {
  constructor(private api: AppApi, private store: AppStore) {}

  async getAll() {
    const myPath = `JobCardSections`;

    const $query = query(collection(db, myPath));
    // new promise
    return await new Promise<Unsubscribe>((resolve, reject) => {
      // on snapshot
      const unsubscribe = onSnapshot(
        $query,
        // onNext
        (querySnapshot) => {
          const items: ISection[] = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as ISection);
          });

          this.store.jobcard.section.load(items);
          resolve(unsubscribe);
        },
        // onError
        (error) => {
          reject();
        }
      );
    });
  }

  async getById(id: string, jid: string) {
    const myPath = `JobCardSections`;

    const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as ISection;

      this.store.jobcard.section.load([item]);
    });

    return unsubscribe;
  }

  async create(item: ISection) {
    const myPath = `JobCardSections`;

    const itemRef = doc(collection(db, myPath));
    item.id = itemRef.id;

    // create in db
    try {
      await setDoc(itemRef, item, {
        merge: true,
      });
      // create in store
      this.store.jobcard.section.load([item]);
    } catch (error) {
      // console.log(error);
    }
  }

  async update(item: ISection) {
    const myPath = `JobCardSections`;
    try {
      await updateDoc(doc(db, myPath, item.id), {
        ...item,
      });

      this.store.jobcard.section.load([item]);
    } catch (error) {}
  }

  // delete department
  async delete(item: ISection) {
    const myPath = `JobCardSections`;
    if (!myPath) return;

    // remove from db
    try {
      await deleteDoc(doc(db, myPath, item.id));
      // remove from store
      this.store.jobcard.section.remove(item.id); // Remove from memory
      // await this.api.folder.delete(item.id); // delete root folder
    } catch (error) {
      // console.log(error);
    }
  }
}
