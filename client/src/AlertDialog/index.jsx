import * as React from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"

export const AlertDialog = (props) => {
  const {
    open,
    handleClose,
    handleExit,
    title,
    description,
    exitConfirm,
    exitCancel,
  } = props

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      data-testid="alert-dialog"
    >
      <DialogTitle id="alert-dialog-title" data-testid="alert-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent data-testid="alert-dialog-content">
        <DialogContentText
          id="alert-dialog-description"
          data-testid="alert-dialog-description"
        >
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions data-testid="alert-dialog-actions">
        <Button onClick={handleClose} data-testid="disagree-button">
          {exitCancel}
        </Button>
        <Button onClick={handleExit} autoFocus data-testid="agree-button">
          {exitConfirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AlertDialog
