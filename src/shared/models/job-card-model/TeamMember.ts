
import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface ITeamMember {
  id: string; // Assuming the user id is a string
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
export const defaultTeamMember: ITeamMember ={
  id: "", // Assuming the user id is a string
  name: "",
  telephone: "",
  mobileNumber: "",
  address: "",
  email: "",
  location: "",
  physicalAddress: "",
  city: "Nkurenkuru"
  
}

  export default class TeamMember {
    private teamMember: ITeamMember;

    constructor(private store: AppStore, teamMember: ITeamMember) {
        makeAutoObservable(this);
        this.teamMember = teamMember;
    }

    get asJson(): ITeamMember {
        return toJS(this.teamMember);
    }
}