import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface Answer {
  questionId: string;
  rating: number;
}

export interface IRatingSession {
  id: string;
  rateeId: string;
  raterId: string;
  heading:string;
  description:string;
  reasonForRequest:string;
  dueDate:string;
  templateId: string;
  status: "Not Started" | "In Progress" | "Completed";
  answers: Answer[];
  start: string;
  stop: string;
  continue:string;
  additionalComments?: string;
  name?: string;
  dateRequested?:string;
}

export const defaultRatingSession: IRatingSession = {
  id: "",
  rateeId: "",
  raterId: "",
  templateId: "",
  answers: [] as Answer[],
  status: "Not Started",
  heading: "",
  description: "",
  reasonForRequest: "",
  dueDate: "",
  start: "",
  stop: "",
  continue: "",
  dateRequested:"",
};

export default class RatingSession {
  private ratingSession: IRatingSession;

  constructor(private store: AppStore, ratingSession: IRatingSession) {
    makeAutoObservable(this);
    this.ratingSession = ratingSession;
  }

  get asJson(): IRatingSession {
    return toJS(this.ratingSession);
  }

  // Add methods to update the session state correctly
  // and handle any potential duplication scenarios
}
