import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface IProject {
    id: string;
    projectName: string;
    statements: {
        statement: string;
        rating: number;
    }[];
}

export const defaultProject: IProject = {
    id: "",
    projectName: "",
    statements:[{
        statement:"",
        rating:0,
    }]
};

export default class Project {
    private value: IProject;

    constructor(private store: AppStore, value: IProject) {
        makeAutoObservable(this);
        this.value = value;
    }

    get asJson(): IProject {
        return toJS(this.value);
    }
}
