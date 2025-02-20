import Measure, { IMeasure } from "../../../shared/models/Measure";
import { IMeasureAudit } from "../../../shared/models/MeasureAudit";
import { IMeasureAuditCompany } from "../../../shared/models/MeasureAuditCompany";
import { IMeasureAuditDepartment } from "../../../shared/models/MeasureAuditDepartment";
import MeasureCompany, { IMeasureCompany } from "../../../shared/models/MeasureCompany";
import { IMeasureDepartment } from "../../../shared/models/MeasureDepartment";
import Objective, { IObjective } from "../../../shared/models/Objective";
import ObjectiveCompany from "../../../shared/models/ObjectiveCompany";
import { IScorecardMetadata } from "../../../shared/models/ScorecardMetadata";

export const deriveCompanyNumberRating = (measure: IMeasureCompany) => {
  const { annualActual, annualTarget } = measure;
  if (annualActual === null || annualTarget === null) return 1;

  if (annualActual < annualTarget) return 1;
  if (annualActual === annualTarget) return 3;
  if (annualActual > annualTarget) return 5;

  return 1;
};

export const rateColor = (rating: number, isUpdated?: boolean): string => {
  if (!isUpdated) return "grey"; // if not updated, return grey

  if (rating === 5) return "purple";
  else if (rating >= 4 && rating < 5) return "blue";
  else if (rating >= 3 && rating < 4) return "green";
  else if (rating >= 2 && rating < 3) return "warning";
  else return "red";
};



// COMPANY RATINGS
export const totalQ1CompanyObjectiveRating = (
  measures: IMeasureCompany[] | IMeasureAuditCompany[]
) => {
  const data = measures.map((measure) => ({
    rating: Number(measure.q1Rating) || measure.q1AutoRating || 1,
    weight: measure.weight,
  }));

  let rating = data.reduce((acc, curr) => {
    return acc + curr.rating * (curr.weight / 100);
  }, 0);

  let totalWeight = data.reduce((acc, curr) => {
    return acc + curr.weight / 100;
  }, 0);

  rating = rating / totalWeight;
  rating = Math.round(rating * 10) / 10;
  return rating;
};
export const totalQ2CompanyObjectiveRating = (
  measures: IMeasureCompany[] | IMeasureAuditCompany[]
) => {
  const data = measures.map((measure) => ({
    rating: Number(measure.q2Rating) || measure.q2AutoRating || 1,
    weight: measure.weight,
  }));

  let rating = data.reduce((acc, curr) => {
    return acc + curr.rating * (curr.weight / 100);
  }, 0);

  let totalWeight = data.reduce((acc, curr) => {
    return acc + curr.weight / 100;
  }, 0);

  rating = rating / totalWeight;
  rating = Math.round(rating * 10) / 10;
  return rating;
};
export const totalQ3CompanyObjectiveRating = (
  measures: IMeasureCompany[] | IMeasureAuditCompany[]
) => {
  const data = measures.map((measure) => ({
    rating: Number(measure.q3Rating) || measure.q3AutoRating || 1,
    weight: measure.weight,
  }));

  let rating = data.reduce((acc, curr) => {
    return acc + curr.rating * (curr.weight / 100);
  }, 0);

  let totalWeight = data.reduce((acc, curr) => {
    return acc + curr.weight / 100;
  }, 0);

  rating = rating / totalWeight;
  rating = Math.round(rating * 10) / 10;
  return rating;
};
export const totalQ4CompanyObjectiveRating = (
  measures: IMeasureCompany[] | IMeasureAuditCompany[]
) => {
  const data = measures.map((measure) => ({
    rating: Number(measure.q4Rating) || measure.q4AutoRating || 1,
    weight: measure.weight,
  }));

  let rating = data.reduce((acc, curr) => {
    return acc + curr.rating * (curr.weight / 100);
  }, 0);

  let totalWeight = data.reduce((acc, curr) => {
    return acc + curr.weight / 100;
  }, 0);

  rating = rating / totalWeight;
  rating = Math.round(rating * 10) / 10;
  return rating;
};

