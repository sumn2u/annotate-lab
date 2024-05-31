import { createContext, useState, useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


const SnackbarContext = createContext({
  open: false,
  message: '',
  severity: 'info',
  handleClose: () => {},
});

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  const handleClose = () => {
    setOpen(false);
  };

  const showSnackbar = (message, newSeverity = 'info') => {
    setMessage(message);
    setSeverity(newSeverity);
    setOpen(true);
  };

  return (
    <SnackbarContext.Provider
      value={{ open, message, severity, handleClose, showSnackbar }}
    >
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export default SnackbarContext;
