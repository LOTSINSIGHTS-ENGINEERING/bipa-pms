import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface IRateAssignment {
    id: string; 
   description?:string;
    isActive:boolean;
    midtermReview: {
        status: FeedbackStatus;
        startDate: string;
        endDate: string;
    };
    finalAssessment: {
        status: FeedbackStatus;
        startDate: string;
        endDate: string;
    };
    status:FeedbackStatus;
    feedbackAssignments: Record<string, string[]>; 
    ratedUsersPerAssignmentValues: Record<string, string[]>;
    ratedUsersPerAssignmentLeadership: Record<string, string[]>;
}

export interface ISession {
    id: string; 
   description?:string;
  
}

export const defaultRatingAssignment: IRateAssignment = {
    id: "",
    description: "",
    isActive: false,
    midtermReview: {
        status: "Not Started",
        startDate: "",
        endDate: "",
    },
    finalAssessment: {
        status: "Not Started",
        startDate: "",
        endDate: "",
    },
    status: "Not Started",
    feedbackAssignments: {}, // Initialize with an empty object for feedback assignments
    ratedUsersPerAssignmentValues: {},
    ratedUsersPerAssignmentLeadership: {},
};

export type FeedbackStatus = "Not Started"|"In Progress" | "Cancelled" | "Completed";

export default class RateAssignment {
    private rateAssignment: IRateAssignment;

    constructor(private store: AppStore, rateAssignment: IRateAssignment) {
        makeAutoObservable(this);
        this.rateAssignment = rateAssignment;
    }

    get asJson(): IRateAssignment {
        return toJS(this.rateAssignment);
    }
}
