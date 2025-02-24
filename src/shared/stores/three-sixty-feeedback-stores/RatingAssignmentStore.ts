import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import RateAssignment, { IRateAssignment } from "../../models/three-sixty-feedback-models/RateAssignments";


export default class RatingAssignmentStore extends Store<IRateAssignment, RateAssignment> {
    items = new Map<string, RateAssignment>();
  
    constructor(store: AppStore) {
      super(store);
      this.store = store;
    }

    load(items: IRateAssignment[] = []) {
      runInAction(() => {
        items.forEach((item) => {
          this.items.set(item.id, new RateAssignment(this.store, item));
        });
      });
    }
    getByUid(uid: string) {
      const all = Array.from(this.items.values());
      return all
        .filter((item) => item.asJson.id === uid);
    }
  
    get allMe() {
      const me = this.store.auth.meJson;
      if (!me) return [];
      return this.getByUid(me.uid);
    }
  
    get all() {
      return Array.from(toJS(this.items.values()))
    }
  }
  