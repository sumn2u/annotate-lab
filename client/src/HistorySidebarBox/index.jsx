// @flow

import React, { memo } from "react"
import { createTheme, styled, ThemeProvider } from "@mui/material/styles"
import SidebarBoxContainer from "../SidebarBoxContainer"
import HistoryIcon from "@mui/icons-material/History"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import UndoIcon from "@mui/icons-material/Undo"
import moment from "moment"
import { grey } from "@mui/material/colors"
import isEqual from "lodash/isEqual"
import { useTranslation } from "react-i18next"
import { Grid } from "@mui/material"
import Tooltip from "@mui/material/Tooltip"

const theme = createTheme()
const EmptyTextDiv = styled("div")(() => ({
  fontSize: 14,
  fontWeight: "bold",
  color: grey[500],
  textAlign: "center",
  padding: 20,
}))

const listItemTextStyle = {
  paddingLeft: 16,
  fontSize: 11,
  paddingTop: 0,
  paddingBottom: 0,
}

export const HistorySidebarBox = ({ history, onRestoreHistory }) => {
  const { t } = useTranslation()

  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title={t("menu.history")}
        icon={<HistoryIcon style={{ color: grey[700] }} />}
        expandedByDefault
        noScroll={true}
      >
        <List sx={{ paddingTop: "0px" }}>
          {history.length === 0 && (
            <EmptyTextDiv>{t("no.history")}</EmptyTextDiv>
          )}
          {history.map(({ name, time }, i) => (
            <ListItem
              sx={{ paddingTop: "0px", paddingBottom: "0px" }}
              button
              dense
              key={i}
            >
              <ListItemText
                style={listItemTextStyle}
                primary={name}
                secondary={moment(time).format("LT")}
                primaryTypographyProps={{ style: listItemTextStyle }}
                secondaryTypographyProps={{ style: listItemTextStyle }}
              />
              {i === 0 && (
                <ListItemSecondaryAction onClick={() => onRestoreHistory()}>
                  <Grid item xs={1} onClick={() => onRestoreHistory()}>
                    <Tooltip title={t("undo_last_action")} placement="left">
                      <UndoIcon sx={{ fontSize: 14 }} data-testid="undo-icon" />
                    </Tooltip>
                  </Grid>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      </SidebarBoxContainer>
    </ThemeProvider>
  )
}

export default memo(HistorySidebarBox, (prevProps, nextProps) =>
  isEqual(
    prevProps.history.map((a) => [a.name, a.time]),
    nextProps.history.map((a) => [a.name, a.time]),
  ),
)
