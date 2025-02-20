/* eslint-disable jsx-a11y/anchor-is-valid */
import { observer } from "mobx-react-lite";
import useTitle from "../../shared/hooks/useTitle";
import IndividualDashboard from "./individual-dashboard/IndividualDashboard";
import { useEffect, useState } from "react";
import CompanyDashboard from "./company-dashboard/CompanyDashboard";
import useBackButton from "../../shared/hooks/useBack";
import DeparmentDashboard from "./departmental-dashboard/DeparmentDashboard";
import { useAppContext } from "../../shared/functions/Context";
import { LoadingEllipsis } from "../../shared/components/loading/Loading";
import { USER_ROLES } from "../../shared/functions/CONSTANTS";
import ErrorBoundary from "../../shared/components/error-boundary/ErrorBoundary";
import NewDeparmentDashboard from "./departmental-dashboard/NewDepartmentDashboard";
import NewIndividualDashboard from "./individual-dashboard/NewIndividualDashboard";

interface ITabsProps {
  tab: "Company" | "Department" | "Individual";
  setTab: React.Dispatch<
    React.SetStateAction<"Company" | "Department" | "Individual">
  >;
}
const Tabs = observer((props: ITabsProps) => {
  const { store } = useAppContext();
  const role = store.auth.role;

  const activeClass = (tab: "Company" | "Department" | "Individual") => {
    if (props.tab === tab) return "uk-active";
    return "";
  };
  const user = store.auth.meJson;
  

  // const hasViewCompanyPerformancePermission = Array.isArray(user?.feature) && user.feature.some((feature) => {
  //   return feature.featureName.trim() === "Dashboard -View Company Performance" && feature.read == true;
  // });
  
  // const hasViewDepartmentPerformancePermission = Array.isArray(user?.feature) && user.feature.some((feature) => {
  //   return feature.featureName.trim() === "Dashboard -View Department Performance" && feature.read == true;
  // });
  
  // const hasViewIndividualPerformancePermission = Array.isArray(user?.feature) && user.feature.some((feature) => {
  //   return feature.featureName.trim() === "Dashboard -View Individual Performance" && feature.read == true;
  // });
  

  return ( 

    <div className="dashboard--tabs">
      <ul className="kit-tabs" data-uk-tab>
      {/* {hasViewCompanyPerformancePermission && ( */}
      <li 
          className={activeClass("Company")}
          onClick={() => props.setTab("Company")}
        >
          <a href="void(0)">Company Performance</a>
        </li>
         {/* )} */}
        
        {/* {role !== "Director" && hasViewDepartmentPerformancePermission && ( */}
          <li
            className={activeClass("Department")}
            onClick={() => props.setTab("Department")}
          >
            <a href="void(0)">Department Performance</a>
          </li>
        {/* )} */}
        {!(
          role === USER_ROLES.EXECUTIVE_USER || role === USER_ROLES.MD_USER
        ) && (
          <>
            {/* {role !== "Director" && hasViewIndividualPerformancePermission && ( */}
              <li
                className={activeClass("Individual")}
                onClick={() => props.setTab("Individual")}
              >
                <a href="void(0)">Individual Performance</a>
              </li>
            {/* )} */}
          </>
        )}
      </ul>
    </div>
  );
});

const Dashboard = observer(() => {
  const { api, store } = useAppContext();
  const scorecard = store.scorecard.active;
  const me = store.auth.meJson;

  useTitle("Dashboard");
  useBackButton();

  const [tab, setTab] = useState<"Company" | "Department" | "Individual">(
    "Company"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      if (!scorecard) return;
      setLoading(true);
      try {
        console.log("Loading departments...");
        await api.department.getAll();
        console.log("Loading department measures...");
        await api.departmentMeasure.getAll(scorecard.id);
        console.log("Loading department objectives...");
        await api.departmentObjective.getAll(scorecard.id);
        console.log("Loading company measures...");
        await api.companyMeasure.getAll(scorecard.id);
        console.log("Loading company objectives...");
        await api.companyObjective.getAll(scorecard.id);
      } catch (error) {
        console.log("Error in loadAll:", error);
      }
      setLoading(false);
    };
    loadAll();
  }, [api, scorecard]);
  


  





  return (
    <ErrorBoundary>
      <div className="dashboard uk-section uk-section-small">
        <div className="uk-container uk-container-xlarge">
          <ErrorBoundary>
            <Tabs tab={tab} setTab={setTab} />
          </ErrorBoundary>
          <ErrorBoundary>{loading && <LoadingEllipsis />}</ErrorBoundary>

          <ErrorBoundary>
            {tab === "Company" && !loading &&  <CompanyDashboard />}
            {tab === "Department" && !loading && <NewDeparmentDashboard />}
            {tab === "Individual" && !loading && <NewIndividualDashboard />}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
});

export default Dashboard;
