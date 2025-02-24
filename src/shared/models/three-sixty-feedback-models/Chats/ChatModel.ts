
// interface UserInfo {
//     displayName: string;
//     photoURL: string;
//   }
  
//   interface Message {
//     text: string;
//   }
  
//   interface ChatData {
//     userInfo: UserInfo;
//     lastMessage?: Message;
//     date: Date;
//   }

  import { makeAutoObservable } from "mobx";

  

  export interface UserInfo {
    userId: string;
    displayName: string;
    photoURL: string;
  }
  
  export interface Message {
    text: string;
  }
  
  export default class ChatModel {
    userInfo: UserInfo;
    lastMessage?: Message;
    date: Date;
  
    constructor(userInfo: UserInfo, date: Date, lastMessage?: Message) {
      this.userInfo = userInfo;
      this.date = date;
      this.lastMessage = lastMessage;
      
      makeAutoObservable(this);
    }
  }
  
  
  