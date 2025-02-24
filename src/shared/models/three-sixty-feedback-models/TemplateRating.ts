import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface ITemplateRating {
  id: string;
  rateeId: string;
  raterId:string;
  dimension: string;
  templateId: string;
  heading: string;
  description: string;
  department:string;
  reasonForRequest: string;
  dueDate: number;
  isflagged: boolean;
  values: {
    [raterId: string]: {
      additionalComment?: string;
      stopDoing: string; 
      startDoing: string;
      continueDoing: string;
      ratings: {
        [valueName: string]: {
          [statement: string]: number;
        };
      };
    };
  };
  dateRequested?: number;
  status?: RatingStatus;
  archived:boolean;
}
export type RatingStatus = "In progress" | "Completed" | "Not Started";
export const defaultTemplateRating: ITemplateRating = {
  id: "",
  templateId: "",
  raterId: "",
  rateeId: "",
  heading: "",
  description: "",
  department:"",
  reasonForRequest: "",
  dateRequested: 0,
  dueDate: 0,
  dimension: "",
  values: {},
  archived: false,
  isflagged: false
};
export default class TemplateRating {
  private rating: ITemplateRating;

  constructor(private store: AppStore, rating: ITemplateRating) {
    makeAutoObservable(this);
    this.rating = rating;
  }

  get asJson(): ITemplateRating {
    return toJS(this.rating);
  }
}
