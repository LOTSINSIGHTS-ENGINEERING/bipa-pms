import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface ICommitteeRating {
  id: string;
  rateeId: string;
  dimension: string;
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
  date: number;
  status?: RatingStatus;
}

export type RatingStatus = "In progress" | "Completed";
export const defaultCommitteeRating: ICommitteeRating = {
    id: "",
    rateeId: "",
    dimension:"",
    values: {},
    date: 0,
};

export default class Rating {
    private rating: ICommitteeRating;

    constructor(private store: AppStore, rating: ICommitteeRating) {
        makeAutoObservable(this);
        this.rating = rating;
    }

    get asJson():ICommitteeRating {
        return toJS(this.rating);
    }
}
