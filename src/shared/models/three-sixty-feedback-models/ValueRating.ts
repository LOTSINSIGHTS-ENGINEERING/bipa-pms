import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface IValueRating {
  overallRating: number;
  id: string;
  rateeId: string;
  raterId?: string;
  dimension: string;
  description: string;
  department: string;
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
      valueScore?: number;
    };
  };
  date: number;
  resubmission?: SubmissionType;
  adminApproval?: AdminApprovalType;
}
export type SubmissionType = "Closed" | "Open"|"default"|"To be rated";
export type AdminApprovalType = "Approved for Re-rating" | "Pending";


export const defaultValueRating: IValueRating = {
    id: "",
    rateeId: "",
    dimension: "",
    values: {},
    date: 0,
    overallRating: 0,
    department: "",
    isflagged: false,
    description: ""
};

export default class Rating {
    private rating: IValueRating;

    constructor(private store: AppStore, rating: IValueRating) {
        makeAutoObservable(this);
        this.rating = rating;
    }

    get asJson(): IValueRating {
        return toJS(this.rating);
    }
}