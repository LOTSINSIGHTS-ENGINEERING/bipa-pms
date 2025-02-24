import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface ILeadershipRating {
  overallRating: number;
  id: string;
  rateeId: string;
  dimension: string;
  isflagged: boolean;
  department: string;
  description: string;
  raterId?: string;
  criteria: {
    [raterId: string]: {
      additionalComment?: string;
      stopDoing: string;
      startDoing: string;
      continueDoing: string;
      ratings: {
        [criteriaName: string]: {
          [statement: string]: number;
        };
      };
      leadershipScore?: number;
    };
  };
  date: number;
  resubmission?: SubmissionType;
  adminApproval?: AdminApprovalType;
}
export type SubmissionType = "Closed" | "Open"|"default"|"To be rated";
export type AdminApprovalType = "Approved for Re-rating" | "Pending";


export const defaultLeadershipRating: ILeadershipRating = {
    id: "",
    rateeId: "",
    dimension: "",
    criteria: {},
    date: 0,
    overallRating: 0,
    isflagged: false,
    department: "",
    description: ""
};

export default class Rating {
    private rating: ILeadershipRating;

    constructor(private store: AppStore, rating: ILeadershipRating) {
        makeAutoObservable(this);
        this.rating = rating;
    }

    get asJson(): ILeadershipRating {
        return toJS(this.rating);
    }
}
