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
import { IMember } from "../../models/job-card-model/Members";

  export default class MemberApi {
    constructor(private api: AppApi, private store: AppStore) {}

    async getAll() {
      const myPath = `/jobCardMembers`;

      const $query = query(collection(db, myPath));
      // new promise
      return await new Promise<Unsubscribe>((resolve, reject) => {
        // on snapshot
        const unsubscribe = onSnapshot(
          $query,
          // onNext
          (querySnapshot) => {
            const items: IMember[] = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() } as IMember);
            });

            this.store.jobcard.client.load(items);
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
      const myPath = `/jobCardMembers`;

      const unsubscribe = onSnapshot(doc(db, myPath, id), (doc) => {
        if (!doc.exists) return;
        const item = { id: doc.id, ...doc.data() } as IMember;

        this.store.jobcard.member.load([item]);
      });

      return unsubscribe;
    }

    async create(item: IMember) {
      const myPath = `/jobCardMembers`;

      const itemRef = doc(collection(db, myPath));
      item.id = itemRef.id;

      // create in db
      try {
        await setDoc(itemRef, item, {
          merge: true,
        });
        // create in store
        this.store.jobcard.member.load([item]);
      } catch (error) {
        // console.log(error);
      }
    }

    async update(item: IMember) {
      const myPath = `/jobCardMembers`;
      try {
        await updateDoc(doc(db, myPath, item.id), {
          ...item,
        });

        this.store.jobcard.member.load([item]);
      } catch (error) {}
    }

    async delete(id: string) {
      const myPath = `/jobCardMembers`;
      try {
        await deleteDoc(doc(db, myPath, id));
        this.store.jobcard.client.remove(id);
      } catch (error) {
        console.log(error);
      }
    }
  }
  