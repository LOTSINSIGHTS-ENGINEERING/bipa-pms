import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import { sortAlphabetically } from "../../../logged-in/shared/utils/utils";
import Committee, { ICommittee } from "../../models/three-sixty-feedback-models/Committee";


export default class CommitteeStore extends Store<ICommittee, Committee> {
    items = new Map<string, Committee>();
  
    constructor(store: AppStore) {
      super(store);
      this.store = store;
    }

    load(items: ICommittee[] = []) {
      runInAction(() => {
        items.forEach((item) => {
          this.items.set(item.id, new Committee(this.store, item));
        });
      });
    }
    getByUid(uid: string) {
      const all = Array.from(this.items.values());
      return all
        .filter((item) => item.asJson.id === uid)
        .sort((a, b) =>
          sortAlphabetically(a.asJson.committeeName, b.asJson.committeeName)
        );
    }
  
    get allMe() {
      const me = this.store.auth.meJson;
      if (!me) return [];
      return this.getByUid(me.uid);
    }
  
    get all() {
      return Array.from(toJS(this.items.values())).sort((a, b) =>
        sortAlphabetically(a.asJson.committeeName, b.asJson.committeeName)
      );
    }
  }
  