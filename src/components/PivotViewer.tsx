import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Record } from '../common/types';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import { format, getYear, getISOWeek } from 'date-fns';
import { columns } from '../common/constants';
import { capitalize } from '../common/utils';

const columnsToInclude = columns.map(col => col.key);

const preprocessData = (records: Record[]): Record[] => {
  return records.map((record: any) => {
    const filteredRecord: any = {} as Record;

    columnsToInclude.forEach(key => {
      if (record[key]) {
        const matchedLabel = columns.find((item) => item.key === key)?.label; // Get label and replace the key for better accessibility
        filteredRecord[matchedLabel || capitalize(key)] = record[key];
        if (key.includes('dt')) {
          const date = new Date(record[key]);
          filteredRecord[`${matchedLabel || capitalize(key)} Year`] = getYear(date);
          filteredRecord[`${matchedLabel || capitalize(key)} Month`] = format(date, 'MMMM');
          filteredRecord[`${matchedLabel || capitalize(key)} Week`] = getISOWeek(date);
        }
      }
    });

    return filteredRecord;
  });
};

//* Note
// preprocessData function is used to allow dates to be groupable by year/month/week
// consider created_dt for example
// 3 separate keys from it are created
// date-fns i used to extract year, english month & ISO week of a particular date (Max 52 or 53 weeks in a year)
// this is only applied to the function, if the key contains "dt" string which works for created_dt UNLIKE out_of_service_date (can be adjust with minor changes)

const PivotViewer = ({ records }: { records: Record[] }) => {
  const [pivotState, setPivotState] = useState<any>({});
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [dataKey, setDataKey] = useState(0);

  useEffect(() => {
    const filteredData = preprocessData(records);
    setDataKey(prevKey => prevKey + 1); // Update the key to force re-render
    setFilteredRecords(filteredData);
    setPivotState((prevState: any) => ({ ...prevState, data: filteredData })); // Update data on re-render but keeps the selected filters
  }, [records]);

  return (
    <Box m={5} sx={{ overflowX: "auto" }} py={5}>
      <PivotTableUI
        key={dataKey}
        data={filteredRecords}
        onChange={s => setPivotState(s)}
        {...pivotState}
      />
    </Box>
  );
};

export default PivotViewer;
