import { runInAction } from "mobx";
import { IValueRating } from "../../models/three-sixty-feedback-models/ValueRating";
import AppStore from "../AppStore";
import AllValueRatingsApi from "../../apis/three-sixty-apis/AllValueRatingsApi";

export default class AllValueRatingsStore {
  valueRatings: IValueRating[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private store: AppStore) {}

  async fetchAllValueRatings() {
    this.loading = true;
    const api = new AllValueRatingsApi(this.store);
    try {
      const valueRatingsData = await api.getAll(); 
      const valueRatings: IValueRating[] = valueRatingsData.map((data: any) => ({
        id: data.id, 
        ...data 
      }));
      runInAction(() => {
        this.valueRatings = valueRatings;
      });
    } catch (error) {
      this.error = "An error occurred while fetching value ratings.";
      console.error("Error fetching value ratings:", error);
    } finally {
      this.loading = false;
    }
  }
  
  
  
}
