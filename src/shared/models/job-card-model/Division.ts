import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";



export const defaultDivision: IDivision = {
  id: "",
  name: "",
  divisionOwner: "",
  description: "",
  createdDate: new Date().toISOString(),
  isActive: true,
};

export interface IDivision {
  id: string;
  name: string;
  divisionOwner: string; // Owner of the division
  description: string;   // Description of the division
  createdDate: string;   // Creation date of the division
  isActive: boolean;     // Whether the division is active
}

export class Division {
  private division: IDivision;

  constructor(private store: AppStore, division: IDivision) {
    makeAutoObservable(this);
    this.division = division;
  }

  get asJson(): IDivision {
    return toJS(this.division);
  }
}


