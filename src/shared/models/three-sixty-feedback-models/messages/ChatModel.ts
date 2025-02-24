import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../../stores/AppStore";

export const defaultChatModel: IChatModel = {
  id: "",
  users: []
};

export interface IChatModel {
  id: string;
  users: string[];
}

export default class ChatModel {
  private message: IChatModel;

  constructor(private store: AppStore, message: IChatModel) {
    makeAutoObservable(this);
    this.message = message;
  }

  get asJson(): IChatModel {
    return toJS(this.message);
  }
}
