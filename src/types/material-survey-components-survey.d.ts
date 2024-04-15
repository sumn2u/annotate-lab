declare module "material-survey/components/Survey" {
  import { ComponentType } from "react";

  type SurveyQuestionType =
    | "boolean"
    | "dropdown"
    | "multiple-dropdown"
    | "radiogroup"
    | "text"
    | "multiline-text"
    | "checkbox"
    | string;

  interface SurveyQuestion {
    type: SurveyQuestionType;
    title: string;
    name: string;
    defaultValue?: any;
    choices?: string[];

    [key: string]: any;
  }

  export interface SurveyProps {
    variant: "flat" | "paper";
    noActions: boolean;
    defaultAnswers: any;
    onQuestionChange: (q: string, a: any, answers: Record<string, any>) => void;
    form: {
      questions: SurveyQuestion[];
    };
  }

  const Survey: ComponentType<SurveyProps>;
  export default Survey;
}
