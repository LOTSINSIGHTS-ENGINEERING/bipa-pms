import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import { sortAlphabetically } from "../../../logged-in/shared/utils/utils";
import Value, { IValue } from "../../models/three-sixty-feedback-models/Values";
import ValueRating, { IValueRating } from "../../models/three-sixty-feedback-models/ValueRating";


export default class ValueRatingStore extends Store<IValueRating, ValueRating> {
    items = new Map<string, ValueRating>();
  
    constructor(store: AppStore) {
      super(store);
      this.store = store;
    }

    load(items: IValueRating[] = []) {
      runInAction(() => {
        items.forEach((item) => {
          this.items.set(item.id, new ValueRating(this.store, item));
        });
      });
    }
    getByUid(uid: string) {
      const all = Array.from(this.items.values());
      return all
        .filter((item) => item.asJson.id === uid)
        // .sort((a, b) =>
        //   sortAlphabetically(a.asJson.valueName, b.asJson.valueName)
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
      //   sortAlphabetically(a.asJson.valueName, b.asJson.valueName)
      // );
    }
  }
  