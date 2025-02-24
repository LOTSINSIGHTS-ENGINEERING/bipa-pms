import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import Templates, { ITemplates } from "../../models/three-sixty-feedback-models/Templates";


export default class TemplateStore extends Store<
  ITemplates,
  Templates
> {
  items = new Map<string,Templates>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }

  load(items: ITemplates[] = []) {
    runInAction(() => {
      items.forEach((item) => {
        this.items.set(item.id, new Templates(this.store, item));
      });
    });
  }
  getByUid(uid: string) {
    const all = Array.from(this.items.values());
    return all.filter((item) => item.asJson.id === uid);
  }

  get allMe() {
    const me = this.store.auth.meJson;
    if (!me) return [];
    return this.getByUid(me.uid);
  }

  get all() {
    return Array.from(toJS(this.items.values()));
  }
}
