import AppStore from "./AppStore";
import ClientStore from "./job-card-stores/Client";
import JobStore from "./job-card-stores/Jobcard";
import LabourStore from "./job-card-stores/Labour";
import MaterialStore from "./job-card-stores/Material";
import OtherExpenseStore from "./job-card-stores/OtherExpense";
import PrecautionStore from "./job-card-stores/Division";

import TaskStore from "./job-card-stores/Task";
import TeamMemberStore from "./job-card-stores/TeamMember";
import ToolStore from "./job-card-stores/Tool";
import DivisionStore from "./job-card-stores/Division";
import SectionStore from "./job-card-stores/Section";
import MemberStore from "./job-card-stores/Members";

export default class JobCardStore {
  client: ClientStore;
  member: MemberStore;
  jobcard: JobStore;
  material: MaterialStore;
  otherExpense: OtherExpenseStore;
  division: DivisionStore;
  section: SectionStore;
  task: TaskStore;
  tool: ToolStore;
  teamMember: TeamMemberStore;
  labour: LabourStore;

  constructor(store: AppStore) {
    //Job Card
    this.member = new MemberStore(store);
    this.client = new ClientStore(store);
    this.jobcard = new JobStore(store);
    this.material = new MaterialStore(store);
    this.otherExpense = new OtherExpenseStore(store);
    this.division = new DivisionStore(store);
    this.section = new SectionStore(store);
    this.task = new TaskStore(store);
    this.tool = new ToolStore(store);
    this.teamMember = new TeamMemberStore(store);
    this.labour = new LabourStore(store);
  }
}
