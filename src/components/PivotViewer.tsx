import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Record } from '../common/types';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import { columns } from '../common/constants';

const columnsToInclude = columns.map(col => col.key);

const PivotViewer = ({ records }: { records: Record[] }) => {
  const [pivotState, setPivotState] = useState<any>({});
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [dataKey, setDataKey] = useState(0);

  useEffect(() => {
    const filteredData = records.map((record: any) =>
      Object.keys(record)
        .filter(key => columnsToInclude.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = record[key];
          return obj;
        }, {} as Record),
    );
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
