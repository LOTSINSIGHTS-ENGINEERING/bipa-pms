import React, { useEffect, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";

import RequestTable from "./RequestsTable";
import { useAppContext } from "../../shared/functions/Context";
import { ITemplateRating } from "../../shared/models/three-sixty-feedback-models/TemplateRating";


const NewRequests = observer(() => {
  const { api, store } = useAppContext();
  const [data, setData] = useState<ITemplateRating[]>([]);

  const fetchData = useCallback(async () => {
    try {
      await api.templateRating.getAll();
      const allRatings = store.templateRating.all.map((rating) => rating.asJson);
      const newRequests = allRatings.filter((rating) => !rating.archived);
      setData(newRequests);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [api.templateRating, store.templateRating]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDataChange = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <RequestTable data={data} onDataChange={handleDataChange} />
    </div>
  );
});

export default NewRequests;
