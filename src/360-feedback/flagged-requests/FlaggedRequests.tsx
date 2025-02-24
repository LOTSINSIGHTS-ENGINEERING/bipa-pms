import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import RatingsTable from "../ratings/components/RatingsTable";
import FlagRatingsTable from "../ratings/components/FlagRatingsTable";
import AdminFlagRatingsTable from "../ratings/components/AdminFlagRatingsTable";
import { useAppContext } from "../../shared/functions/Context";
import { ITemplateRating } from "../../shared/models/three-sixty-feedback-models/TemplateRating";
import { IValueRating } from "../../shared/models/three-sixty-feedback-models/ValueRating";

interface ILeadershipRatings {
  overallRating: number;
  id: string;
  rateeId: string;
  dimension: string;
  isflagged: boolean;
  department: string;
  description: string;
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
      leadershipScore?: number;
    };
  };
  date: number;
  //Templteopionol properties
  raterId?: string;
  templateId?: string;
  heading?: string;
  reasonForRequest?: string;
  dueDate?: number;
  values?: {};
  archived?: boolean;
}

const FlaggedRequests = observer(() => {
  const { api, store } = useAppContext();
  const me = store.auth.meJson?.uid;

const valueRatings = store.valueRating.all
  .filter(
    (rating) =>
      rating.asJson.isflagged &&
      rating.asJson.adminApproval !== "Approved for Re-rating" &&
      rating.asJson.resubmission !=="Open"
  ) // Filter to only include flagged ratings and exclude those approved by admin
  .map((l) => l.asJson);


const leadershipRatings = store.leadershipRating.all
  .filter(
    (rating) =>
      rating.asJson.isflagged &&
      rating.asJson.adminApproval !== "Approved for Re-rating" &&
      rating.asJson.resubmission !== "Open"
  ) // Filter to only include flagged ratings
  .map((l) => l.asJson);
  
  const templateRatings = store.templateRating.all
    .filter(
      (value) =>
        value.asJson.rateeId === me && value.asJson.status === "Completed"
    )
    .map((value) => {
      return value.asJson;
    });
  const [description, setDescription] = useState("");
  const mapLeadershipToLeadership = (
    valueRating: IValueRating
  ): ILeadershipRatings => {
    const mappedLeadershipRating: ILeadershipRatings = {
      id: valueRating.id, // Map id to id
      rateeId: valueRating.rateeId, // Map rateeId to rateeId
      date: valueRating.date, // Map date to date
      dimension: valueRating.dimension,
      criteria: {}, // Initialize criteria object
      overallRating: valueRating.overallRating,
      isflagged: valueRating.isflagged,
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
      isflagged: valueRating.isflagged,
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
      isflagged: valueRating.isflagged,
      department: valueRating.department,
      description: valueRating.description,
      raterId: valueRating.raterId,
      templateId: valueRating.templateId,
      heading: valueRating.heading,
      reasonForRequest: valueRating.reasonForRequest,
      dueDate: valueRating.dueDate,
      values: valueRating.values,
      archived: valueRating.archived ?? false,
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
    return mapValueToLeadership(valueRating);
  });
  const templateRates = templateRatings.map((valueRating) => {
    return mapTemplateToLeadership(valueRating);
  });
  const combinedRatings = [
    ...valueRates,
    ...leadershipRatings,
    // ...templateRates,
  ];
  console.log("combined Rating on", combinedRatings);

  // useEffect(() => {
  //   const load = async () => {
      
  //     api.user.getAll();
  //     const users = store.user.all.map((user) => user.asJson);
  //     const uids = users.map((user) => user.uid);
  //     const descriptions = store.ratingAssignments.all.find(
  //       (rating) => rating.asJson.isActive === true
  //     )?.asJson.description;
  //     setDescription(descriptions ?? "");
  //     console.log("my description" + descriptions);
  //     if (description) {
  //       // await api.valueRating.getAll(me ?? "", descriptions ?? "kjjvh");
  //       // await api.leadershipRating.getAll(me ?? "", descriptions ?? "hcghgc");
  //       await api.templateRating.getAll();
  //       api.ratingAssignments.getAll();
  //       if (description) {
  //         console.log("description is true");

  //         api.valueRating.getAllNew(uids, description);
  //       }

  //       // api.leadershipRating.getAllNew(uids, description);
  //     }
  //   };
  //   load();
  // }, [api.valueRating, api.templateRating]);

useEffect(() => {
  const load = async () => {
    try {
      await api.user.getAll();
      await api.ratingAssignments.getAll()

      const users = store.user.all.map((user) => user.asJson);
      const uids = users.map((user) => user.uid);
      const descriptions = store.ratingAssignments.all.find(
        (rating) => rating.asJson.isActive === true
      )?.asJson.description;
      setDescription(descriptions ?? "");
      console.log("my description" + descriptions);

      if (descriptions) {
        await api.templateRating.getAll();
        await api.ratingAssignments.getAll();

        if (descriptions) {
          console.log("description is true");
          await api.valueRating.getAllNew(uids, descriptions);
             await api.leadershipRating.getAllNew(uids, descriptions);
        }
      }
    } catch (error) {
      console.error("Error loading APIs:", error);
    }
  };

  load();
}, [api.valueRating, api.templateRating]);


  return (
    <div>
      {/* {flaggedRow ? (
        <div>
          <h3>Flagged Row</h3>
          <p>ID: {flaggedRow.id}</p>
          <p>Date: {flaggedRow.date}</p>
          <p>Dimension: {flaggedRow.dimension}</p>
          {getCriteriaValues(flaggedRow.criteria)}
        </div>
      ) : (
        <p>No row flagged.</p>
      )} */}
      <div className="uk-card uk-card-default table-container">
        <AdminFlagRatingsTable
          data={combinedRatings}
          description={description}
        />
      </div>
    </div>
  );
});

export default FlaggedRequests;
