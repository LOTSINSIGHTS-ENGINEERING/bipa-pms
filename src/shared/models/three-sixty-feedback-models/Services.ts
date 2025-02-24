import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface IService {
    id: string;
    serviceName: string;
    statements: {
        statement: string;
        rating: number;
    }[];
}

export const defaultService: IService = {
    id: "",
    serviceName: "",
    statements:[{
        statement:"",
        rating:0,
    }]
};

export default class Service {
    private value: IService;

    constructor(private store: AppStore, value: IService) {
        makeAutoObservable(this);
        this.value = value;
    }

    get asJson(): IService {
        return toJS(this.value);
    }
}
