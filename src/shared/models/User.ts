import { makeAutoObservable, runInAction, toJS } from "mobx";
import AppStore from "../stores/AppStore";

export const defaultUser: IUser = {
  uid: "",
  firstName: "",
  lastName: "",
  email: "",
  displayName: "",
  phoneNumber: "",
  emailVerified: false,
  userVerified: false,
  isAnonymous: false,
  photoURL: "",
  createdAt: "",
  lastLoginAt: "",
  jobTitle: null,
  department: "",
  supervisor: "none",
  role: "Employee",
  disabled: false,
  feature: [
    {
      featureName: "Dashboard -View Company Performance",
      create: true,
      read: true,
      update: true,
      delete: true,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Dashboard -View Department Performance",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Dashboard -View Individual Performance",
      create: false,
      read: true,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Strategy Map -View Audit",
      create: false,
      read: true,
      update: false,
      delete: false,
    },

    {
      featureName: "Company Scorecards -View Q1 Reviews",
      create: false,
      read: true,
      update: false,
      delete: false,
    },
    {
      featureName: "Company Scorecards -View Midterm Reviews",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
    },
    {
      featureName: "Company Scorecards -View Q3 Reviews",
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    {
      featureName: "Department -View Scorecards",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
    },
    {
      featureName: "Department -Add Objective",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
    },
    {
      featureName: "Individual Scorecard -Add Objective",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Job Cards -Create",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Add New User",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "New Scorecard",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },

    {
      featureName: "New Department",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "New Business Unit",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "New Strategic Themes",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "New Vision and Mission",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
    {
      featureName: "Relating to",
      create: false,
      read: false,
      update: false,
      delete: false,
      verify: false,
      authorise: false,
    },
  ],
};

export interface IUser {
  uid: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string;
  phoneNumber: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  userVerified: boolean;
  isAnonymous: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
  department: string;
  supervisor: string;
  role: string;
  jobTitle: string | null;
  devUser?: boolean;
  disabled?: boolean;
  feature: IFeatureAccess[];
   onReports?: boolean,

  
 
};
export interface IFeatureAccess {
  featureName: SystemFeatures;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  verify?: boolean;
  authorise?: boolean;
}
export type SystemFeatures =
  | "Dashboard -View Company Performance"
  | "Dashboard -View Department Performance"
  | "Dashboard -View Individual Performance"
  | "Strategy Map -View Audit"
  | "Company Scorecards -View Q1 Reviews"
  | "Company Scorecards -View Midterm Reviews"
  | "Company Scorecards -View Q3 Reviews"
  | "Department -View Scorecards"
  | "Department -Add Objective"
  | "Individual Scorecard -Add Objective"
  | "Job Cards -Create"
  | "Add New User"
  | "New Scorecard"
  | "New Department"
  | "New Business Unit"
  | "New Strategic Themes"
  | "New Vision and Mission"
  | "Relating to";



export default class User {
  // Private properties should start wtih an underscore.
  private _user: IUser;
  private _subordinates = new Map<string, User>();

  constructor(private store: AppStore, user: IUser) {
    makeAutoObservable(this);
    this._user = user;
  }

  get asJson(): IUser {
    return toJS(this._user);
  }

  private findSubordinates(uid?: string) {
    // Avoid user reporting to themselve error
    if (uid === this.asJson.uid) return;

    // Get subordinates
    const users = this.store.user.all;
    const subs = uid
      ? users.filter((u) => u.asJson.supervisor === uid)
      : users.filter((u) => u.asJson.supervisor === this._user.uid);

    this.updateSubordinates(subs);
    subs.forEach((u) => this.findSubordinates(u.asJson.uid));
  }

  private updateSubordinates(items: User[]) {
    runInAction(() => {
      items.forEach((item) => this._subordinates.set(item.asJson.uid, item));
    });
  }

  get subordinates() {
    this.findSubordinates();
    return Array.from(this._subordinates.values());
  }

  get supervisor() {
    return this.store.user.getById(this._user.supervisor);
  }

  get department() {
    return this.store.department.getById(this._user.department);
  }

  // Maybe not important
  get objectives() {
    const uid = this._user.uid;
    return this.store.objective.getByUid(uid);
  }
}
