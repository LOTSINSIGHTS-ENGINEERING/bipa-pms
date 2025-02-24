import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import { sortAlphabetically } from "../../../logged-in/shared/utils/utils";
import ProjectRating, { IProjectRating } from "../../models/three-sixty-feedback-models/ProjectRating";


export default class ProjectRatingStore extends Store<IProjectRating, ProjectRating> {
    items = new Map<string, ProjectRating>();
  
    constructor(store: AppStore) {
      super(store);
      this.store = store;
    }
  
    load(items: IProjectRating[] = []) {
      runInAction(() => {
        items.forEach((item) => {
          this.items.set(item.id, new ProjectRating(this.store, item));
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
  