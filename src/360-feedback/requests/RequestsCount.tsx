import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { Typography } from '@mui/material';
import { useAppContext } from '../../shared/functions/Context';

const RequestsCount = observer(() => {
  const { api, store } = useAppContext();
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await api.templateRating.getAll();
        setTotalRequests(store.templateRating.all.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [api.templateRating, store.templateRating.all]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <Typography >
        {totalRequests}
      </Typography>
    </div>
  );
});

export default RequestsCount;
