import { collection } from "firebase/firestore";
import { db } from "../config/firebase-config";
import AppStore from "../stores/AppStore";
import AppApi from "./AppApi";
import ClientApi from "./job-card-api/Client";
import JobApi from "./job-card-api/Jobcard";
import LabourApi from "./job-card-api/Labour";
import MaterialApi from "./job-card-api/Material";
import OtherExpenseApi from "./job-card-api/OtherExpense";

import StandardApi from "./job-card-api/Section";
import TaskApi from "./job-card-api/Task";
import TeamMemberApi from "./job-card-api/TeamMember";
import ToolApi from "./job-card-api/Tool";
import DivisionApi from "./job-card-api/Division";
import SectionApi from "./job-card-api/Section";
import MemberApi from "./job-card-api/Members";



export default class JobCardApi {
  client: ClientApi;
  jobcard: JobApi;
  material: MaterialApi;
  otherExpense: OtherExpenseApi;
  division: DivisionApi;
  section: SectionApi;
  member:MemberApi
  task: TaskApi;
  tool: ToolApi;
  teamMember: TeamMemberApi;
  labour: LabourApi;

  constructor(api: AppApi, store: AppStore) {
    this.client = new ClientApi(api, store);
    this.jobcard = new JobApi(api, store);
    this.material = new MaterialApi(api, store);
     this.member = new MemberApi(api, store);
    this.otherExpense = new OtherExpenseApi(api, store);
    this.division = new DivisionApi(api, store);
    this.section = new SectionApi(api, store);
    this.task = new TaskApi(api, store);
    this.tool = new ToolApi(api, store);
    this.teamMember = new TeamMemberApi(api, store);
    this.labour = new LabourApi(api, store);
  }
}
