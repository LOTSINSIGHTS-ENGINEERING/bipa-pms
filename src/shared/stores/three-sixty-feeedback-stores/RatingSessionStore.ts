import { runInAction, toJS } from "mobx";
import Store from "../Store";
import AppStore from "../AppStore";
import RatingSession, { IRatingSession } from "../../models/three-sixty-feedback-models/RatingSession";

export default class RatingSessionStore extends Store<IRatingSession, RatingSession> {
  items: Map<string, RatingSession> = new Map<string, RatingSession>();
  initialized: boolean = false;

  constructor(store: AppStore) {
    super(store);
    this.load = this.load.bind(this); // Ensure proper context for load method
  }

  load(items: IRatingSession[] = []) {
    runInAction(() => {
      items.forEach((item) => {
        if (!this.items.has(item.id)) {
          this.items.set(item.id, new RatingSession(this.store, item));
        }
      });
      this.initialized = true; // Mark initialization complete
    });
  }

  getByUid(uid: string): RatingSession | undefined {
    return this.items.get(uid);
  }

  get all(): RatingSession[] {
    return Array.from(this.items.values());
  }
}
