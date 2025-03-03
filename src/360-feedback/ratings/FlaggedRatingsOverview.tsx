import { observer } from "mobx-react-lite";
import {  ValueRatingsDoughnut } from "./components/ValueRatingsDonuts";
import "./ratings.scss";
import RatingsDatatable from "./components/RatingsTable";
import { LeadershipRatingsDoughnut } from "./components/LeadershipRatingDonut";

import { useEffect, useState } from "react";

import { TemplatesDoughnut } from "./components/TemplatesDonut";

import FlagRatingsTable from "./components/FlagRatingsTable";
import { useAppContext } from "../../shared/functions/Context";
import { ITemplateRating } from "../../shared/models/three-sixty-feedback-models/TemplateRating";
import { IValueRating } from "../../shared/models/three-sixty-feedback-models/ValueRating";


 interface ILeadershipRatings {
  overallRating: number;
  id: string;
  rateeId: string;
  dimension:string;
  isflagged: boolean;
  department:string;
  description:string;
  criteria: {
      [raterId: string]: {
          additionalComment?: string;
          stopDoing: string;
          startDoing: string;
          continueDoing: string;
          ratings: {
              [criteriaName: string]: {
                  [statement: string]: number;
              };
          };
          leadershipScore?:number
      };
  };
  date: number; 
  //Templteopionol properties
  raterId?: string,
  templateId?: string,
  heading?: string,
  reasonForRequest?: string,
  dueDate?: number,
  values?: {},
  archived?: boolean
}
const FlaggedRatingsOverview = observer(() => {
  const { api, store } = useAppContext();
  const me = store.auth.meJson?.uid;
  const valueRatings = store.valueRating.all.filter(
    (value) => value.asJson.rateeId === me &&  value.asJson.adminApproval !== "Approved for Re-rating" && value.asJson.resubmission!=="To be rated" && value.asJson.resubmission!=="Closed" ) // Replace `rating.id` with the correct property if filtering by a different field
      

  const leadershipRatings = store.leadershipRating.all
    .filter((value) => value.asJson.rateeId === me)
    .map((value) => {
      return value.asJson;
    });
  const templateRatings = store.templateRating.all
    .filter(
      (value) =>
        value.asJson.rateeId === me && value.asJson.status === "Completed"
    )
    .map((value) => {
      return value.asJson;
    });
  const [description, setDescription] = useState("");

  const mapValueToLeadership = (
    valueRating: IValueRating
  ): ILeadershipRatings => {
    const mappedLeadershipRating: ILeadershipRatings = {
      id: valueRating.id, // Map id to id
      rateeId: valueRating.rateeId, // Map rateeId to rateeId
      date: valueRating.date, // Map date to date
      dimension: valueRating.dimension,
      criteria: {}, // Initialize criteria object
      overallRating: valueRating.overallRating,
      isflagged: false,
      department: valueRating.department,
      description: valueRating.description,
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
  ): ILeadershipRatings => {
    const mappedLeadershipRating: ILeadershipRatings = {
      id: valueRating.id, // Map id to id
      rateeId: valueRating.rateeId, // Map rateeId to rateeId
      date : valueRating.dateRequested ?? 0, // Map date to date
      dimension: valueRating.templateId,
      criteria: {}, // Initialize criteria object
      overallRating: 0,
      isflagged: false,
      department: valueRating.department,
      description: valueRating.description,
      raterId: valueRating.raterId,
      templateId: valueRating.templateId,
      heading: valueRating.heading,
      reasonForRequest: valueRating.reasonForRequest,
      dueDate: valueRating.dueDate,
      values: valueRating.values,
      // archived: valueRating.archived
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
  const templateRates = templateRatings.map((valueRating) => {
    return mapTemplateToLeadership(valueRating);
  });
  const combinedRatings = [
    ...valueRates,
    ...leadershipRatings,
    ...templateRates,
  ];

  console.log("combined ratings on admin side", combinedRatings);

  useEffect(() => {
    const load = async () => {
      await api.ratingAssignments.getAll();
      const descriptions = store.ratingAssignments.all.find(
        (rating) => rating.asJson.isActive === true
      )?.asJson.description;
      setDescription(descriptions ?? "");
      console.log("my description" + descriptions);
      await api.valueRating.getAll(me ?? "", descriptions ?? "kjjvh");
      await api.leadershipRating.getAll(me ?? "", descriptions ?? "hcghgc");
      await api.templateRating.getAll();
    };
    load();
  }, [api.valueRating, api.leadershipRating, api.templateRating]);

  return (
    <>
      {/* <h3>Overview</h3>
      <a style={{color:"red",margin:"0px"}}>Midterm Reviews 5hrs to submission</a> */}

      {/*Doughnuts*/}
      <div className="doughnuts uk-card-default">
        <div className="doughnut-block">
          <h4 style={{ color: "#838CA7" }}>Values </h4>
          {/* <ValueRatingsDoughnut /> */}
        </div>
        <div className="doughnut-block">
          <h4 style={{ color: "#838CA7" }}>Leadership </h4>
          <LeadershipRatingsDoughnut />
        </div>
        <div className="doughnut-block">
          <h4 style={{ color: "#838CA7" }}>Professional Competencies 111</h4>
          <TemplatesDoughnut />
        </div>
      </div>
      <div className="uk-card uk-card-default table-container">
        <FlagRatingsTable data={combinedRatings} description={description} />
      </div>
    </>
  );
});
export default FlaggedRatingsOverview;
