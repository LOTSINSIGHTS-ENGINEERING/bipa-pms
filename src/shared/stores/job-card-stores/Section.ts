import { makeObservable, runInAction, toJS } from "mobx";
import AppStore from "../AppStore";
import Store from "../Store";
import Section, { ISection } from "../../models/job-card-model/Section";


export default class SectionStore extends Store<ISection, Section> {
  items = new Map<string, Section>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }

  load(items: ISection[] = []) {
    runInAction(() => {
      items.forEach((item) =>
        this.items.set(item.id, new Section(this.store, item))
      );
    });
  }
}
