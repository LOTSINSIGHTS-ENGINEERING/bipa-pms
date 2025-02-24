import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import { sortAlphabetically } from "../../../logged-in/shared/utils/utils";
import Value, { IValue } from "../../models/three-sixty-feedback-models/Values";


export default class RatingStore extends Store<IValue, Value> {
    items = new Map<string, Value>();
  
    constructor(store: AppStore) {
      super(store);
      this.store = store;
    }

    load(items: IValue[] = []) {
      runInAction(() => {
        items.forEach((item) => {
          this.items.set(item.id, new Value(this.store, item));
        });
      });
    }
    getByUid(uid: string) {
      const all = Array.from(this.items.values());
      return all
        .filter((item) => item.asJson.id === uid)
        .sort((a, b) =>
          sortAlphabetically(a.asJson.valueName, b.asJson.valueName)
        );
    }
  
    get allMe() {
      const me = this.store.auth.meJson;
      if (!me) return [];
      return this.getByUid(me.uid);
    }
  
    get all() {
      return Array.from(toJS(this.items.values())).sort((a, b) =>
        sortAlphabetically(a.asJson.valueName, b.asJson.valueName)
      );
    }
  }
  