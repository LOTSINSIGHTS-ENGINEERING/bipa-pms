import React, { useEffect, useState, useMemo } from "react";
import { useAppContext } from "../../../shared/functions/Context";



interface EntryScores {
  [valueName: string]: {
    [statement: string]: number;
  };
}






export const useAverageValueRating = () => {
  const { api, store } = useAppContext();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState<Boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [valueScore, setValueScore] = useState<number>(0); // Initialize with 0

  const valueRatings = useMemo(() => {
    return store.valueRating.all.map((rating) => rating.asJson.values);
  }, [store.valueRating.all]);


  const me = store.auth.meJson;

  const scores = useMemo(
    () => getScoresFromValueRatings(valueRatings),
    [valueRatings]
  );

  const totalAverageScores = useMemo(
    () => calculateTotalAverageScores(scores),
    [scores]
  );

  useEffect(() => {
    setValueScore(calculateTotalValueScore(totalAverageScores)); // Set valueScore as number
  }, [totalAverageScores]);

  useEffect(() => {
    const load = async () => {
      try {
        await api.ratingAssignments.getAll();
        const descriptions = store.ratingAssignments.all.find(
          (rating) => rating.asJson.isActive === true
        )?.asJson.description;
        setDescription(descriptions ?? "");
        await api.valueRating.getAll(me?.uid ?? "", descriptions ?? "");
        setLoading(false);
      } catch (error) {
        console.error("Error occurred:", error);
        setError("An error occurred while loading data.");
        setLoading(false);
      }
    };
    load();
  }, [api.valueRating, me]);

  return { valueScore, loading, error };

  function getScoresFromValueRatings(valueRatings: any[]) {
    const scores: EntryScores[] = [];

    valueRatings.forEach((entry) => {
      Object.keys(entry).forEach((raterId) => {
        const ratings = entry[raterId].ratings;
        const valueNames = Object.keys(ratings);

        const entryScores: EntryScores = {};

        valueNames.forEach((valueName) => {
          entryScores[valueName] = ratings[valueName];
        });

        scores.push(entryScores);
      });
    });

    return scores;
  }

  function calculateTotalAverageScores(arrays: EntryScores[]) {
    const totals: { [valueName: string]: number } = {};
    const maxScores: { [valueName: string]: number } = {};

    arrays.forEach((array) => {
      Object.keys(array).forEach((valueName) => {
        if (!totals[valueName]) {
          totals[valueName] = 0;
        }
        const totalScore = Object.values(array[valueName]).reduce(
          (acc, cur) => acc + cur,
          0
        );
        totals[valueName] += totalScore;

        if (!maxScores[valueName]) {
          maxScores[valueName] = Object.values(array[valueName]).length * 5;
        }
      });
    });

    const count = arrays.length;
    const totalAverageScores: { [valueName: string]: number } = {};
    Object.keys(totals).forEach((valueName) => {
      const totalScore = totals[valueName];
      const maxScore = maxScores[valueName];
      const average = totalScore / count;
      totalAverageScores[valueName] = Math.round((average / maxScore) * 5);
    });

    return totalAverageScores;
  }

  function calculateTotalValueScore(totalAverageScores: {
    [valueName: string]: number;
  }): number {
    let totalScore = 0;
    const numValues = Object.keys(totalAverageScores).length;

    Object.values(totalAverageScores).forEach((score) => {
      totalScore += score;
    });
    let averageTotalScore = totalScore / numValues;

    averageTotalScore = parseFloat(averageTotalScore.toFixed(2));
    return averageTotalScore; // Return number
  }
};
