import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface ICommittee {
  id: string;
  committeeName: string;
  statements: {
    statement: string;
    rating: number;
  }[];
  status?: RatingStatus;
}

export const defaultCommittee: ICommittee = {
    id: "",
    committeeName: "",
    statements:[{
        statement:"",
        rating:0,
    }]
};

export type RatingStatus =
  | "In progress"
  | "Completed"
  
export default class Committee {
    private value: ICommittee;

    constructor(private store: AppStore, value: ICommittee) {
        makeAutoObservable(this);
        this.value = value;
    }

    get asJson(): ICommittee {
        return toJS(this.value);
    }
}