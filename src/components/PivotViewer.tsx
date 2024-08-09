import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Record } from '../common/types';
import PivotTableUI, { PivotTableUIProps } from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import { format, getYear, getISOWeek } from 'date-fns';
import { columns } from '../common/constants';
import { capitalize, snake_format } from '../common/utils';
import { useSearchParams } from 'react-router-dom';

const columnsToInclude = columns.map(col => col.key);

const preprocessData = (records: Record[]): Record[] => {
  return records.map((record: any) => {
    const filteredRecord: any = {} as Record;

    columnsToInclude.forEach(key => {
      if (record[key]) {
        const matchedLabel = columns.find(item => item.key === key)?.label; // Get label and replace the key for better accessibility
        filteredRecord[matchedLabel || capitalize(key)] = record[key];
        if (key.includes('dt')) {
          const date = new Date(record[key]);
          filteredRecord[`${matchedLabel || capitalize(key)} Year`] =
            getYear(date);
          filteredRecord[`${matchedLabel || capitalize(key)} Month`] = format(
            date,
            'MMMM',
          );
          filteredRecord[`${matchedLabel || capitalize(key)} Week`] =
            getISOWeek(date);
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
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const filteredData = preprocessData(records);
    setDataKey(prevKey => prevKey + 1); // Update the key to force re-render
    setFilteredRecords(filteredData);
    setPivotState((prevState: any) => ({ ...prevState, data: filteredData })); // Update data on re-render but keeps the selected filters
  }, [records]);

  const updateTable = (s: PivotTableUIProps) => {
    setPivotState(s);
    const newSearchParams = new URLSearchParams(searchParams);
    const snakeStrings = s.rows?.map((row) => snake_format(row))
    
    newSearchParams.set('rows', JSON.stringify(snakeStrings));
    setSearchParams(newSearchParams);
  };

  useEffect(() => {
    const urlRows = searchParams.get('rows');
    
    if (urlRows) {
      let rowsArray: any[] = [];

      if (urlRows) {
        try {
          rowsArray = JSON.parse(urlRows);
        } catch (error) {
          rowsArray = []
          console.error("Failed to parse 'rows' from URL:", error);
        }
      }

      const rowLabels = rowsArray.map((key) => {
        if (!records.some((record: any) => record[key])) {
          return null;
        }

        if ((key.includes("date") || key.includes("dt"))) {
          return capitalize(key)
        }
        
        return columns.find(item => item.label === capitalize(key))?.label
      }).filter((data) => data)

      setPivotState((prevState: any) => ({ ...prevState, rows: rowLabels || [] }));
    }
  }, []);
  
  return (
    <Box m={5} ml={0} sx={{ overflowX: 'auto' }} py={5}>
      <PivotTableUI
        key={dataKey}
        data={filteredRecords}
        onChange={updateTable}
        {...pivotState}
      />
    </Box>
  );
};

export default PivotViewer;
