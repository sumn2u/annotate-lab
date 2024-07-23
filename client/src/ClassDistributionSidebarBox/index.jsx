// @flow

import React, { useEffect, useState } from "react"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import SidebarBoxContainer from "../SidebarBoxContainer"
import BarChartIcon from "@mui/icons-material/BarChart"
import { grey, deepOrange } from "@mui/material/colors"
import { useTranslation } from "react-i18next"
import { BarChart } from "@mui/x-charts/BarChart"
import RefreshIcon from "@mui/icons-material/Refresh"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import { getLabels } from "../utils/get-data-from-server"
import colors from "../colors"
import { useTheme } from "../ThemeContext"
import { themes } from "../Theme"
export const ClassDistributionSidebarBox = ({ regionClsList, shouldExpand=false }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const newTheme = createTheme({ palette: { mode: theme } });

  const [labelsInfo, setLabelsInfo] = useState([])
  const assignRandomColors = (responseList, classList) => {
    let coloredResponse = []
    responseList.forEach((entry) => {
      let className = entry["class"]
      let index = classList.indexOf(className)

      if (index !== -1) {
        const randomColor =
          index < classList.length
            ? colors[index]
            : colors[index % colors.length]
        entry["color"] = randomColor
        entry["label"] = className
        coloredResponse.push(entry)
      }
    })
    return coloredResponse
  }

  const fetchData = () => {
    getLabels()
      .then((response) => {
        let coloredResponse = assignRandomColors(response, regionClsList)
        setLabelsInfo(coloredResponse)
      })
      .catch((error) => {
        console.log(error, "error")
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefreshClick = () => {
    fetchData()
  }


  const CustomItemTooltipContent = (props) => {
    const { itemData, series } = props
    return (
      <Paper
        sx={{ padding: 1, backgroundColor: series.color, fontSize: "10px" }}
      >
        <p>
          {series.label}: {series.data}{" "}
        </p>
      </Paper>
    )
  }
  const darkMode = theme === themes.dark;
  const barChartsParams = {
    slotProps: {
      legend: {
        hidden: true,
        label: {
          style: {
            color: darkMode ? "#ffffff" : "#000000",
          },
        },
      },
    },
  };

  return (
    <ThemeProvider theme={newTheme}>
       <SidebarBoxContainer
        title={t("menu.class_distribution")}
        icon={<BarChartIcon style={{ color: grey[700] }} />}
        noScroll={true}
        expandedByDefault={shouldExpand}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: [t("menu.classifications")],
                  labelFontSize: 10,
                  hideTooltip: true,
                },
              ]}
              yAxis={[
                { label: t("menu.class_distribution_count"), labelFontSize: 10 },
              ]}     
            series={labelsInfo}
            width={300}
            height={300}
            {...barChartsParams}
            tooltip={{ trigger: "item", itemContent: CustomItemTooltipContent }}
          />
          <IconButton aria-label="refresh" onClick={handleRefreshClick} color="inherit">
            <RefreshIcon />
          </IconButton>
        </div>
      </SidebarBoxContainer>
    </ThemeProvider>
  )
}

export default ClassDistributionSidebarBox
