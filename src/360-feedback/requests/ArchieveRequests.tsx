import React, { useEffect, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";

import RequestTable from "./RequestsTable";
import { useAppContext } from "../../shared/functions/Context";
import { ITemplateRating } from "../../shared/models/three-sixty-feedback-models/TemplateRating";

const ArchiveRequests = observer(() => {
  const { api, store } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ITemplateRating[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await api.templateRating.getAll();
      const allRatings = store.templateRating.all.map((rating) => rating.asJson);
      const archivedRequests = allRatings.filter((rating) => rating.archived);
      setData(archivedRequests);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
      {loading ? (
        <p>Loading...</p>
      ) : (
        <RequestTable data={data} onDataChange={handleDataChange} />
      )}
    </div>
  );
});

export default ArchiveRequests;