import {
  Box,
  Button,
  Drawer,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import React, { memo } from 'react';

interface TViewerFilterDrawer {
  drawerOpen: boolean;
  toggleDrawer: () => void;
  operatingStatus: string;
  handleOperatingStatusChange: (event: SelectChangeEvent<string>) => void;
  entity: string;
  handleEntityChange: (event: SelectChangeEvent<string>) => void;
  createdDt: string;
  handleCreatedDtChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  modifiedDt: string;
  handleModifiedDtChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetTableState: () => void;
}

const ViewerFilterDrawer = ({
  drawerOpen,
  toggleDrawer,
  operatingStatus,
  handleOperatingStatusChange,
  entity,
  handleEntityChange,
  createdDt,
  handleCreatedDtChange,
  modifiedDt,
  handleModifiedDtChange,
  resetTableState,
}: TViewerFilterDrawer) => {
  return (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={toggleDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '90%', sm: '40%' },
        },
      }}
    >
      <Box p={2}>
        <Typography color="secondary" variant="h6" gutterBottom>
          Additional Filters
        </Typography>
        <FormControl fullWidth margin="normal">
          <Select
            value={entity}
            onChange={handleEntityChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="FREIGHT FORWARDER">FREIGHT FORWARDER</MenuItem>
            <MenuItem value="CARRIER">CARRIER</MenuItem>
            <MenuItem value="BROKER">BROKER</MenuItem>
            <MenuItem value="CARRIER/IEP">CARRIER/IEP</MenuItem>
            <MenuItem value="IEP">IEP</MenuItem>
            <MenuItem value="CARRIER/SHIPPER">CARRIER/SHIPPER</MenuItem>
          </Select>
          <FormHelperText>Entity Type</FormHelperText>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <Select
            value={operatingStatus}
            onChange={handleOperatingStatusChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="not authorized">Not Authorized</MenuItem>
            <MenuItem value="authorized for property">
              Authorized for Property
            </MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="out-of-service">Out Of Service</MenuItem>
          </Select>
          <FormHelperText>Operating Status</FormHelperText>
        </FormControl>
        <TextField
          label="Created Date"
          type="date"
          value={createdDt}
          onChange={handleCreatedDtChange}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Modified Date"
          type="date"
          value={modifiedDt}
          onChange={handleModifiedDtChange}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          margin="normal"
        />
        <Button
          variant="outlined"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={resetTableState}
        >
          Reset to Default
        </Button>
      </Box>
    </Drawer>
  );
};

export default memo(ViewerFilterDrawer);
