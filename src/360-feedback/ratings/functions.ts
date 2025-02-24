import { IRateAssignment } from "../../shared/models/three-sixty-feedback-models/RateAssignments";
import { IUser } from "../../shared/models/User";

export const distributeAndSendFeedback = async (users: IUser[]) => {
  try {
    const feedbackAssignments: Record<string, string[]> = {};

    // Step 1: Assign raters based on the criteria
    users.forEach((rater) => {
      if (!feedbackAssignments[rater.uid]) {
        feedbackAssignments[rater.uid] = [];
      }

      // Assign supervisors as ratees (without duplicates)
      const supervisorRateeIds = users
        .filter((user) => {
          console.log(`Current rater ID: ${rater.uid}`);
          console.log(`Supervisor ID: ${user.supervisor}`);
          return user.uid === rater.supervisor; // Check if the user's ID matches the rater's supervisor ID
        })
        .map((ratee) => ratee.uid);
      supervisorRateeIds.forEach((rateeId) => {
        if (!feedbackAssignments[rater.uid].includes(rateeId)) {
          feedbackAssignments[rater.uid].push(rateeId);
        }
      });

      // Assign users with the same job grade as ratees (without duplicates)
      const sameJobGradeUserIds = users
        .filter(
          (user) => user.jobGrade === rater.jobGrade && user.uid !== rater.uid
        )
        .map((ratee) => ratee.uid);
      sameJobGradeUserIds.forEach((rateeId) => {
        if (!feedbackAssignments[rater.uid].includes(rateeId)) {
          feedbackAssignments[rater.uid].push(rateeId);
        }
      });

      // Assign users where their supervisor is the rater (without duplicates)
      const supervisedRateeIds = users
        .filter((user) => user.supervisor === rater.uid)
        .map((ratee) => ratee.uid);
      supervisedRateeIds.forEach((rateeId) => {
        if (!feedbackAssignments[rater.uid].includes(rateeId)) {
          feedbackAssignments[rater.uid].push(rateeId);
        }
      });
      // Shuffle the ratees array
      shuffleArray(feedbackAssignments[rater.uid]);
    });
    return feedbackAssignments;
  } catch (error) {
    console.error("Error distributing and sending feedback:", error);
  }
};
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
export let totalRate = 0;

export const updateTotalRate = (newRate: number) => {
  totalRate = newRate/2;
};
export const updateRatedUsersPerAssignmentValues =(
  raterId: string,
  rateeId: string,
  rateAssignment: IRateAssignment
) :IRateAssignment =>{
  if (!rateAssignment.ratedUsersPerAssignmentValues.hasOwnProperty(raterId)) {
    rateAssignment.ratedUsersPerAssignmentValues[raterId] = [];
  }
  const ratedUsersForRater = rateAssignment.ratedUsersPerAssignmentValues[raterId];
  if (!ratedUsersForRater.includes(rateeId)) {
    ratedUsersForRater.push(rateeId);
  }
  return rateAssignment
};

export const updateRatedUsersPerAssignmentLeadership = (
  raterId: string,
  rateeId: string,
  rateAssignment: IRateAssignment
): IRateAssignment=> {
  if (!rateAssignment.ratedUsersPerAssignmentLeadership.hasOwnProperty(raterId)) {
    rateAssignment.ratedUsersPerAssignmentLeadership[raterId] = [];
  }
  const ratedUsersForRater = rateAssignment.ratedUsersPerAssignmentLeadership[raterId];
  if (!ratedUsersForRater.includes(rateeId)) {
    ratedUsersForRater.push(rateeId);
  }
  return rateAssignment;
};
