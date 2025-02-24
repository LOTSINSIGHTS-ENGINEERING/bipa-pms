import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";


export const defaultValueRatingScores: IValueRatingScores = {
  id: "",
  totalValueScore:"",
  totalLeadershipScore:""
};

export interface IValueRatingScores {
  id: string;
  totalValueScore:string;
  totalLeadershipScore:string;
}

export default class ValueRatingModel {
  private message: IValueRatingScores ;

  constructor(private store: AppStore, message: IValueRatingScores ) {
    makeAutoObservable(this);
    this.message = message;
  }

  get asJson(): IValueRatingScores  {
    return toJS(this.message);
  }
}
