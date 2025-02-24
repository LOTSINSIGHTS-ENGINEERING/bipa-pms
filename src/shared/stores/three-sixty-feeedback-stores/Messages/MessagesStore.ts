
import { runInAction } from "mobx";
import PrivateMessagetModel, { IPrivateMessage } from "../../../models/three-sixty-feedback-models/messages/MessagesModel";
import AppStore from "../../AppStore";
import Store from "../../Store";


export default class PrivateMessageStore extends Store<
  IPrivateMessage,
  PrivateMessagetModel
> {
  items = new Map<string, PrivateMessagetModel>();

  constructor(store: AppStore) {
    super(store);
    this.store = store;
  }

  load(items: IPrivateMessage[] = []) {
    runInAction(() => {
      items.forEach((item) =>
        this.items.set(item.id, new PrivateMessagetModel(this.store, item))
      );
    });
  }
}
