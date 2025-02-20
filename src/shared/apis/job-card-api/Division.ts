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
import { IDivision } from "../../models/job-card-model/Division";


export default class DivisionApi {
  constructor(private api: AppApi, private store: AppStore) {}

  async getAll() {
    const myPath = `/Division`;

    const $query = query(collection(db, myPath));
    // new promise
    return await new Promise<Unsubscribe>((resolve, reject) => {
      // on snapshot
      const unsubscribe = onSnapshot(
        $query,
        // onNext
        (querySnapshot) => {
          const items: IDivision[] = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as IDivision);
          });

          this.store.jobcard.division.load(items);
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
    const myPath = `/Division`;

    const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
      if (!doc.exists) return;
      const item = { id: doc.id, ...doc.data() } as IDivision;

      this.store.jobcard.division.load([item]);
    });

    return unsubscribe;
  }

  async create(item: IDivision) {
    const myPath = `/Division`;

    const itemRef = doc(collection(db, myPath));
    item.id = itemRef.id;

    // create in db
    try {
      await setDoc(itemRef, item, {
        merge: true,
      });
      // create in store
      this.store.jobcard.division.load([item]);
    } catch (error) {
      // console.log(error);
    }
  }

  async update(item: IDivision) {
    const myPath = `/Division`;
    try {
      await updateDoc(doc(db, myPath, item.id), {
        ...item,
      });

      this.store.jobcard.division.load([item]);
    } catch (error) {}
  }

   // delete businessUnit
  async delete(item: IDivision) {
      const myPath = `/Division`;
    if (!myPath) return;

    // remove from db
    try {
      await deleteDoc(doc(db, myPath, item.id));
      // remove from store
      this.store.jobcard.division.remove(item.id); // Remove from memory
    } catch (error) {
      // console.log(error);
    }
  }
}

