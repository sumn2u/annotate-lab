// @flow
import React, { useMemo } from "react"
import { setIn, asMutable } from "seamless-immutable"
import { CssBaseline, GlobalStyles } from "@mui/material"
import { useTranslation } from "react-i18next"
import SurveyWithConfirmDelete from "../SurveyWithConfirmDelete"  // adjust path as needed

export default ({ config, onChange }) => {
  const { t } = useTranslation()

  const form = {
    questions: [
      {
        name: "multipleRegions",
        title: t("configuration.multiple_regions"),
        type: "boolean",
      },
      {
        name: "multipleRegionLabels",
        title: t("configuration.multiple_region_labels"),
        type: "boolean",
      },
      {
        name: "regionTypesAllowed",
        title: t("configuration.region_types_allowed"),
        description: t("configuration.region_types_allowed.description"),
        type: "multiple-dropdown",
        choices: ["bounding-box", "polygon", "circle"],
      },
      {
        name: "labels",
        title: t("configuration.labels"),
        description: t("configuration.labels.description"),
        type: "matrixdynamic",
        confirmDelete: true,
        confirmDeleteText: t(
          "configuration.labels.delete_warning",
          "Deleting this label may affect existing annotations that use it. Are you sure you want to continue?"
        ),
        columns: [
          {
            cellType: "text",
            name: "id",
            title: t("configuration.labels.option.id"),
            isRequired: true,
          },
          {
            cellType: "text",
            name: "description",
            title: t("configuration.labels.option.description"),
          },
        ],
      },
    ],
  }

  const defaultAnswers = useMemo(
    () =>
      asMutable(
        {
          multipleRegions: config.multipleRegions ?? false,
          multipleRegionLabels: config.multipleRegionLabels ?? false,
          regionTypesAllowed: config.regionTypesAllowed
            ? config.regionTypesAllowed
            : [],
          labels:
            (config.labels || []).map((a) => {
              return typeof a === "string" ? { id: a, description: a } : a
            }) || [],
        },
        { deep: true },
      ),
    [config.labels, config.multipleRegions, config.multipleRegionLabels, config.regionTypesAllowed],
  )

  const handleQuestionChange = (questionId, newValue) => {
    let processedValue = newValue
    if (
      questionId !== "regionTypesAllowed" &&
      questionId !== "multipleRegions" &&
      questionId !== "multipleRegionLabels"
    ) {
      let arrayId = []
      if (Array.isArray(processedValue)) {
        processedValue = processedValue.filter((json) => {
          if (arrayId.includes(json.id)) return false
          arrayId.push(json.id)
          return true
        })
      }
    }
    onChange(setIn(config, [questionId], processedValue))
  }

  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          ".MuiSelect-select.MuiSelect-outlined": {
            height: "2.2rem !important",
            minHeight: "2.2rem !important",
            lineHeight: "2.2rem !important",
          },
          ".MuiSelect-select.MuiSelect-outlined > div": {
            paddingTop: "0px !important",
          },
          ".MuiInputBase-input.MuiOutlinedInput-input": {
            height: "2.2rem !important",
            minHeight: "2.2rem !important",
            lineHeight: "2.2rem !important",
          },
          ".MuiOutlinedInput-root": {
            height: "2.2rem !important",
            minHeight: "2.2rem !important",
            lineHeight: "2.2rem !important",
          },
          "@media (min-width: 600px)": {
            ".MuiInputBase-input": {
              width: "350px !important",
            },
          },
        }}
      />
      <SurveyWithConfirmDelete
        noActions
        variant="flat"
        form={form}
        defaultAnswers={defaultAnswers}
        onQuestionChange={handleQuestionChange}
      />
    </>
  )
}