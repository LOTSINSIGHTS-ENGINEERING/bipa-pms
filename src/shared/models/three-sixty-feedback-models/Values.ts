import { makeAutoObservable, toJS } from "mobx";
import AppStore from "../../stores/AppStore";

export interface IValue {
    id: string;
    valueName: string;
    statements: {
        statement: string;
        rating: number;
    }[];
}

export const defaultValue: IValue = {
    id: "",
    valueName: "",
    statements:[{
        statement:"",
        rating:0,
    }]
};

export default class Value {
    private value: IValue;

    constructor(private store: AppStore, value: IValue) {
        makeAutoObservable(this);
        this.value = value;
    }

    get asJson(): IValue {
        return toJS(this.value);
    }
}
