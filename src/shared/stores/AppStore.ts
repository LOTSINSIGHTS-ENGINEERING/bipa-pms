import AuthStore from "./AuthStore";
import BusinessUnitStore from "./BusinessUnitStore";
import CompanyMeasureAuditStore from "./CompanyMeasureAuditStore";
import CompanyMeasureStore from "./CompanyMeasureStore";
import CompanyObjectiveStore from "./CompanyObjectiveStore";
import DepartmentMeasureAuditStore from "./DepartmentMeasureAuditStore";
import DepartmentMeasureStore from "./DepartmentMeasureStore";
import DepartmentObjectiveStore from "./DepartmentObjectiveStore";
import DepartmentStore from "./DepartmentStore";
import FolderFileStore from "./FolderFileStore";
import FolderStore from "./FolderStore";
import IndividualScorecardStore from "./IndividualScorecardStore";
import IndividualScorecardReviewStore from "./IndividualScorecardReviewStore";
import MeasureAuditStore from "./MeasureAuditStore";
import MeasureStore from "./MeasureStore";
import ObjectiveStore from "./ObjectiveStore";
import ProjectStore from "./ProjectStore";
import ReportStore from "./ReportStore";
import ScorecardStore from "./ScorecardStore";
import StrategicThemeStore from "./StrategicThemeStore";
import UploadManagerStore from "./UploadManagerStore";
import UserStore from "./UserStore";
import CompanyScorecardMetadataStore from "./CompanyScorecardMetadataStore";
import CompanyScorecardReviewStore from "./CompanyScorecardReviewStore";
import DepartmentScorecardMetadataStore from "./DepartmentScorecardMetadataStore";
import DepartmentScorecardReviewStore from "./DepartmentScorecardReviewStore";
import VissionMissionStore from "./VisionMissionStore";
import ProjectManagementStore from "./ProjectManagementStore";
import ProjectTaskStore from "./ProjectTaskStore";
import ProjectRiskStore from "./ProjectRiskStore";
import ProjectStatusStore from "./ProjectStatusStore";
import ProjectLogsStore from "./ProjectLogsStore";
import CheckInStore from "./CheckInStore";
import PortfolioStore from "./PortfolioStore";
import GeneralTaskStore from "./GeneralTaskStore";
import SubordinateObjectiveStore from "./SubordinateObjectiveStore";
import JobCardStore from "./JobCardStore";
import ValueStore from "./three-sixty-feeedback-stores/ValueStore";
import LeadershipStore from "./three-sixty-feeedback-stores/LeadershipStore";
import PrivateMessageStore from "./three-sixty-feeedback-stores/Messages/MessagesStore";
import RatingAssignmentStore from "./three-sixty-feeedback-stores/RatingAssignmentStore";
import ValueRatingStore from "./three-sixty-feeedback-stores/ValueRatingStore";
import LeadershipRatingStore from "./three-sixty-feeedback-stores/LeadershipRatingStore";

import ServiceStore from "./three-sixty-feeedback-stores/ServiceStore";
import CommitteeRatingStore from "./three-sixty-feeedback-stores/CommitteeRatingStore";
import CommitteeStore from "./three-sixty-feeedback-stores/CommitteeStore";
import ProjectRatingStore from "./three-sixty-feeedback-stores/ProjectRatingStore";
import RatingSessionStore from "./three-sixty-feeedback-stores/RatingSessionStore";
import ServiceRatingStore from "./three-sixty-feeedback-stores/ServiceRatingStore";
import TemplateRatingStore from "./three-sixty-feeedback-stores/TemplateRatingStore";
import TemplateStore from "./three-sixty-feeedback-stores/TemplateStore";
import ChatStore from "./three-sixty-feeedback-stores/Chat/ChatStore";

// import ClientStore from "./job-card-stores/Client";
// import LabourStore from "./job-card-stores/Labour";
// import MaterialStore from "./job-card-stores/Material";
// import OtherExpenseStore from "./job-card-stores/OtherExpense";
// import StandardStore from "./job-card-stores/Section";
// import PrecautionStore from "./job-card-stores/Division";
// import TaskStore from "./job-card-stores/Task";
// import ToolStore from "./job-card-stores/Tool";
// import TeamMemberStore from "./job-card-stores/TeamMember";

export default class AppStore {
  auth = new AuthStore(this);
  user = new UserStore(this);

  scorecard = new ScorecardStore(this);
  individualScorecardMetadata = new IndividualScorecardStore(this);
  individualScorecardReview = new IndividualScorecardReviewStore(this);

  objective = new ObjectiveStore(this);
  measure = new MeasureStore(this);
  measureAudit = new MeasureAuditStore(this);
  strategicTheme = new StrategicThemeStore(this);

  subordinateObjective = new SubordinateObjectiveStore(this);

  companyObjective = new CompanyObjectiveStore(this);
  companyMeasure = new CompanyMeasureStore(this);
  companyMeasureAudit = new CompanyMeasureAuditStore(this);
  companyScorecardMetadata = new CompanyScorecardMetadataStore(this);
  companyScorecardReview = new CompanyScorecardReviewStore(this);

  departmentObjective = new DepartmentObjectiveStore(this);
  departmentMeasure = new DepartmentMeasureStore(this);
  departmentMeasureAudit = new DepartmentMeasureAuditStore(this);
  departmentScorecardMetadata = new DepartmentScorecardMetadataStore(this);
  departmentScorecardReview = new DepartmentScorecardReviewStore(this);

  department = new DepartmentStore(this);
  businessUnit = new BusinessUnitStore(this);
  visionmission = new VissionMissionStore(this);
  project = new ProjectStore(this);
  report = new ReportStore(this);
  folder = new FolderStore(this);
  folderFile = new FolderFileStore(this);
  jobcard = new JobCardStore(this);

  //jobCard = new JobCardStore(this);
  //jobCardMember= new JobCardMemberStore(this)
  // upload manager
  uploadManager = new UploadManagerStore(this);

  // project Management Stores
  portfolio = new PortfolioStore(this);
  projectManagement = new ProjectManagementStore(this);
  projectTask = new ProjectTaskStore(this);
  projectRisk = new ProjectRiskStore(this);
  projectStatus = new ProjectStatusStore();
  projectLogs = new ProjectLogsStore(this);
  generalTask = new GeneralTaskStore(this);

  // check in
  checkIn = new CheckInStore(this);
    //360-feedback stores
    value = new ValueStore(this);
    leadership = new LeadershipStore(this);
    messages = new PrivateMessageStore(this);
    ratingAssignments = new RatingAssignmentStore(this);
    valueRating = new ValueRatingStore(this);
    leadershipRating = new LeadershipRatingStore(this);
    chat = new ChatStore(this);
    projects = new ProjectStore(this);
    services = new ServiceStore(this);
    committees = new CommitteeStore(this);
    projectRating = new ProjectRatingStore(this);
    serviceRating = new ServiceRatingStore(this);
    committeeRating = new CommitteeRatingStore(this);
    ratingSession = new RatingSessionStore(this);
    templates = new TemplateStore(this);
    templateRating = new TemplateRatingStore(this);
    //360-feedback stores
}
