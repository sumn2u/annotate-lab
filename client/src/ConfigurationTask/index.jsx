// @flow
import React, { useMemo } from "react"
import Survey from "material-survey/components/Survey"
import { setIn } from "seamless-immutable"
import { CssBaseline, GlobalStyles } from "@mui/material";

const form = {
  questions: [
    {
      name: "taskDescription",
      title: "Task Information",
      type: "text",
      placeHolder: "Enter task details...",
      isRequired: true
    }, 
    {
        name: "taskChoice",
        title: "Choice of Task",
        type: "radiogroup",
        isRequired: true,
        choices: [
          { value: "image_classification", text: "Image Classification" },
          { value: "image_segmentation", text: "Image Segmentation" },
        ],
      },

  ],
}

export default ({ config, onChange }) => {
    const defaultAnswers = useMemo(
        () => ({
          taskDescription: config.taskInfo || "",
          taskChoice: config.taskChoice !== undefined ? config.taskChoice : "image_classification",
        }),
        [config.taskDescription, config.taskChoice]
      );
    

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
            onChange(setIn(config, [questionId], newValue));
        }}
        form={form}
        />
    </>
  )
}
