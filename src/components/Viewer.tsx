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
  TableSortLabel,
  TableSortLabelProps,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import { Record } from '../common/types';
import { SearchSharp, FilterList } from '@mui/icons-material';
import { CustomTextField } from './Form';
import { formatDate, getTimestamp } from '../common/utils';
import ViewerFilterDrawer from './ViewerFilterDrawer';
import PivotViewer from './PivotViewer';
import { columns } from '../common/constants';
import OutOfServiceBarChart from './BarChart';

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
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({
    key: '',
    direction: null,
  });

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
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const sortedRecords = [...records].sort((a, b) => {
      if (sortConfig.key) {
        const aVal = a[sortConfig.key as keyof Record];
        const bVal = b[sortConfig.key as keyof Record];

        if (
          sortConfig.key === 'created_dt' ||
          sortConfig.key === 'data_source_modified_dt' ||
          sortConfig.key === 'out_of_service_date'
        ) {
          return sortConfig.direction === 'asc'
            ? getTimestamp(aVal as string) - getTimestamp(bVal as string)
            : getTimestamp(bVal as string) - getTimestamp(aVal as string);
        }

        if (sortConfig.key === 'power_units') {
          return sortConfig.direction === 'asc'
            ? Number(aVal) - Number(bVal)
            : Number(bVal) - Number(aVal);
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      return 0;
    });

    setFilteredRecords(
      sortedRecords.filter(record => {
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
  }, [filter, operatingStatus, createdDt, modifiedDt, records, sortConfig]);

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

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <Container style={{ maxWidth: 1440 }} sx={{ pb: 4 }}>
      <Backdrop open={loading} style={{ zIndex: 1000 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
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
            flexWrap="wrap"
          >
            <Box display="flex" alignItems={'center'}>
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
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
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
                  {columns.map(column => (
                    <TableCell
                      key={column.key}
                      sx={{ ...cellStyles, ...headerCellStyles }}
                      sortDirection={
                        sortConfig.key === column.key
                          ? (sortConfig.direction as TableSortLabelProps['direction'])
                          : undefined
                      }
                    >
                      {column.sortable ? (
                        <TableSortLabel
                          active={sortConfig.key === column.key}
                          direction={sortConfig.direction || 'asc'}
                          onClick={() => requestSort(column.key)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  ))}
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
                ) : null}
              </>
            </Table>
          </TableContainer>
          {activePageRecords.length === 0 && (
            <Typography
              sx={{ textAlign: 'center', width: '100%', marginTop: 2 }}
            >
              No records found!
            </Typography>
          )}
          <PivotViewer records={activePageRecords} />
          <OutOfServiceBarChart records={activePageRecords.filter((record) => record.out_of_service_date)} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default Viewer;
