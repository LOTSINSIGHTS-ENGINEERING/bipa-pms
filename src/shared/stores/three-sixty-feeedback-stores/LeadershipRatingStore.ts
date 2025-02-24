import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import LeadershipRating, { ILeadershipRating } from "../../models/three-sixty-feedback-models/LeadershipRating";

export default class LeadershipRatingStore extends Store<ILeadershipRating, LeadershipRating> {
  items = new Map<string, LeadershipRating>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }

  load(items: ILeadershipRating[] = []) {
    runInAction(() => {
      items.forEach((item) => {
        this.items.set(item.id, new LeadershipRating(this.store, item));
      });
    });
  }

  getByUid(uid: string) {
    const all = Array.from(this.items.values());
    return all.filter((item) => item.asJson.rateeId === uid);
  }

  get all() {
    return Array.from(toJS(this.items.values()));
  }
}
