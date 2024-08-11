import React, { useEffect, useState, useCallback } from 'react';
import { parse } from 'papaparse';
import {
  Container,
  Box,
  Typography,
  TablePagination,
  Card,
  CardContent,
  InputAdornment,
  debounce,
  Button,
  SelectChangeEvent,
  Backdrop,
  CircularProgress,
  Badge,
} from '@mui/material';
import { Record } from '../common/types';
import { SearchSharp, FilterList } from '@mui/icons-material';
import { CustomTextField } from './Form';
import {
  formatDate,
  getTimestamp,
  isTableFiltered,
  loadTableStateFromLocalStorage,
} from '../common/utils';
import ViewerFilterDrawer from './ViewerFilterDrawer';
import PivotViewer from './PivotViewer';
import { columns } from '../common/constants';
import OutOfServiceBarChart from './BarChart';
import { useSearchParams } from 'react-router-dom';
import { DataGrid, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import TemplateModal from './TemplateModal';

const Viewer = () => {
  const savedState = loadTableStateFromLocalStorage();

  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [page, setPage] = useState(savedState?.page || 0);
  const [rowsPerPage, setRowsPerPage] = useState(savedState?.rowsPerPage || 10);
  const [filter, setFilter] = useState(savedState?.filter || '');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [operatingStatus, setOperatingStatus] = useState(
    savedState?.operatingStatus || '',
  );
  const [entity, setEntity] = useState(savedState?.entity || '');
  const [createdDt, setCreatedDt] = useState(savedState?.createdDt || '');
  const [modifiedDt, setModifiedDt] = useState(savedState?.modifiedDt || '');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialSortingState, setInitialSortingState] = useState<GridSortModel>(
    savedState?.sortingState || [],
  );
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState(
    JSON.parse(localStorage.getItem('templates') || '{}'),
  );
  const [isFiltered, setIsFiltered] = useState(false);

  const toggleTemplateModal = () => {
    setTemplateModalOpen(!templateModalOpen);
  };

  useEffect(() => {
    // if (loading) return;

    // Load initial state from searchParams

    const search = searchParams.get('search') || '';
    setFilter(search);
    setSearch(search);

    const operatingStatus = searchParams.get('operating_status') || '';
    setOperatingStatus(operatingStatus);

    const entity = searchParams.get('entity') || '';
    setEntity(entity);

    const createdDate = searchParams.get('created_date') || '';
    setCreatedDt(createdDate);

    const modifiedDate = searchParams.get('modified_date') || '';
    setModifiedDt(modifiedDate);

    const initSortState = [];

    for (const { key } of columns) {
      const sort = searchParams.get(`${key}_sort`) as GridSortDirection;
      if (sort) {
        initSortState.push({ field: key, sort: sort || null });
      }
    }

    setInitialSortingState(initSortState);
  }, [searchParams]);

  useEffect(() => {
    const tableState = {
      sortingState: initialSortingState,
      filter,
      operatingStatus,
      entity,
      createdDt,
      modifiedDt,
      rowsPerPage,
      page,
      path: window.location.pathname + window.location.search,
    };

    !loading && saveTableStateToLocalStorage(tableState);
  }, [
    loading,
    initialSortingState,
    filter,
    operatingStatus,
    entity,
    createdDt,
    modifiedDt,
    rowsPerPage,
    page,
  ]);

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
    setFilteredRecords(
      records.filter(record => {
        const statusFilter =
          !operatingStatus ||
          record.operating_status.toLowerCase() ===
            operatingStatus.toLowerCase();
        const entityType =
          !entity || record.entity_type.toLowerCase() === entity.toLowerCase();
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
          statusFilter &&
          entityType &&
          textFilter &&
          createdDateFilter &&
          modifiedDateFilter
        );
      }),
    );

    setPage(0);
    setIsFiltered(isTableFiltered());
  }, [filter, operatingStatus, createdDt, modifiedDt, entity, records]);

  useEffect(() => {
    setIsFiltered(isTableFiltered());
  }, [initialSortingState]);

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
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('search', value);
      setSearchParams(newSearchParams);
    }, 300),
    [searchParams],
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debounceFilter(e.target.value);
  };

  const handleOperatingStatusChange = (event: SelectChangeEvent<string>) => {
    setOperatingStatus(event.target.value as string);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('operating_status', event.target.value);
    setSearchParams(newSearchParams);
  };

  const handleEntityChange = (event: SelectChangeEvent<string>) => {
    setEntity(event.target.value as string);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('entity', event.target.value);
    setSearchParams(newSearchParams);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const changeSortingState = (model: GridSortModel, details: any) => {
    if (model.length) {
      const newSearchParams = new URLSearchParams(searchParams);
      // Remove any existing sort parameters
      Array.from(newSearchParams.keys()).forEach(key => {
        if (key.endsWith('_sort')) {
          newSearchParams.delete(key);
        }
      });

      // Add the new sort parameter
      if (model.length) {
        newSearchParams.set(`${model[0].field}_sort`, model[0].sort || '');
      }
      setSearchParams(newSearchParams);
    }
  };

  const activePageRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleCreatedDtChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCreatedDt(event.target.value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('created_date', event.target.value);
    setSearchParams(newSearchParams);
  };

  const handleModifiedDtChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setModifiedDt(event.target.value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('modified_date', event.target.value);
    setSearchParams(newSearchParams);
  };

  const saveTableStateToLocalStorage = (state: any) => {
    localStorage.setItem('tableState', JSON.stringify(state));
  };

  const resetTableState = () => {
    localStorage.removeItem('tableState');
    setInitialSortingState([]);
    setFilter('');
    setOperatingStatus('');
    setEntity('');
    setCreatedDt('');
    setModifiedDt('');
    setRowsPerPage(10);
    setPage(0);

    // Clear URL search parameters
    const newSearchParams = new URLSearchParams();
    setSearchParams(newSearchParams);
  };

  const handleSaveTemplate = (templateName: string) => {
    const currentTemplates = { ...templates };
    const newTemplate = {
      sortingState: initialSortingState,
      filter,
      operatingStatus,
      entity,
      createdDt,
      modifiedDt,
      rowsPerPage,
      page,
      path: window.location.pathname + window.location.search,
    };
    currentTemplates[templateName] = newTemplate;
    setTemplates(currentTemplates);
    localStorage.setItem('templates', JSON.stringify(currentTemplates));
  };

  const handleLoadTemplate = (templateName: string) => {
    const templates = JSON.parse(localStorage.getItem('templates') || '{}');
    if (templates[templateName]) {
      const savedState = templates[templateName];
      setInitialSortingState(savedState.sortingState);
      setFilter(savedState.filter);
      setOperatingStatus(savedState.operatingStatus);
      setEntity(savedState.entity);
      setCreatedDt(savedState.createdDt);
      setModifiedDt(savedState.modifiedDt);
      setRowsPerPage(savedState.rowsPerPage);
      setPage(savedState.page);

      if (savedState.path) {
        const cleanedPath = savedState.path.startsWith('/?')
          ? savedState.path.slice(2)
          : savedState.path;

        setSearchParams(cleanedPath);
      }
    }
  };

  const handleShare = (templateName: string) => {
    const templates = JSON.parse(localStorage.getItem('templates') || '{}');
    if (templates[templateName]) {
      const savedState = templates[templateName];
      window.open(savedState.path, '_blank');
    }
  };

  const handleCopyLink = (templateName: string) => {
    const templates = JSON.parse(localStorage.getItem('templates') || '{}');
    if (templates[templateName]) {
      const savedState = templates[templateName];
      // Get the origin (protocol + host)
      const origin = window.location.origin; 
      const fullUrlWithoutParams = origin + savedState.path;

      navigator.clipboard.writeText(fullUrlWithoutParams);
    }
  };

  const handleTemplateAction = (templateName: string, action: string) => {
    switch (action) {
      case 'delete':
        handleDeleteTemplate(templateName);
        break;

      case 'load':
        handleLoadTemplate(templateName);
        break;

      case 'copy_link':
        handleCopyLink(templateName);
        break;

      case 'share_template':
        handleShare(templateName);
        break;
    }
  };

  const handleDeleteTemplate = (templateName: string) => {
    const updatedTemplates = { ...templates };
    delete updatedTemplates[templateName];
    setTemplates(updatedTemplates);
    localStorage.setItem('templates', JSON.stringify(updatedTemplates));
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
            <Box
              display="flex"
              alignItems={'center'}
              flexWrap={{
                xs: 'wrap',
                md: 'nowrap',
              }}
              gap={2}
              justifyContent={{
                xs: 'center',
                md: 'start',
              }}
              minWidth={{ xs: '100%', md: '80%', lg: '60%' }}
            >
              <CustomTextField
                placeholder="Search"
                variant="outlined"
                fullWidth
                value={search}
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

              <Badge color="secondary" variant="dot" invisible={!isFiltered}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={toggleDrawer}
                  sx={{ marginLeft: 2 }}
                >
                  Filters
                </Button>
              </Badge>

              <Button
                variant="outlined"
                sx={{ marginLeft: 2 }}
                onClick={toggleTemplateModal}
              >
                Save/Load Templates
              </Button>
              <TemplateModal
                open={templateModalOpen}
                onClose={toggleTemplateModal}
                onSaveTemplate={handleSaveTemplate}
                templates={templates}
                handleTemplateAction={handleTemplateAction}
              />
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
            entity={entity}
            handleEntityChange={handleEntityChange}
            handleOperatingStatusChange={handleOperatingStatusChange}
            createdDt={createdDt}
            handleCreatedDtChange={handleCreatedDtChange}
            modifiedDt={modifiedDt}
            handleModifiedDtChange={handleModifiedDtChange}
            resetTableState={resetTableState}
          />
          {activePageRecords.length ? (
            <Box sx={{ height: '70vh', width: '100%' }}>
              <DataGrid
                columns={columns.map(col => ({
                  field: col.key,
                  renderCell: col.key.includes('dt')
                    ? ({ value }) => formatDate(value)
                    : undefined,
                  headerName: col.label,
                  minWidth: 120,
                }))}
                rows={activePageRecords as any[]}
                hideFooter
                showCellVerticalBorder
                hideFooterPagination
                onSortModelChange={changeSortingState}
                initialState={{ sorting: { sortModel: initialSortingState } }}
              />
            </Box>
          ) : (
            <Typography
              sx={{ textAlign: 'center', width: '100%', marginTop: 2 }}
            >
              No records found!
            </Typography>
          )}
          {!loading && (
            <>
              <PivotViewer records={activePageRecords} />
              <OutOfServiceBarChart
                records={activePageRecords.filter(
                  record => record.out_of_service_date,
                )}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Viewer;
