import {
    query,
    collection,
    updateDoc,
    doc,
    where,
    arrayUnion, deleteDoc, onSnapshot, Unsubscribe, setDoc} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../../config/firebase-config";
// import { MAIL_EMAIL } from "../../functions/mailMessages";

import AppStore from "../../stores/AppStore";
import AppApi from "../AppApi";
import { IProject } from "../../models/three-sixty-feedback-models/Projects";


export default class ProjectApi {
    constructor(private api: AppApi, private store: AppStore) { }

    private generalPath() {
        return "projectTemplate";
    }

    async create(object: IProject) {

        const path = this.generalPath();
        if (!path) return;

        const itemRef = doc(collection(db, path))
        object.id = itemRef.id;
        try {
            await setDoc(itemRef, object, { merge: true, })
        } catch (error) {
        }
    }

    async update(object: IProject) {

        const path = this.generalPath();
        if (!path) return;

        try {
            await updateDoc(doc(db, path, object.id), {
                ...object,
            });
            this.store.projects.load([object]);
        } catch (error) {
            console.log(error);

        }
    }

    async delete(object: IProject) {

        const path = this.generalPath();
        if (!path) return;

        try {
            await deleteDoc(doc(db, path, object.id));
            this.store.projects.remove(object.id);
        } catch (error) { }
    }

    async getAll() {

        // this.store.projects.removeAll();

        const path = this.generalPath();
        if (!path) return;

        const $query = query(collection(db, path));

        return await new Promise<Unsubscribe>((resolve, reject) => {
            const unsubscribe = onSnapshot($query, (querySnapshot) => {
                const object: IProject[] = [];
                querySnapshot.forEach((doc) => {
                    object.push({ id: doc.id, ...doc.data() } as IProject);
                });
                this.store.projects.load(object);
                resolve(unsubscribe);
            }, (error) => {
                reject();
            });
        });

    }
    
}