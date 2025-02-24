import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface Statement {
  id: string;
  statement: string;
  rating:number
}
export interface ITemplates {
  id: string;
  date:number;
  createdBy: string;
  title: string;
  statements: Statement[];
  }


export const defaultTemplate: ITemplates = {
  id: "",
  date: 0,
  createdBy: "",
  title: "",
  statements: [] as Statement[], // Correctly typed empty array
};

export default class Templates {
  private value: ITemplates;

  constructor(private store: AppStore, value: ITemplates) {
    makeAutoObservable(this);
    this.value = value;
  }

  get asJson(): ITemplates {
    return toJS(this.value);
  }
}
