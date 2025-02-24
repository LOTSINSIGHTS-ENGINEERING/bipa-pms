import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import DialogContent from "@mui/material/DialogContent";
import Home from "../home/Home";
import { CombinedPolars } from "./Charts/CombinedPolars";
import "./UsersDashboard.scss";
import { DialogActions, IconButton } from "@mui/material";
import RaterCountByDimension from "../ratings/components/RaterCountByDimension";




import { useAverageValueRating } from "../ratings/components/useAverageValueRating";
import { useAverageLeaderRating } from "../ratings/components/useAverageLeaderRating";
import RatingsOverview from "./Charts/RatingsOverview";
import NumberOfRatersChart from "./Charts/MumberOfRaters";
import UserRatingStatus from "../questionnaire/views/UserRatingStatus";
import { useAppContext } from "../../shared/functions/Context";

export const UserDashboard = () => {
  const { api, store } = useAppContext();
  const { valueScore, error } = useAverageValueRating();
  const { leadershipValueScore } = useAverageLeaderRating();

  const ratingAverage = (valueScore + leadershipValueScore) / 2;

  console.log("valueScore", valueScore);
  console.log("leadership", leadershipValueScore);

  const navigate = useNavigate();
  const me = store.auth.meJson;
  let uid = "";
  if (me !== null) {
    uid = me?.uid ?? "";
  }
  const [openAboutDialog, setOpenAboutDialog] = useState(false);
  const [dimensions, setDimensions] = useState<string[]>([]);

  const [raterCounts, setRaterCounts] = useState<{
    [dimension: string]: number;
  }>({});
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);

  const measures = store.measure.allMe;
  const $measures = measures.map((measure) => measure.asJson);
  const rating = totalQ2MeasureRating($measures);
  const rating2 = totalQ2MeasureRating($measures);

  const midtermPeriod = store.ratingAssignments.all.filter(
    (session) => session.asJson.midtermReview?.status === "In Progress"
  );
  const midtermStartDate = midtermPeriod.map(
    (date) => date.asJson.midtermReview?.startDate
  );
  const midtermEndDate = midtermPeriod.map(
    (date) => date.asJson.midtermReview?.endDate
  );
  const finalStartDate = midtermPeriod.map(
    (date) => date.asJson.finalAssessment?.startDate
  );
  const finalEndDate = midtermPeriod.map(
    (date) => date.asJson.finalAssessment?.endDate
  );

  const finalAssessmentPeriod = store.ratingAssignments.all.filter(
    (session) => session.asJson.finalAssessment?.status === "In Progress"
  );
  const numberOfRequests = store.templateRating.all.filter(
    (request) =>
      (request.asJson.raterId === me?.uid , "") &&
      request.asJson.status === "Not Started"
  ).length;

  // Get all ratings
  const valueRatings = store.valueRating.all.filter(
    (value) => value.asJson.rateeId === me?.uid
  );
  const getDisplayNameById = (userId: string) => {
    const user = store.user.all.find(
      (user) => user.asJson.uid === userId
    )?.asJson;
    return user ? user.displayName : undefined;
  };
  const currentUserId = store.auth.meJson?.uid;
  const displayName = currentUserId
    ? getDisplayNameById(currentUserId)
    : undefined;

  const currentHour = new Date().getHours();
  let greeting;
  let emoji;

  if (currentHour < 12) {
    greeting = "Good Morning";
    emoji = "☀️";
  } else if (currentHour < 18) {
    greeting = "Good Afternoon";
    emoji = "🌞";
  } else {
    greeting = "Good Evening";
    emoji = "🌙";
  }

  const ratedUsers = valueRatings.length;
  const notYetRatedUsers = numberOfRequests;
  const [activeTab, setActiveTab] = useState<string>("ratings");

  useEffect(() => {
    const load = async () => {
      await api.ratingAssignments.getAll();
      try {
        const descriptions = store.ratingAssignments.all.find(
          (rating) => rating.asJson.isActive === true
        )?.asJson.description;

        if (descriptions && me) {
          await Promise.all([
            api.valueRating.getAll(me?.uid ?? "", descriptions ?? ""),
            api.leadershipRating.getAll(me?.uid ?? "", descriptions ?? ""),
            api.template.getAll(),
            api.templateRating.getAll(),
            api.measure.getAll(uid),
          ]);
        }
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    load();
    setLoading(false);
  }, [me?.uid, api.valueRating, api.leadershipRating, api.templateRating]);

  const leadershipRatings = store.leadershipRating.all
    .filter((value) => value.asJson.rateeId === me?.uid)
    .map((value) => value.asJson);
  const templateRatings = store.templateRating.all
    .filter(
      (value) =>
        value.asJson.rateeId === me?.uid && value.asJson.status === "Completed"
    )
    .map((value) => value.asJson);
  console.log("Sample Data:", leadershipRatings);

  const scoreColors = {
    red: "#891919",
    blue: "",
    green: "",
  };

  const calculateTimeRemaining = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    if (now > end) {
      return "Time is up";
    }

    const difference = end.getTime() - now.getTime();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days} d${days > 1 ? "'s" : ""}`;
    } else if (hours > 0) {
      return `${hours} hr${hours > 1 ? "s" : ""}`;
    } else if (minutes > 0) {
      return `${minutes} min${minutes > 1 ? "s" : ""}`;
    } else {
      return `${seconds} sec${seconds > 1 ? "s" : ""}`;
    }
  };

  // const memoizedDimensionsAndRaterCounts = useMemo(() => {
  //   const dimensionsSet = new Set<string>();
  //   const counts: { [dimension: string]: number } = {};

  //   combinedRatings.forEach((rating) => {
  //     dimensionsSet.add(rating.dimension);

  //     const raterIds = Object.keys(rating.criteria ?? {});
  //     raterIds.forEach((raterId) => {
  //       const dimension = rating.dimension;
  //       counts[dimension] = (counts[dimension] || 0) + 1;
  //     });
  //   });

  //   return { dimensions: Array.from(dimensionsSet), raterCounts: counts };
  // }, [combinedRatings]);

  useEffect(() => {
    const load = async () => {
      await api.ratingAssignments.getAll();
      try {
        const descriptions = store.ratingAssignments.all.find(
          (rating) => rating.asJson.isActive === true
        )?.asJson.description;
        setDescription(descriptions ?? "");

        if (descriptions && me) {
          await Promise.all([
            api.valueRating.getAll(me?.uid ?? "", descriptions ?? ""),
            api.leadershipRating.getAll(me?.uid ?? "", descriptions ?? ""),
            api.template.getAll(),
            api.templateRating.getAll(),
            api.measure.getAll(uid),
          ]);
        }
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };

    load();
    setLoading(false);
  }, [me?.uid, api.valueRating, api.leadershipRating, api.templateRating]);

  const handleAboutClick = () => {
    setOpenAboutDialog(true);
  };

  const handleCloseAboutDialog = () => {
    setOpenAboutDialog(false);
  };

  // const handleTab = (tabName: string) => {
  //   navigate('');
  // };
  const handleTab = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === "Ratings-analysis") {
      navigate("/c/threesixty/home/overview?tab=Ratings-analysis");
    } else if (tabName === "Ratings-reports") {
      navigate("/c/threesixty/home/overview?tab=Reports");
    }
  };

  const onViewTab = (tab: string) => {
    navigate(`/c/threesixty/home/overview?tab=surveys-values`);
  };

  const onViewRequests = (tab: string) => {
    navigate("/c/threesixty/home/overview?tab=requests");
  };
  const onViewMyScoreCard = () => {
    navigate("/c/scorecards/my");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const templateScores = templateRatings.flatMap((template) =>
    Object.values(template.values).flatMap((rater) =>
      Object.values(rater.ratings).flatMap((valueName) =>
        Object.values(valueName)
      )
    )
  );

  // Pass these numbers into the sampleData array
  const sampleData = [
    { category: "Values", score: valueScore || 0 },
    { category: "Leadership", score: leadershipValueScore || 0 },
    { category: "Professional Competency", score: templateScores[0] || 0 },
  ];

  // const sampleData1 = [
  //   { category: "Project A", raters: 20 },
  //   { category: "Project B", raters: 25 },
  //   { category: "Project C", raters: 15 },
  //   { category: "Project D", raters: 10 },
  //   { category: "Project E", raters: 30 },
  // ];
  return (
    <div className="dashboard-container">
      {/* <div className="cards-container">
         <div className="info-card">
           <div className="card-content">
             <p className="card-label">My Rating</p>
             <p className="card-value" style={{ color: `${scoreColors.red}` }}>
               {ratingAverage ? ratingAverage : 0}
             </p>
             <button
               onClick={() => onViewTab("ratings")}
               className="card-button">
               View
             </button>
           </div>
         </div>
         {midtermStartDate[0] && midtermEndDate[0] && (
           <div className="info-card">
             <div className="card-content">
               <p className="card-label">Surveys</p>
               <p
                 className="card-value"
                 style={{ color: `${scoreColors.red}` }}>
                 {calculateTimeRemaining(
                   midtermStartDate[0],
                   midtermEndDate[0]
                 )}
               </p>
               {finalStartDate[0] && finalEndDate[0] && (
                 <p
                   className="card-value"
                   style={{ fontSize: "14px", color: `${scoreColors.red}` }}>
                   {calculateTimeRemaining(finalStartDate[0], finalEndDate[0])}{" "}
                   to Final Assessment
                 </p>
               )}
               <button
                 onClick={() => onViewTab("surveys")}
                 className="card-button">
                 View
               </button>
             </div>
           </div>
         )}
         {numberOfRequests !== null && (
           <div className="info-card">
             <div className="card-content">
               <p className="card-label">Requests</p>
               <p
                 className="card-value"
                 style={{ color: `${scoreColors.red}` }}>
                 {numberOfRequests}
               </p>
               <button
                 onClick={() => onViewTab("surveys-competencies")}
                 className="card-button">
                 View
               </button>
             </div>
           </div>
         )}
         {rating !== null && rating2 !== null && (
           <div className="info-card">
             <div className="card-content">
               <p className="card-label">Score Card</p>
               {midtermPeriod.length !== 0 && (
                 <p
                   className="card-value"
                   style={{ color: `${scoreColors.red}` }}>
                   <span style={{ color: `${scoreColors.red}` }}>
                     {isNaN(rating) ? 0 : rating}
                   </span>
                 </p>
               )}
               {finalAssessmentPeriod.length !== 0 && (
                 <p
                   className="card-value"
                   style={{ color: `${scoreColors.red}` }}>
                   score{" "}
                   <span style={{ color: `${scoreColors.red}` }}>
                     {isNaN(rating2) ? 0 : rating2}
                   </span>
                 </p>
               )}
               <button className="card-button" onClick={onViewMyScoreCard}>
                 View
               </button>
             </div>
           </div>
         )}
       </div> */}
      <div className="centralized-text">
        {displayName ? (
          <h2>{`${greeting}, ${displayName} ${emoji}`}</h2>
        ) : (
          <h2>{`${greeting} ${emoji}`}</h2>
        )}
        <p>Welcome to 360 Feedback</p>
        <div className="about-button-container">
          <a onClick={handleAboutClick}>About 360</a>
        </div>
      </div>

      <div className="cards-container">
        <div
          className="info-card card-rating"
          onClick={() => handleTab("Ratings-analysis")}
        >
          <div className="card-content">
            <div className="icon-container">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                height="2em"
                width="2em"
              >
                <path d="M7 17.013l4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z" />
                <path d="M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z" />
              </svg>
            </div>
            <div>
              <p className="card-label">My Rating</p>
              <p className="card-value" style={{ color: "red" }}>
                {ratingAverage ? ratingAverage : 0}
              </p>
            </div>
          </div>
        </div>

        {midtermStartDate[0] && midtermEndDate[0] && (
          <div
            className="info-card card-surveys"
            onClick={() => onViewTab("surveys")}
          >
            <div className="card-content">
              <div className="icon-container">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  height="1em"
                  width="1em"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M17 2v2h3.007c.548 0 .993.445.993.993v16.014a.994.994 0 01-.993.993H3.993A.994.994 0 013 21.007V4.993C3 4.445 3.445 4 3.993 4H7V2h10zM7 6H5v14h14V6h-2v2H7V6zm2 10v2H7v-2h2zm0-3v2H7v-2h2zm0-3v2H7v-2h2zm6-6H9v2h6V4z" />
                </svg>
              </div>
              <div>
                <p className="card-label">Surveys</p>
                <p className="card-value" style={{ color: scoreColors.red }}>
                  {calculateTimeRemaining(
                    midtermStartDate[0],
                    midtermEndDate[0]
                  )}
                </p>
                {finalStartDate[0] && finalEndDate[0] && (
                  <p
                    className="card-value"
                    style={{ fontSize: "14px", color: scoreColors.red }}
                  >
                    {calculateTimeRemaining(finalStartDate[0], finalEndDate[0])}{" "}
                    to Final Assessment
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {numberOfRequests !== null && (
          <div
            className="info-card card-requests"
            onClick={() => onViewRequests("requests")}
          >
            <div className="card-content">
              <div className="icon-container">
                <svg
                  viewBox="0 0 1024 1024"
                  fill="currentColor"
                  height="1em"
                  width="1em"
                >
                  <path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0042 42h216v494zM504 618H320c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM312 490v48c0 4.4 3.6 8 8 8h384c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H320c-4.4 0-8 3.6-8 8z" />
                </svg>
              </div>
              <div>
                <p className="card-label">Requests</p>
                <p className="card-value" style={{ color: scoreColors.red }}>
                  {numberOfRequests}
                </p>
              </div>
            </div>
          </div>
        )}

        {rating !== null && rating2 !== null && (
          <div className="info-card card-score" onClick={onViewMyScoreCard}>
            <div className="card-content">
              <div className="icon-container">
                <svg
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  height="1em"
                  width="1em"
                >
                  <path d="M14.5 3a.5.5 0 01.5.5v9a.5.5 0 01-.5.5h-13a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h13zm-13-1A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h13a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0014.5 2h-13z" />
                  <path d="M7 5.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm-1.496-.854a.5.5 0 010 .708l-1.5 1.5a.5.5 0 01-.708 0l-.5-.5a.5.5 0 11.708-.708l.146.147 1.146-1.147a.5.5 0 01.708 0zM7 9.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm-1.496-.854a.5.5 0 010 .708l-1.5 1.5a.5.5 0 01-.708 0l-.5-.5a.5.5 0 01.708-.708l.146.147 1.146-1.147a.5.5 0 01.708 0z" />
                </svg>
              </div>
              <div>
                <p className="card-label">Score Card</p>
                <p className="card-value" style={{ color: scoreColors.red }}>
                  <span> 0.00</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="flex-container">
        <RatingsOverview data={sampleData} />
        <UserRatingStatus />
      </section>

      <Dialog
        open={openAboutDialog}
        onClose={handleCloseAboutDialog}
        maxWidth="lg"
      >
        <DialogActions>
          <IconButton aria-label="close" onClick={handleCloseAboutDialog}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M9.172 16.242 12 13.414l2.828 2.828 1.414-1.414L13.414 12l2.828-2.828-1.414-1.414L12 10.586 9.172 7.758 7.758 9.172 10.586 12l-2.828 2.828z"></path>
              <path d="M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z"></path>
            </svg>
          </IconButton>
        </DialogActions>
        <DialogContent>
          <Home />
        </DialogContent>
      </Dialog>
    </div>
  );
};
function totalQ2MeasureRating($measures: import("../../shared/models/Measure").IMeasure[]) {
  throw new Error("Function not implemented.");
}

