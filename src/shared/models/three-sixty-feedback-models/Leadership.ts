import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface ILeadership {
    id: string;
    criteriaName: string;
    statements: {
        statement: string;
        rating: number;
        isSelected?:boolean;
    }[];
}

export const defaultLeadership: ILeadership = {
    id: "",
    criteriaName: "",
    statements:[{
        statement:"",
        rating:0,
    }]
};

export default class Leadership {
    private leadership: ILeadership;

    constructor(private store: AppStore, leadership: ILeadership) {
        makeAutoObservable(this);
        this.leadership = leadership;
    }

    get asJson(): ILeadership {
        return toJS(this.leadership);
    }
}
