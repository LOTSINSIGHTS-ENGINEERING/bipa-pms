import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import { sortAlphabetically } from "../../../logged-in/shared/utils/utils";
import CommitteeRating, { ICommitteeRating } from "../../models/three-sixty-feedback-models/CommitteeRating";


export default class CommitteeRatingStore extends Store<ICommitteeRating, CommitteeRating> {
    items = new Map<string, CommitteeRating>();
  
    constructor(store: AppStore) {
      super(store);
      this.store = store;
    }
  
    load(items: ICommitteeRating[] = []) {
      runInAction(() => {
        items.forEach((item) => {
          this.items.set(item.id, new CommitteeRating(this.store, item));
        });
      });
    }
  
  
    getByUid(uid: string) {
      const all = Array.from(this.items.values());
      return all
        .filter((item) => item.asJson.id === uid)
        // .sort((a, b) =>
        //   sortAlphabetically(a.asJson.criteriaName, b.asJson.criteriaName)
        // );
    }
  
    get allMe() {
      const me = this.store.auth.meJson;
      if (!me) return [];
      return this.getByUid(me.uid);
    }
  
    get all() {
      return Array.from(toJS(this.items.values()))
      // .sort((a, b) =>
      //   sortAlphabetically(a.asJson.criteriaName, b.asJson.criteriaName)
      // );
    }
  }
  