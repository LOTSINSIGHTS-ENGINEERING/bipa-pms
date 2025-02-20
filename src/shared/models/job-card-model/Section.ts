import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";


export const defaultSection: ISection = {
  id: "",
  name: "",
  division: "",
};

export interface ISection {
  id: string;
  name: string;
  division: string;
}

export default class Section {
  private section: ISection;

  constructor(private store: AppStore, section: ISection) {
    makeAutoObservable(this);
    this.section = section;
  }

  get asJson(): ISection {
    return toJS(this.section);
  }
}
