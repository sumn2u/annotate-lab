import { createContext, useState, useContext } from "react"
import Snackbar from "@mui/material/Snackbar"
import Alert from "@mui/material/Alert"

const SnackbarContext = createContext({
  showSnackbar: () => {},
})

export const SnackbarProvider = ({ children }) => {
  const [messages, setMessages] = useState([])

  const showSnackbar = (message, severity = "info") => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: new Date().getTime(), message, severity },
    ])
  }

  const handleClose = (index) => {
    setMessages((prevMessages) =>
      prevMessages.filter((msg, idx) => idx !== index),
    )
  }

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {messages.map((msg, index) => (
        <Snackbar
          key={msg.id + index}
          open
          autoHideDuration={null}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={() => handleClose(index)}
          sx={{ mb: index * 8 }}
        >
          <Alert onClose={() => handleClose(index)} severity={msg.severity}>
            {msg.message}
          </Alert>
        </Snackbar>
      ))}
      {children}
    </SnackbarContext.Provider>
  )
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider")
  }
  return context
}

export default SnackbarContext
