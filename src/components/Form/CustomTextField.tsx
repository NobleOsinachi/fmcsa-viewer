import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& label.Mui-focused': {
    color: '#A0AAB4',
    fontSize: '14px',
    transition: 'color 300ms, font-size 300ms',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#B2BAC2',
    transition: 'border-bottom-color 300ms',
  },
  '& .MuiOutlinedInput-root': {
    fontSize: '14px',
    '& fieldset': {
      borderColor: '#1C6DA6',
      transition: 'border-color 300ms',
    },
    '&:hover fieldset': {
      borderColor: '#1C6DA6',
      transition: 'border-color 300ms',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1C6DA6',
      transition: 'border-color 300ms',
    },
    '& input': {
      fontSize: '14px',
      padding: '8px 14px',
    },
  },
  // Responsive max width
  [theme.breakpoints.up('sm')]: {
    maxWidth: 320,
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
  },
}));

export default memo(CustomTextField);
