import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface IProjectRating {
    id: string;
    rateeId: string;
    dimension:string;
    values: {
        [raterId: string]: {
            additionalComment?: string;
            stopDoing: string;
            startDoing: string;
            continueDoing: string;
            ratings: {
                [valueName: string]: {
                    [statement: string]: number;
                };
            };
        };
    };
    date: number; 
}

export const defaultProjectRating: IProjectRating = {
    id: "",
    rateeId: "",
    dimension:"",
    values: {},
    date: 0,
};

export default class Rating {
    private rating: IProjectRating;

    constructor(private store: AppStore, rating: IProjectRating) {
        makeAutoObservable(this);
        this.rating = rating;
    }

    get asJson(): IProjectRating {
        return toJS(this.rating);
    }
}
