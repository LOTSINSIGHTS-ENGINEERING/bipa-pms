import { makeObservable, runInAction, toJS } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import { IDivision, Division } from "../../models/job-card-model/Division";

export default class DivisionStore extends Store<IDivision, Division> {
  items = new Map<string, Division>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }

  load(items: IDivision[] = []) {
    runInAction(() => {
      items.forEach((item) =>
        this.items.set(item.id, new Division(this.store, item))
      );
    });
  }
}
