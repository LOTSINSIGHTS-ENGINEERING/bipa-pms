import { makeObservable, runInAction, toJS } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import Member, { IMember } from "../../models/job-card-model/Members";


export default class MemberStore extends Store<IMember, Member> {
  items = new Map<string, Member>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }

  load(items: IMember[] = []) {
    runInAction(() => {
      items.forEach((item) =>
        this.items.set(item.id, new Member(this.store, item))
      );
    });
  }
}