// DEPARTMENT RATINGS
export const totalQ1DepartmentObjectiveRating = (
  measures: IMeasureDepartment[] | IMeasureAuditDepartment[]
) => {
  const data = measures.map((measure) => ({
    rating: Number(measure.q1Rating) || measure.q1AutoRating,
    weight: measure.weight,
  }));

  let rating =
    data.reduce((acc, curr) => {
      return acc + curr.rating;
    }, 0) / data.length;

  rating = Math.round(rating * 10) / 10;
  return rating;
};
export const totalQ2DepartmentObjectiveRating = (
  measures: IMeasureDepartment[] | IMeasureAuditDepartment[]
) => {
  const data = measures.map((measure) => ({
    rating: Number(measure.q2Rating) || measure.q2AutoRating,
    weight: measure.weight,
  }));

  let rating =
    data.reduce((acc, curr) => {
      return acc + curr.rating;
    }, 0) / data.length;

  rating = Math.round(rating * 10) / 10;
  return rating;
};
export const totalQ3DepartmentObjectiveRating = (
  measures: IMeasureDepartment[] | IMeasureAuditDepartment[]
) => {
  const data = measures.map((measure) => ({
    rating: Number(measure.q3Rating) || measure.q3AutoRating,
    weight: measure.weight,
  }));

  let rating =
    data.reduce((acc, curr) => {
      return acc + curr.rating;
    }, 0) / data.length;

  rating = Math.round(rating * 10) / 10;
  return rating;
};
export const totalQ4DepartmentObjectiveRating = (
  measures: IMeasureDepartment[] | IMeasureAuditDepartment[]
) => {
  const data = measures.map((measure) => ({
    rating: Number(measure.q4Rating) || measure.q4AutoRating,
    weight: measure.weight,
  }));

  let rating =
    data.reduce((acc, curr) => {
      return acc + curr.rating;
    }, 0) / data.length;

  rating = Math.round(rating * 10) / 10;
  return rating;
};

// INDIVIDUAL RATINGS
export const totalFinalIndividualObjectiveRating = (
  measures: IMeasure[] | IMeasureAudit[]
) => {
  const data = measures.map((measure) => ({
    rating: Number(measure.finalRating) || measure.autoRating,
    weight: measure.weight,
  }));

  let rating =
    data.reduce((acc, curr) => {
      return acc + curr.rating;
    }, 0) / data.length;

  rating = Math.round(rating * 10) / 10;
  return rating;
};
export const totalMidtermIndividualObjectiveRating = (
  measures: IMeasure[] | IMeasureAudit[]
) => {
  const data = measures.map((measure) => ({
    rating: Number(measure.midtermRating) || measure.autoRating,
    weight: measure.weight,
  }));

  let rating =
    data.reduce((acc, curr) => {
      return acc + curr.rating;
    }, 0) / data.length;

  rating = Math.round(rating * 10) / 10;
  return rating;
};

// export const CalculateOverallRatings = (
//   measures: IMeasure[],
//   objectives: IObjective[],
//   metaData?: IScorecardMetadata
// ) => {
//   //kpis
//   const kpiTotalScores: { [objectiveId: string]: number } = {};

//   measures.forEach((measure) => {
//     const objectiveId = measure.objective;
//     const measureWeight = measure.weight;
//     const finalRating2 = measure.finalRating;
//     const totalScore = ((measureWeight || 0) / 100) * (finalRating2 || 0);

//     if (!kpiTotalScores[objectiveId]) {
//       kpiTotalScores[objectiveId] = 0;
//     }

//     kpiTotalScores[objectiveId] += totalScore;
//   });

//   //objectives
//   const objectiveTotalScores: {
//     [objectiveId: string]: {
//       totalScore: number;
//       perspective: string;
//     };
//   } = {};

//   objectives.forEach((objective) => {
//     const objectiveId = objective.id;
//     const objectiveWeight = objective.weight;
//     const perspective = objective.perspective;

//     const totalMeasureScore = kpiTotalScores[objectiveId] || 0;
//     const totalObjectiveScore =
//       totalMeasureScore * ((objectiveWeight || 0) / 100);

//     objectiveTotalScores[objectiveId] = {
//       totalScore: totalObjectiveScore,
//       perspective: perspective || "",
//     };
//   });


