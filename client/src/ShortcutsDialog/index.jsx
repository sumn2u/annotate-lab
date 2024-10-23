import * as React from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

export const ShortcutsDialog = ({ open, handleClose }) => {
  const { t } = useTranslation()

  const shortcuts = [
    { key: "Ctrl + Shift + B", action: t("helptext_boundingbox") },
    { key: "Ctrl + Shift + Z", action: t("helptext_zoom") },
    { key: "Ctrl + Shift + P", action: t("helptext_polypolygon") },
    { key: "Ctrl + Shift + C", action: t("helptext_circle") },
    { key: "↑", action: t("short_key_up") },  // Up arrow key for navigation
    { key: "↓", action: t("short_key_down") },  // Down arrow key for navigation
  ]

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="shortcuts-dialog-title"
      aria-describedby="shortcuts-dialog-description"
      data-testid="shortcuts-dialog"
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          minHeight: "40vh",
          maxHeight: "80vh",
          padding: "20px",
        },
      }}
    >
      <DialogTitle id="shortcuts-dialog-title" data-testid="shortcuts-dialog-title">
        {t("Keyboard Shortcuts")}
      </DialogTitle>
      <DialogContent data-testid="shortcuts-dialog-content">
        <Box display="flex" flexDirection="column" gap={2}>
          {shortcuts.map((shortcut, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={1}
            >
              <Typography variant="body1" data-testid={`shortcut-key-${index}`}>
                {shortcut.key}
              </Typography>
              <Typography variant="body2" data-testid={`shortcut-action-${index}`}>
                {shortcut.action}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions data-testid="shortcuts-dialog-actions">
        <Button onClick={handleClose} data-testid="close-button">
          {t("Close")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ShortcutsDialog
