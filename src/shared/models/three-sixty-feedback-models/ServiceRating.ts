import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface IServiceRating {
  id: string;
  rateeId: string;
  dimension: string;
  values: {
    [raterId: string]: {
      additionalComment?: string;
      stopDoing: string; // Add the stopDoing property here
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

export const defaultServiceRating: IServiceRating = {
    id: "",
    rateeId: "",
    dimension:"",
    values: {},
    date: 0,
};

export default class Rating {
    private rating: IServiceRating;

    constructor(private store: AppStore, rating: IServiceRating) {
        makeAutoObservable(this);
        this.rating = rating;
    }

    get asJson(): IServiceRating {
        return toJS(this.rating);
    }
}
