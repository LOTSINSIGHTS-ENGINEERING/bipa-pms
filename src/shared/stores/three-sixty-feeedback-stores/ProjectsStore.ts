import Store from "../Store";
import AppStore from "../AppStore";
import { runInAction, toJS } from "mobx";
import { sortAlphabetically } from "../../../logged-in/shared/utils/utils";
import Project, { IProject } from "../../models/three-sixty-feedback-models/Projects";


export default class ProjectStore extends Store<IProject, Project> {
    items = new Map<string, Project>();
  
    constructor(store: AppStore) {
      super(store);
      this.store = store;
    }

    load(items: IProject[] = []) {
      runInAction(() => {
        items.forEach((item) => {
          this.items.set(item.id, new Project(this.store, item));
        });
      });
    }
    getByUid(uid: string) {
      const all = Array.from(this.items.values());
      return all
        .filter((item) => item.asJson.id === uid)
        .sort((a, b) =>
          sortAlphabetically(a.asJson.projectName, b.asJson.projectName)
        );
    }
  
    get allMe() {
      const me = this.store.auth.meJson;
      if (!me) return [];
      return this.getByUid(me.uid);
    }
  
    get all() {
      return Array.from(toJS(this.items.values())).sort((a, b) =>
        sortAlphabetically(a.asJson.projectName, b.asJson.projectName)
      );
    }
  }

  