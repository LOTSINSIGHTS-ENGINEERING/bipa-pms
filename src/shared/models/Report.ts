import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../stores/AppStore";
import { IMeasure } from "./Measure";

export type IDepartmentPeformanceData = {
  id: string;
  departmentName: string;
  avg: number;
  weight: number;
  min: number;
  median: number;
  max: number;
  total: number;
};

export interface IUserPerformanceData {
  uid: string;
  userName: string;
  measures: IMeasure[];
  rating: number;
  supervisorMidtermRating:number;
  supervisorFinalAssesmentRating:number;
  employeeFinalAssesmentRating:number;
  
  weight: number;
  weightValidity: boolean;
  department: string;
  departmentName: string;
  midtermAutoRating?: number; //midterm auto rating
  midtermRating?: number; // supervisor midterm rating
  autoRating?: number; //final auto rating
  finalRating?: number; // supervisor final rating
}
// export interface IUserPerformanceData {
//   uid: string;
//   userName: string;
//   measures: IMeasure[];
//   // rating: number;
//   // midtermRating: number;
//   // finalRating: number;
//   // midtermAutoRating: number; //midterm auto rating
//   // midtermRating: number; // supervisor midterm rating



//   weight: number;
//   weightValidity: boolean;
//   department: string;
//   departmentName: string;
// }

export default class UserPerformanceData {
  private data: IUserPerformanceData;

  constructor(private store: AppStore, data: IUserPerformanceData) {
    makeAutoObservable(this);
    this.data = data;
  }

  get asJson(): IUserPerformanceData {
    return toJS(this.data);
  }
}