//   // you will just add the objectrive to find the total score
//   // Object to store the total scores grouped by perspective
//   const totalScoresByPerspective: { [perspective: string]: number } = {};

//   for (const objectiveId in objectiveTotalScores) {
//     if (objectiveTotalScores.hasOwnProperty(objectiveId)) {
//       const { totalScore, perspective } = objectiveTotalScores[objectiveId];

//       if (!totalScoresByPerspective.hasOwnProperty(perspective)) {
//         totalScoresByPerspective[perspective] = 0;
//       }

//       totalScoresByPerspective[perspective] += totalScore;
//     }
//   }

 
 
// };
export const CalculateOverallRatings = (
  measures: IMeasure[],
  objectives: IObjective[],
  metaData?: IScorecardMetadata
) => {
  // Store total scores for each objective
  const kpiTotalScores: { [objectiveId: string]: number } = {};

  // Step 1: Calculate the weighted score for each measure
  measures.forEach((measure) => {
    const objectiveId = measure.objective;
    const measureWeight = measure.weight || 0;
    const finalRating2 = measure.finalRating || 0;

    const totalScore = (measureWeight / 100) * finalRating2;

    if (!kpiTotalScores[objectiveId]) {
      kpiTotalScores[objectiveId] = 0;
    }

    kpiTotalScores[objectiveId] += totalScore;
  });

  // Step 2: Calculate the weighted score for each objective
  const objectiveTotalScores: {
    [objectiveId: string]: {
      totalScore: number;
      perspective: string;
    };
  } = {};

  objectives.forEach((objective) => {
    const objectiveId = objective.id;
    const objectiveWeight = objective.weight || 0;
    const perspective = objective.perspective || "";

    const totalMeasureScore = kpiTotalScores[objectiveId] || 0;
    const totalObjectiveScore = totalMeasureScore * (objectiveWeight / 100);

    objectiveTotalScores[objectiveId] = {
      totalScore: totalObjectiveScore,
      perspective: perspective,
    };
  });

  // Step 3: Sum up the scores by perspective
  const totalScoresByPerspective: { [perspective: string]: number } = {};

  for (const objectiveId in objectiveTotalScores) {
    const { totalScore, perspective } = objectiveTotalScores[objectiveId];

    if (!totalScoresByPerspective[perspective]) {
      totalScoresByPerspective[perspective] = 0;
    }

    totalScoresByPerspective[perspective] += totalScore;
  }

  // Step 4: Calculate the overall score by summing all perspectives
  let overallScore = 0;
  for (const perspective in totalScoresByPerspective) {
    overallScore += totalScoresByPerspective[perspective];
  }

  // Step 5: Return the overall score
  return overallScore;
};


export const CalculateOverallCompanyRatings = (
  measures: MeasureCompany[],
  objectives: ObjectiveCompany[]
) => {
  // Store total scores for each objective
  const kpiTotalScores: { [objectiveId: string]: number } = {};
  console.log("KPI:", measures);
  // Step 1: Calculate the weighted score for each measure
  measures.forEach((measure) => {
    const objectiveId = measure.asJson.objective;
    const measureWeight = measure.asJson.weight || 0;
    const finalRating2 = measure.asJson.q4AutoRating || 0;

    const totalScore = (measureWeight / 100) * finalRating2;

    if (!kpiTotalScores[objectiveId]) {
      kpiTotalScores[objectiveId] = 0;
    }

    kpiTotalScores[objectiveId] += totalScore;
  });

  console.log("KPI Total Scores:", kpiTotalScores);

  // Step 2: Calculate the weighted score for each objective
  const objectiveTotalScores: {
    [objectiveId: string]: {
      totalScore: number;
      perspective: string;
    };
  } = {};

  objectives.forEach((objective) => {
    const objectiveId = objective.asJson.id;
    const objectiveWeight = objective.asJson.weight || 0;
    const perspective = objective.asJson.perspective || "";

    const totalMeasureScore = kpiTotalScores[objectiveId] || 0;
    const totalObjectiveScore = totalMeasureScore * (objectiveWeight / 100);

    objectiveTotalScores[objectiveId] = {
      totalScore: totalObjectiveScore,
      perspective: perspective,
    };
  });

  console.log("Objective Total Scores:", objectiveTotalScores);

  // Step 3: Sum up the scores by perspective
  const totalScoresByPerspective: { [perspective: string]: number } = {};

  for (const objectiveId in objectiveTotalScores) {
    const { totalScore, perspective } = objectiveTotalScores[objectiveId];

    if (!totalScoresByPerspective[perspective]) {
      totalScoresByPerspective[perspective] = 0;
    }

    totalScoresByPerspective[perspective] += totalScore;
  }

  console.log("Total Scores by Perspective:", totalScoresByPerspective);

  // Step 4: Calculate the overall score by summing all perspectives
  let overallScore = 0;
  for (const perspective in totalScoresByPerspective) {
    overallScore += totalScoresByPerspective[perspective];
  }

  console.log("Overall Score:", overallScore);

  // Step 5: Return the overall score
  return overallScore;
};




