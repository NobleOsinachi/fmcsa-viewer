import React, { useEffect, useState, useCallback } from 'react';
import { parse } from 'papaparse';
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Card,
  CardContent,
  InputAdornment,
  debounce,
  Button,
  SelectChangeEvent,
} from '@mui/material';
import { Record } from '../common/types';
import { SearchSharp, FilterList } from '@mui/icons-material';
import { CustomTextField } from './Form';
import { formatDate, getTimestamp } from '../common/utils';
import ViewerFilterDrawer from './ViewerFilterDrawer';

const cellStyles = {
  borderColor: 'grey.200',
  paddingY: '8px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const headerCellStyles = {
  textTransform: 'uppercase',
  fontSize: 12,
  fontWeight: 600,
};

const Viewer = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [operatingStatus, setOperatingStatus] = useState('');
  const [createdDt, setCreatedDt] = useState('');
  const [modifiedDt, setModifiedDt] = useState('');

  useEffect(() => {
    fetch('/fmsca_records.csv')
      .then(response => response.text())
      .then(data => {
        const parsedData = parse<Record>(data, {
          header: true,
          skipEmptyLines: true,
        });

        setRecords(parsedData.data);
        setFilteredRecords(parsedData.data);
      });
  }, []);

  useEffect(() => {
    setFilteredRecords(
      records.filter(record => {
        const statusFilter =
          !operatingStatus ||
          record.operating_status.toLowerCase() === operatingStatus;
        const textFilter =
          record.legal_name.toLowerCase().includes(filter.toLowerCase()) ||
          record.dba_name.toLowerCase().includes(filter.toLowerCase()) ||
          record.physical_address.toLowerCase().includes(filter.toLowerCase());
        const recordDate = record.created_dt
          ? record.created_dt.split(' ')[0]
          : '';
        const modifiedDate = record.data_source_modified_dt
          ? record.data_source_modified_dt.split(' ')[0]
          : '';

        const createdDateFilter =
          !createdDt || getTimestamp(recordDate) === getTimestamp(createdDt);
        const modifiedDateFilter =
          !modifiedDt ||
          getTimestamp(modifiedDate) === getTimestamp(modifiedDt);
        return (
          statusFilter && textFilter && createdDateFilter && modifiedDateFilter
        );
      }),
    );
  }, [filter, operatingStatus, createdDt, modifiedDt, records]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const debounceFilter = useCallback(
    debounce(value => {
      setFilter(value);
    }, 300),
    [],
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceFilter(e.target.value);
  };

  const handleOperatingStatusChange = (event: SelectChangeEvent<string>) => {
    setOperatingStatus(event.target.value as string);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const activePageRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleCreatedDtChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCreatedDt(event.target.value);
  };

  const handleModifiedDtChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setModifiedDt(event.target.value);
  };

  return (
    <Container style={{ maxWidth: 1440 }}>
      <Box sx={{ paddingTop: 4, paddingBottom: 2 }}>
        <Typography
          color="secondary"
          variant="h4"
          component="h1"
          fontWeight="600"
          gutterBottom
        >
          FMSCA View
        </Typography>
      </Box>
      <Card
        variant="outlined"
        sx={{ borderRadius: 2, borderColor: 'grey.200', boxShadow: 12 }}
      >
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems={'center'}
            mb={2}
          >
            <CustomTextField
              placeholder="Search"
              variant="outlined"
              fullWidth
              onChange={handleFilterChange}
              InputProps={{
                sx: { borderRadius: 2, fontSize: 14 },
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchSharp color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={toggleDrawer}
              sx={{ marginLeft: 2 }}
            >
              Filters
            </Button>
          </Box>
          <ViewerFilterDrawer
            drawerOpen={drawerOpen}
            toggleDrawer={toggleDrawer}
            operatingStatus={operatingStatus}
            handleOperatingStatusChange={handleOperatingStatusChange}
            createdDt={createdDt}
            handleCreatedDtChange={handleCreatedDtChange}
            modifiedDt={modifiedDt}
            handleModifiedDtChange={handleModifiedDtChange}
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    Created Date
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    Modified Date
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    Entity Type
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    Operating Status
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    Legal Name
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    DBA Name
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    Physical Address
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    Phone
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    DOT
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    MC/MX/FF
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    Power Units
                  </TableCell>
                  <TableCell sx={{ ...cellStyles, ...headerCellStyles }}>
                    Out of Service Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <>
                {activePageRecords.length ? (
                  <TableBody>
                    {activePageRecords.map(record => (
                      <TableRow
                        key={
                          record.created_dt +
                          record.data_source_modified_dt +
                          record.entity_type +
                          record.legal_name
                        }
                        sx={{ paddingY: 1 }}
                      >
                        <TableCell sx={cellStyles}>
                          {record.created_dt && formatDate(record.created_dt)}
                        </TableCell>
                        <TableCell sx={cellStyles}>
                          {record.data_source_modified_dt &&
                            formatDate(record.data_source_modified_dt)}
                        </TableCell>
                        <TableCell sx={cellStyles}>
                          {record.entity_type}
                        </TableCell>
                        <TableCell sx={cellStyles}>
                          {record.operating_status}
                        </TableCell>
                        <TableCell sx={cellStyles}>
                          {record.legal_name}
                        </TableCell>
                        <TableCell sx={cellStyles}>{record.dba_name}</TableCell>
                        <TableCell sx={cellStyles}>
                          {record.physical_address}
                        </TableCell>
                        <TableCell sx={cellStyles}>{record.phone}</TableCell>
                        <TableCell sx={cellStyles}>
                          {record.usdot_number}
                        </TableCell>
                        <TableCell sx={cellStyles}>
                          {record.mc_mx_ff_number}
                        </TableCell>
                        <TableCell sx={cellStyles}>
                          {record.power_units}
                        </TableCell>
                        <TableCell sx={cellStyles}>
                          {record.out_of_service_date &&
                            formatDate(record.out_of_service_date)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                ) : (
                  <TableBody sx={{ textAlign: 'center', width: '100%' }}>
                    <TableCell
                      sx={{ ...cellStyles, textAlign: 'center' }}
                      colSpan={12}
                    >
                      No records found!
                    </TableCell>
                  </TableBody>
                )}
              </>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredRecords.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default Viewer;
