import { observer } from "mobx-react-lite";
import "./ratings.scss";
import RatingsDatatable from "./components/RatingsTable";

import { Tab } from "../tabs/Tabs";
import { ChangeEvent, useEffect, useState } from "react";

import { useAppContext } from "../../shared/functions/Context";
import { ILeadershipRating } from "../../shared/models/three-sixty-feedback-models/LeadershipRating";
import { ITemplateRating } from "../../shared/models/three-sixty-feedback-models/TemplateRating";
import { IValueRating } from "../../shared/models/three-sixty-feedback-models/ValueRating";
import ProjectRatingTable from "./components/ProjectRatingTable";
import Toolbar from "../../logged-in/shared/components/toolbar/Toolbar";

const Reports = observer(() => {
  const [activeTab, setActiveTab] = useState("values");
  const handleTab = (label: string) => {
    setActiveTab(label);
  };

  const [filterValue, setFilterValue] = useState("");

  const { api, store } = useAppContext();
  const me = store.auth.meJson?.uid;
  const valueRatings = store.valueRating.all.filter(
    (value) => value.asJson.rateeId === me
  );
  const leadershipRatings = store.leadershipRating.all
    .filter((value) => value.asJson.rateeId === me)
    .map((value) => {
      return value.asJson;
    });
  const templateRatings = store.templateRating.all
    .filter((value) => value.asJson.rateeId === me && value.asJson.status === "Completed")
    .map((value) => {
      return value.asJson;
    });

  const mapValueToLeadership = (
    valueRating: IValueRating
  ): ILeadershipRating => {
    const mappedLeadershipRating: ILeadershipRating = {
      id: valueRating.id, // Map id to id
      rateeId: valueRating.rateeId, // Map rateeId to rateeId
      date: valueRating.date, // Map date to date
      dimension: valueRating.dimension,
      criteria: {}, // Initialize criteria object
      overallRating: 0,
      isflagged: false,
      department: valueRating.department,
      description: valueRating.dimension
    };

    // Loop through each raterId in values
    Object.keys(valueRating.values).forEach((raterId) => {
      // Get the corresponding criteria name
      const criteriaName = Object.keys(valueRating.values[raterId].ratings)[0];

      // Map properties for each raterId
      mappedLeadershipRating.criteria[raterId] = {
        additionalComment: valueRating.values[raterId].additionalComment,
        stopDoing: valueRating.values[raterId].stopDoing,
        startDoing: valueRating.values[raterId].startDoing,
        continueDoing: valueRating.values[raterId].continueDoing,
        ratings: {
          [criteriaName]: valueRating.values[raterId].ratings[criteriaName],
        },
      };
    });

    return mappedLeadershipRating;
  };

  const mapTemplateToLeadership = (
    valueRating: ITemplateRating
  ): ILeadershipRating => {
    const mappedLeadershipRating: ILeadershipRating = {
      id: valueRating.id, // Map id to id
      rateeId: valueRating.rateeId, // Map rateeId to rateeId
      date : valueRating.dateRequested ?? 0, // Map date to date
      dimension: valueRating.dimension,
      criteria: {}, // Initialize criteria object
      overallRating: 0,
      isflagged: false,
      department: valueRating.department,
      description: valueRating.description
    };

    // Loop through each raterId in values
    Object.keys(valueRating.values).forEach((raterId) => {
      // Get the corresponding criteria name
      const criteriaName = Object.keys(valueRating.values[raterId].ratings)[0];

      // Map properties for each raterId
      mappedLeadershipRating.criteria[raterId] = {
        additionalComment: valueRating.values[raterId].additionalComment,
        stopDoing: valueRating.values[raterId].stopDoing,
        startDoing: valueRating.values[raterId].startDoing,
        continueDoing: valueRating.values[raterId].continueDoing,
        ratings: {
          [criteriaName]: valueRating.values[raterId].ratings[criteriaName],
        },
      };
    });

    return mappedLeadershipRating;
  };
  const valueRates = valueRatings.map((valueRating) => {
    return mapValueToLeadership(valueRating.asJson);
  });
  console.log("Value Ratings", valueRates);
  const templateRates = templateRatings.map((valueRating) => {
    return mapTemplateToLeadership(valueRating);
  });
  const combinedRatings = [
    ...valueRates,
    ...leadershipRatings,
    ...templateRates,
  ];

  const assigmnets = store.ratingAssignments.all;
  console.log("all assignments", assigmnets);

  // Initialize the description based on the initial assignments
  const assignments = store.ratingAssignments.all;
  console.log("all assignments", assignments);

  const initialDescription = assignments.find(
    (rating) => rating.asJson.isActive === true
  )?.asJson.description;

  // Initialize state

  const [description, setDescription] = useState("");
  const [neWescription, setnewDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      await api.ratingAssignments.getAll();
      const descriptions = store.ratingAssignments.all.find(
        (rating) => rating.asJson.isActive === true
      )?.asJson.description;
      setDescription(descriptions ?? "");
      console.log("my description" + descriptions);
      await api.valueRating.getAll(me ?? "", descriptions ?? "");
      await api.leadershipRating.getAll(me ?? "", descriptions ?? "");
      await api.templateRating.getAll();
    };
    load();
  }, [api.valueRating, api.leadershipRating, api.templateRating]);

  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
  };
  const handleSetDescription = () => {
    // Check if the filter value matches the desired format (e.g., YYYY-YYYY)
    const isValidFormat = /^\d{4}-\d{4}$/.test(filterValue);

    if (isValidFormat) {
      const filteredRating = assignments.find(
        (rating) =>
          rating.asJson.isActive === true &&
          rating.asJson.description === filterValue
      );
      setDescription(filteredRating?.asJson.description ?? "");
    } else {
      setDescription("");
    }
  };
  return (
    <div className="ratings-container uk-container uk-container-large">
      <h3 style={{ marginTop: "1rem" }}>History</h3>
      <Toolbar
        leftControls={
          <div>
            <a
              onClick={() => handleTab("values")}
              style={{ marginRight: "1rem", fontSize: "14px" }}
            >
              Values
            </a>

            <a
              onClick={() => handleTab("leadership")}
              style={{ marginRight: "1rem", fontSize: "14px" }}
            >
              Leadership
            </a>
            <a
              onClick={() => handleTab("projects")}
              style={{ marginRight: "1rem", fontSize: "14px" }}
            >
              Competencies
            </a>
          </div>
        }
        rightControls={
          <>
            {/* <select className="year-selector">
              <option value="" disabled selected>
                Select Year
              </option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select> */}
          </>
        }
      />
      {/*Doughnuts*/}
      {activeTab === "values" && (
        <div>
          <div>
            <h4>Midterm 2024 Values</h4>
            <RatingsDatatable data={valueRates} />
          </div>
          <div>
            <h4 style={{ marginTop: "1rem" }}>Final Assessments</h4>
            <RatingsDatatable data={[]} />
          </div>
        </div>
      )}
      {activeTab === "leadership" && (
        <div>
          <div>
            <h4>Midterm 2024 Leadership</h4>
            <RatingsDatatable data={leadershipRatings} />
          </div>
          <div>
            <h4 style={{ marginTop: "1rem" }}>Final Assessments</h4>
            <RatingsDatatable data={[]} />
          </div>
        </div>
      )}
      {activeTab === "projects" && (
        <div>
          <div>
            <h4>Midterm 2024 Proffessional Competencies</h4>
            <ProjectRatingTable data={templateRatings} />
          </div>
          <div>
            <h4 style={{ marginTop: "1rem" }}>Final Assessments</h4>
            <ProjectRatingTable data={[]} />
          </div>
        </div>
      )}
    </div>
  );
});
export default Reports;
