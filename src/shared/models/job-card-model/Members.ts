import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface IMember {
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
}


  export const defaultMember: IMember = {
    id: "",
    name: "",
    telephone: "",
    mobileNumber: "",
    address: "",
    email: "",
    location: "",
    city: "",
    physicalAddress: "",
  };

  export default class Member {
    private member: IMember;

    constructor(private store: AppStore, member: IMember) {
      makeAutoObservable(this);
      this.member = member;
    }

    get asJson(): IMember {
      return toJS(this.member);
    }
  }