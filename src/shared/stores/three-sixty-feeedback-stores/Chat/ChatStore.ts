import { makeAutoObservable } from "mobx";
import ChatModel, { Message, UserInfo } from "../../../models/three-sixty-feedback-models/Chats/ChatModel"; // Import ChatModel instead of destructuring
import ChatApi from "../../../apis/three-sixty-apis/Chat/ChatApi";

class ChatStore {
  chatData: ChatModel[] = []; 
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchChatData(userId: string): Promise<void> {
    this.loading = true;
    try {
      this.chatData = await ChatApi.fetchChatData(userId);
      this.error = null;
    } catch (error) {
      this.error = "Failed to fetch chat data";
      console.error("Error fetching chat data:", error);
    } finally {
      this.loading = false;
    }
  }

  async sendMessage(userId: string, message: Message): Promise<void> {
    try {
      await ChatApi.sendMessage(userId, message);
      
      await this.fetchChatData(userId);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
}

const chatStore = new ChatStore();
export default chatStore;
