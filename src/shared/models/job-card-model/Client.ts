import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface IClient {
  id: string;
  name: string;
  telephone: string;
  mobileNumber: string;
  address: string;
  email: string;
  location: string;
  physicalAddress: string;
  city: string;
  secondaryMobile?: string;
    status?: IStatus;
}



 export type IStatus = "Archived"; 

  export const defaultClient: IClient = {
    id: "",
    name: "",
    telephone: "",
    mobileNumber: "",
    address: "",
    email: "",
    location: "",
    city: "Nkurenkuru",
    physicalAddress: ""
  }

  export default class Client {
    private client: IClient;

    constructor(private store: AppStore, client: IClient) {
        makeAutoObservable(this);
        this.client = client;
    }

    get asJson(): IClient {
        return toJS(this.client);
    }
}