import AppStore from "../stores/AppStore";
import MailApi from "./MailApi";

import { mailApiEndpoint } from "../config/mail-api-config";
import MeasureApi from "./MeasureApi";
import BusinessUnitApi from "./BusinessUnitApi";
import DepartmentApi from "./DepartmentApi";
import ObjectiveApi from "./ObjectiveApi";
import ProjectApi from "./ProjectApi";
import ScorecardApi from "./ScorecardApi";
import AuthApi from "./AuthApi";
import UserApi from "./UserApi";
import MeasureAuditApi from "./MeasureAuditApi";
import FolderApi from "./FolderApi";
import FolderFileApi from "./FolderFileApi";
import UploadManagerApi from "./UploadManagerApi";
import CompanyObjectiveApi from "./CompanyObjectiveApi";
import CompanyMeasureApi from "./CompanyMeasureApi";
import CompanyMeasureAuditApi from "./CompanyMeasureAuditApi";
import DepartmentMeasureApi from "./DepartmentMeasureApi";
import DepartmentMeasureAuditApi from "./DepartmentMeasureAuditApi";
import DepartmentObjectiveApi from "./DepartmentObjectiveApi";
import IndividualScorecardApi from "./IndividualScorecardApi";
import StrategicThemeApi from "./StrategicThemeApi";
import IndividualScorecardReviewApi from "./IndividualScorecardReviewApi";
import CompanyScorecardMetadataApi from "./CompanyScorecardMetadataApi";
import CompanyScorecardReviewApi from "./CompanyScorecardReviewApi";
import DepartmentScorecardReviewApi from "./DepartmentScorecardReviewApi";
import DepartmentScorecardMetadataApi from "./DepartmentScorecardMetadataApi";
import VisionMissionAPi from "./VisionMissionAPi";
import CheckInApi from "./CheckInApi";
import ProjectManagementApi from "./ProjectManagementApi";
import GeneralTaskApi from "./GeneralTaskApi";
import SubordinateObjectiveApi from "./SubordinateObjectiveApi";

import JobCardApi from "./JobCardApi";
import ChatApi from "./three-sixty-apis/Chat/ChatApi";
import CommitteeApi from "./three-sixty-apis/Committee";
import CommitteeRatingApi from "./three-sixty-apis/CommitteeRatingApi";
import LeadershipApi from "./three-sixty-apis/LeadershipApi";
import LeadershipRatingApi from "./three-sixty-apis/LeadershipRatingApi";
import MessagesApi from "./three-sixty-apis/messages/MessagesApi";
import ProjectRatingApi from "./three-sixty-apis/ProjectRatingApi";
import RatingAssignmentApi from "./three-sixty-apis/RatingAssignmentApi";
import RatingSessionApi from "./three-sixty-apis/RatingSessionApi";
import ServiceApi from "./three-sixty-apis/ServiceApi";
import ServiceRatingApi from "./three-sixty-apis/ServiceRatingApi";
import TemplateApi from "./three-sixty-apis/TemplateApi";
import TemplateRatingApi from "./three-sixty-apis/TemplateRatingApi";
import ValueApi from "./three-sixty-apis/ValueApi";
import ValueRatingApi from "./three-sixty-apis/ValueRatingApi";

export const apiPathCompanyLevel = (
  category:
    | "projects"
    | "scorecards"
    | "businessUnits"
    | "visionMission"
    | "departments"
    | "users"
    | "folders"
    | "folderFiles"
): string => {
  return `companies/mw21n2gir3bjvUCQeQgN/${category}`;
};

export const apiPathScorecardLevel = (
  scorecardId: string,
  category:
    | "scorecardMetadata"
    | "scorecardDraftReviews"
    | "scorecardQuarter1Reviews"
    | "scorecardQuarter2Reviews"
    | "scorecardQuarter3Reviews"
    | "scorecardQuarter4Reviews"
    | "measures"
    | "measuresAudit"
    | "objectives"
    | "strategicThemes"
    | "companyObjectives"
    | "companyMeasuresAudit"
    | "companyMeasures"
    | "departmentObjectives"
    | "departmentMeasures"
    | "departmentMeasuresAudit"
    | "subordinateIbjectives"
): string => {
  return `${apiPathCompanyLevel("scorecards")}/${scorecardId}/${category}`;
};

export const apiPathProjectLevel = (
  projectId: string,
  category: "tasks" | "risks" | "logs"
): string => {
  return `${"projects"}/${projectId}/${category}`;
};

export default class AppApi {
  mail: MailApi;
  auth: AuthApi;
  user: UserApi;

  objective: ObjectiveApi;
  measure: MeasureApi;
  measureAudit: MeasureAuditApi;

  surbodinateObjective: SubordinateObjectiveApi;

  scorecard: ScorecardApi;
  individualScorecardMetadata: IndividualScorecardApi;
  individualScorecardReview: IndividualScorecardReviewApi;

  //jobCard Api
jobcard:JobCardApi;

