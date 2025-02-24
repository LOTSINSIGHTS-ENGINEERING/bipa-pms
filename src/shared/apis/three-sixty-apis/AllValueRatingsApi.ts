import { collection, getDocs, QuerySnapshot } from "firebase/firestore";
import { db } from "../../config/firebase-config";
import AppStore from "../../stores/AppStore";
import { IValueRating } from "../../models/three-sixty-feedback-models/ValueRating";

export default class AllValueRatingsApi {
  constructor(private store: AppStore) {}

  async getAll(): Promise<IValueRating[]> {
    const path = "ValueRating";
    const collectionRef = collection(db, path);

    try {
      const querySnapshot: QuerySnapshot = await getDocs(collectionRef);
      const items: IValueRating[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as IValueRating);
      });
      this.store.valueRating.load(items);
      return items;
    } catch (error) {
      console.error("Error fetching value ratings:", error);
      throw error;
    }
  }
}
