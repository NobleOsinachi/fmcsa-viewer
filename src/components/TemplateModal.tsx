import React, { memo, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItemText,
  IconButton,
  ListItemButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSaveTemplate: (templateName: string) => void;
  templates: { [key: string]: any };
  handleTemplateAction: (
    templateName: string,
    action: 'delete' | 'load' | 'copy_link' | 'share_template',
  ) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  open,
  onClose,
  onSaveTemplate,
  templates,
  handleTemplateAction,
}) => {
  const [templateName, setTemplateName] = useState('');

  const handleSave = () => {
    onSaveTemplate(templateName);
    setTemplateName('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...modalStyle, width: 400 }}>
        <Box
          display={'flex'}
          alignItems="center"
          mb={1}
          justifyContent="space-between"
        >
          <Typography variant="subtitle1">Save/Load Table Templates</Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <TextField
          label="Template Name"
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          fullWidth
          disabled={!templateName}
        >
          Save Template
        </Button>
        {Object.keys(templates).length > 0 && (
          <Typography variant="subtitle1" sx={{ mt: 4 }}>
            Load Existing Template
          </Typography>
        )}
        <List dense={true}>
          {Object.keys(templates).map(name => (
            <ListItemButton key={name}>
              <ListItemText
                primary={name}
                onClick={() => {
                  handleTemplateAction(name, 'load');
                  onClose();
                }}
              />
              <Box>
                <IconButton
                  sx={{ mr: 0 }}
                  onClick={() => handleTemplateAction(name, 'copy_link')}
                  edge="end"
                  aria-label="copy link"
                >
                  <ContentCopyIcon fontSize={'small'} />
                </IconButton>
                <IconButton
                  sx={{ mr: 0 }}
                  onClick={() => handleTemplateAction(name, 'share_template')}
                  edge="end"
                  aria-label="share"
                >
                  <ShareIcon fontSize={'small'} />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleTemplateAction(name, 'delete')}
                >
                  <DeleteIcon fontSize={'small'} />
                </IconButton>
              </Box>
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 4,
};

export default memo(TemplateModal);
