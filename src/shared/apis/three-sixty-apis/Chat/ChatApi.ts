import { UserInfo, Message } from "../../../models/three-sixty-feedback-models/Chats/ChatModel";

export interface ChatData {
  userInfo: UserInfo;
  lastMessage?: Message;
  date: Date;
}

class ChatApi {

  private static chatData: ChatData[] = [];


  static async fetchChatData(userId: string): Promise<ChatData[]> {
    return this.chatData.filter((chat) => chat.userInfo.userId === userId);
  }

  static async sendMessage(userId: string, message: Message): Promise<void> {
    const chat = this.chatData.find((chat) => chat.userInfo.userId === userId);
    if (chat) {
      chat.lastMessage = message;
      chat.date = new Date(); 
    }
  }

}

export default ChatApi;