export const statusClass = (status: string): string => {
  switch (status) {
    case "Upward":
      return "green";
    case "Steady":
      return "warning";
    case "Downward":
      return "red";
    default:
      return "green";
  }
};

interface ISymbol {
  symbol: string;
  prefix?: string;
  suffix?: string;
}
export const dataTypeSymbol = (dataType: string): ISymbol => {
  if (dataType === "Percentage")
    return {
      prefix: "",
      suffix: "%",
      symbol: "%",
    };

  if (dataType === "Currency")
    return {
      prefix: "N$",
      suffix: "",
      symbol: "N$",
    };

  if (dataType === "Rating")
    return {
      prefix: "",
      suffix: "Rating",
      symbol: "Rate",
    };

  if (dataType === "Number")
    return {
      prefix: "",
      suffix: "",
      symbol: "#",
    };

  if (dataType === "Date")
    return {
      prefix: "",
      suffix: "",
      symbol: "Date",
    };
  // added
  if (dataType === "Time")
    return {
      prefix: "",
      suffix: "",
      symbol: "Days",
    };
  return {
    prefix: "",
    suffix: "",
    symbol: "",
  };
};

export const measureRating = (
  measure: IMeasure | IMeasureDepartment | IMeasureCompany
): number => {
  const actual = measure.annualActual;
  const rating1 = Number(measure.rating1) || 0;
  const rating2 = Number(measure.rating2) || 0;
  const rating3 = Number(measure.rating3) || 0;
  const rating4 = measure.rating4;
  const rating5 = measure.rating5;

  const type = ratingType(rating1, rating2, rating3);

  if (actual === null || actual === undefined) return 1;

  if (type === "INCREASING") {
    return calculateIncreasingRating(
      actual,
      rating2,
      rating3,
      rating4,
      rating5
    );
  }
  if (type === "DECREASING") {
    return calculateDecreasingRating(
      actual,
      rating2,
      rating3,
      rating4,
      rating5
    );
  }
  return 1;
};

const ratingType = (rating1: number, rating2: number, rating3: number) => {
  if (rating1 <= rating2 && rating2 <= rating3 && rating3) return "INCREASING";
  else if (rating1 >= rating2 && rating2 >= rating3 && rating3)
    return "DECREASING";
  return "INCREASING";
};

const calculateIncreasingRating = (
  actual: number,
  rating2: number,
  rating3: number,
  rating4: number | null,
  rating5: number | null
) => {
  if (actual < rating2) return 1; // actual greater than rate 1 and less than rate 2
  if (actual >= rating2 && actual < rating3) return 2;
  if (actual >= rating3) {
    if (rating5 !== null && actual >= rating5) return 5;
    if (rating4 !== null && actual >= rating4) return 4;
    return 3;
  }
  return 1;
};

const calculateDecreasingRating = (
  actual: number,
  rating2: number,
  rating3: number,
  rating4: number | null,
  rating5: number | null
) => {
  if (actual > rating2) return 1; // actual greater than or equal to rate_1
  if (actual > rating3 && actual <= rating2) return 2; // actual greater than or equal to rate_2 and less than rate_1
  if (actual <= rating3) {
    if (rating5 !== null && actual <= rating5) return 5;
    if (rating4 !== null && actual <= rating4) return 4;
    return 3;
  }
  return 5;
};




