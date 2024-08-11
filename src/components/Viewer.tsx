import {
  Container,
  Box,
  Typography,
  TablePagination,
  Card,
  CardContent,
  InputAdornment,
  Button,
  Backdrop,
  CircularProgress,
  Badge,
} from '@mui/material';
import { SearchSharp, FilterList } from '@mui/icons-material';
import { CustomTextField } from './Form';
import { formatDate } from '../common/utils';
import ViewerFilterDrawer from './ViewerFilterDrawer';
import PivotViewer from './PivotViewer';
import { columns } from '../common/constants';
import OutOfServiceBarChart from './BarChart';
import { DataGrid } from '@mui/x-data-grid';
import TemplateModal from './TemplateModal';
import useViewer from '../hooks/useViewer';

const Viewer = () => {
  const {
    loading,
    search,
    handleFilterChange,
    isFiltered,
    toggleDrawer,
    toggleTemplateModal,
    templateModalOpen,
    handleSaveTemplate,
    templates,
    handleTemplateAction,
    filteredRecords,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
    drawerOpen,
    operatingStatus,
    entity,
    handleEntityChange,
    handleOperatingStatusChange,
    createdDt,
    handleCreatedDtChange,
    modifiedDt,
    handleModifiedDtChange,
    resetTableState,
    activePageRecords,
    changeSortingState,
    initialSortingState,
  } = useViewer();
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
