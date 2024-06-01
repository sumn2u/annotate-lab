// @flow
import React, { useMemo } from "react"
import Survey from "material-survey/components/Survey"
import { setIn, asMutable } from "seamless-immutable"
import { CssBaseline, GlobalStyles } from "@mui/material";

const form = {
    questions: [
      {
        name: "regionTypesAllowed",
        title: "Region Types Allowed",
        description: "What types of regions can be drawn on the image.",
        type: "multiple-dropdown",
        choices: ["bounding-box", "polygon", "point"],
      },
      {
        name: "multipleRegions",
        title: "Can multiple regions be created?",
        type: "boolean",
      },
      {
        name: "multipleRegionLabels",
        title: "Multiple Region Labels Allowed?",
        type: "boolean",
      },
      {
        name: "labels",
        title: "Available Labels",
        description:
          "If you're labeling regions on an image, these are the allowed classifications or tags.",
        type: "matrixdynamic",
        columns: [
          { cellType: "text", name: "id", title: "id" },
          {
            cellType: "text",
            name: "description",
            title: "Description (optional)",
          },
        ],
      },
    ],
  }

export default ({ config, onChange }) => {
  const defaultAnswers = useMemo(
    () =>
      asMutable(
        {
          multipleRegions: Boolean(
            config.multipleRegions || config.multipleRegions === undefined
          ),
          multipleRegionLabels: Boolean(config.multipleRegionLabels),
          regionTypesAllowed: config.regionTypesAllowed,
          labels:
            (config.labels || []).map((a) =>
              typeof a === "string" ? { id: a, description: a } : a
            ) || [],
        },
        { deep: true }
      ),
    [config]
  )
  return (
    <>
        <CssBaseline />
        <GlobalStyles styles={{
            '.MuiSelect-select.MuiSelect-outlined': {
            height: '2.2rem !important',
            minHeight: '2.2rem !important',
            lineHeight: '2.2rem !important',
            },
            '.MuiSelect-select.MuiSelect-outlined > div': {
                paddingTop: '0px !important',
            },
            '.MuiButtonBase-root.MuiCheckbox-root': {
              padding: '2px !important',
            },
            '.MuiInputBase-input.MuiOutlinedInput-input': {
            height: '2.2rem !important',
            minHeight: '2.2rem !important',
            lineHeight: '2.2rem !important',
            },
            '.MuiOutlinedInput-root': {
            height: '2.2rem !important',
            minHeight: '2.2rem !important',
            lineHeight: '2.2rem !important',
            }
        }} />
        <Survey
        noActions
        variant="flat"
        defaultAnswers={defaultAnswers}
        onQuestionChange={(questionId, newValue) => {
            if(questionId !=="regionTypesAllowed"){
                let arrayId = []
                if (Array.isArray(newValue)){
                    newValue = newValue.filter((json) => {
                        if (arrayId.includes(json.id)) return false
                        arrayId.push(json.id)
                        return true
                    })
                    onChange(setIn(config, [questionId], newValue))
                }
                }else {
                    onChange(setIn(config, [questionId], newValue))
                }
        }}
        form={form}
        />
    </>
    
  )
}