  companyObjective: CompanyObjectiveApi;
  companyMeasure: CompanyMeasureApi;
  companyMeasureAudit: CompanyMeasureAuditApi;
  companyScorecardMetadata: CompanyScorecardMetadataApi;
  companyScorecardReview: CompanyScorecardReviewApi;
  strategicTheme: StrategicThemeApi;

  departmentObjective: DepartmentObjectiveApi;
  departmentMeasure: DepartmentMeasureApi;
  departmentMeasureAudit: DepartmentMeasureAuditApi;
  departmentScorecardMetadata: DepartmentScorecardMetadataApi;
  departmentScorecardReview: DepartmentScorecardReviewApi;
  department: DepartmentApi;

  businessUnit: BusinessUnitApi;
  visionmission: VisionMissionAPi;

  project: ProjectApi;
  folder: FolderApi;
  folderFile: FolderFileApi;

  // upload api manager
  uploadManager: UploadManagerApi;

  //project management
  projectManagement: ProjectManagementApi;

  //general task
  generalTask: GeneralTaskApi;

  // check in
  checkIn: CheckInApi;
 
   //360 feedback apis
   value: ValueApi;
   leadership: LeadershipApi;
   messages: MessagesApi;
   ratingAssignments: RatingAssignmentApi;
   valueRating: ValueRatingApi;
   leadershipRating: LeadershipRatingApi;
   projects: ProjectApi;
   service: ServiceApi;
   committee: CommitteeApi;
   serviceRating: ServiceRatingApi;
   committeeRating: CommitteeRatingApi;
   projectRating: ProjectRatingApi;
   chatApi: ChatApi;
   template: TemplateApi;
   ratingSession: RatingSessionApi; //will be removed
   templates:TemplateApi;
   templateRating:TemplateRatingApi;
   //360 feedback apis

  constructor(store: AppStore) {
    this.mail = new MailApi(this, store, mailApiEndpoint);
    this.auth = new AuthApi(this, store);

    // Company Level Paths
    this.department = new DepartmentApi(this, store);
    this.businessUnit = new BusinessUnitApi(this, store);
    this.visionmission = new VisionMissionAPi(this, store);
    this.project = new ProjectApi(this, store);
    this.scorecard = new ScorecardApi(this, store);
    this.user = new UserApi(this, store);
    this.folder = new FolderApi(this, store);
    this.folderFile = new FolderFileApi(this, store);

    //Job Cards
  this.jobcard = new JobCardApi(this, store);

    // File Upload Manager
    this.uploadManager = new UploadManagerApi(this, store);

    // Scorecard Level Paths
    this.individualScorecardMetadata = new IndividualScorecardApi(this, store);
    this.individualScorecardReview = new IndividualScorecardReviewApi(
      this,
      store
    );
    this.objective = new ObjectiveApi(this, store);
    this.measure = new MeasureApi(this, store);
    this.measureAudit = new MeasureAuditApi(this, store);
    this.strategicTheme = new StrategicThemeApi(this, store);

    // subordinates
    this.surbodinateObjective = new SubordinateObjectiveApi(this, store);

    // Company APIs
    this.companyObjective = new CompanyObjectiveApi(this, store);
    this.companyMeasure = new CompanyMeasureApi(this, store);
    this.companyMeasureAudit = new CompanyMeasureAuditApi(this, store);
    this.companyScorecardMetadata = new CompanyScorecardMetadataApi(
      this,
      store
    );
    this.companyScorecardReview = new CompanyScorecardReviewApi(this, store);

    // Department APIs
    this.departmentObjective = new DepartmentObjectiveApi(this, store);
    this.departmentMeasure = new DepartmentMeasureApi(this, store);
    this.departmentMeasureAudit = new DepartmentMeasureAuditApi(this, store);
    this.departmentScorecardMetadata = new DepartmentScorecardMetadataApi(
      this,
      store
    );
    this.departmentScorecardReview = new DepartmentScorecardReviewApi(
      this,
      store
    );

    // Project Managements APIs
    this.projectManagement = new ProjectManagementApi(this, store);
    this.generalTask = new GeneralTaskApi(this, store);
  //360 feedback
  this.value = new ValueApi(this, store);
  this.leadership = new LeadershipApi(this, store);
  this.messages = new MessagesApi(this, store);
  this.valueRating = new ValueRatingApi(this, store);
  this.leadershipRating = new LeadershipRatingApi(this, store);
  this.ratingAssignments = new RatingAssignmentApi(this, store);
  this.projects = new ProjectApi(this, store);
  this.service = new ServiceApi(this, store);
  this.committee = new CommitteeApi(this, store);
  this.committeeRating = new CommitteeRatingApi(this, store);
  this.serviceRating = new ServiceRatingApi(this, store);
  this.projectRating = new ProjectRatingApi(this, store);
  this.chatApi = new ChatApi(this,store);
  this.template = new TemplateApi(this, store);
  this.templateRating = new TemplateRatingApi(this,store);
   this.ratingSession = new RatingSessionApi(this, store);
  this.templates = new TemplateApi(this,store);
  //360 feedback
    // check ins
    this.checkIn = new CheckInApi(this, store);
  }
}
