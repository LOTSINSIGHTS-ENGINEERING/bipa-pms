import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import { sortAlphabetically } from "../../../logged-in/shared/utils/utils";
import Service, { IService } from "../../models/three-sixty-feedback-models/Services";


export default class ServiceStore extends Store<IService, Service> {
    items = new Map<string, Service>();
  
    constructor(store: AppStore) {
      super(store);
      this.store = store;
    }

    load(items: IService[] = []) {
      runInAction(() => {
        items.forEach((item) => {
          this.items.set(item.id, new Service(this.store, item));
        });
      });
    }
    getByUid(uid: string) {
      const all = Array.from(this.items.values());
      return all
        .filter((item) => item.asJson.id === uid)
        .sort((a, b) =>
          sortAlphabetically(a.asJson.serviceName, b.asJson.serviceName)
        );
    }
  
    get allMe() {
      const me = this.store.auth.meJson;
      if (!me) return [];
      return this.getByUid(me.uid);
    }
  
    get all() {
      return Array.from(toJS(this.items.values())).sort((a, b) =>
        sortAlphabetically(a.asJson.serviceName, b.asJson.serviceName)
      );
    }
  }
  