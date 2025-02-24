import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";


export const defaultValueRatingScores: ILeadershipRatingScores = {
  id: "",
  totalValueScore:"",
  totalLeadershipScore:""
};

export interface ILeadershipRatingScores {
  id: string;
  totalValueScore:string;
  totalLeadershipScore:string;
}

export default class ChatModel {
  private message: ILeadershipRatingScores ;

  constructor(private store: AppStore, message: ILeadershipRatingScores ) {
    makeAutoObservable(this);
    this.message = message;
  }

  get asJson(): ILeadershipRatingScores  {
    return toJS(this.message);
  }
}
