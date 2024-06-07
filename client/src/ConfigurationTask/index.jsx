// @flow
import React, { useMemo } from "react"
import Survey from "material-survey/components/Survey"
import { setIn } from "seamless-immutable"
import { CssBaseline, GlobalStyles } from "@mui/material";
import {useTranslation} from "react-i18next"

export default ({ config, onChange }) => {
    const { t } = useTranslation();
    const form = {
      questions: [
        {
          name: "taskDescription",
          title: t("setup.tabs.taskinfo.task_info"),
          type: "text",
          isRequired: true
        }, 
        {
            name: "taskChoice",
            title: t("setup.tabs.taskinfo.task_choice"),
            type: "radiogroup",
            isRequired: true,
            choices: [
              { value: "image_classification", text: t("setup.tabs.taskinfo.task_choice_classification")},
              { value: "image_segmentation", text: t("setup.tabs.taskinfo.task_choice_segmentation") },
            ],
          },
    
      ],
    }
    const defaultAnswers = useMemo(
        () => ({
          taskDescription: config.taskDescription || "",
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
