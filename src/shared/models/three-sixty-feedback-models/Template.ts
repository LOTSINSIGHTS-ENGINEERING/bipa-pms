import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";


export interface Question {
  id: string;
  text: string;
}

export interface ITemplate {
  id: string;
  title: string;
  createdBy: string;
  questions: Question[];
  date: number;
  additionalComments?: string;
}

export const defaultTemplate: ITemplate = {
  id: "",
  title: "",
  createdBy: "",
  questions: [] as Question[],
  date: 0
};



export default class Template {
  private template: ITemplate;

  constructor(private store: AppStore, template: ITemplate) {
    makeAutoObservable(this);
    this.template = template;
  }

  get asJson(): ITemplate {
    return toJS(this.template);
  }
}
