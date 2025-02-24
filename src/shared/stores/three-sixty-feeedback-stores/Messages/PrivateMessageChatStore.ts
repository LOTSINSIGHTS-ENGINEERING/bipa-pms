
import { runInAction } from "mobx";
import PrivateMessagetModel, { IPrivateMessage } from "../../../models/three-sixty-feedback-models/messages/MessagesModel";
import AppStore from "../../AppStore";
import Store from "../../Store";
import ChatModel, { IChatModel } from "../../../models/three-sixty-feedback-models/messages/ChatModel";


export default class ChatStore extends Store<
  IChatModel,
  ChatModel
> {
  items = new Map<string, ChatModel>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }

  load(items: IChatModel[] = []) {
    runInAction(() => {
      items.forEach((item) =>
        this.items.set(item.id, new ChatModel(this.store, item))
      );
    });
  }
}
