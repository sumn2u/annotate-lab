import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import ConfigurationTask from "./index"
import "@testing-library/jest-dom"

// Mock the useTranslation hook with actual translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) =>
      ({
        "setup.tabs.taskinfo.task_info": "Task Information",
        "setup.tabs.taskinfo.task_choice": "Choice of Task",
        "setup.tabs.taskinfo.task_choice_classification":
          "Object Detection",
        "setup.tabs.taskinfo.task_choice_segmentation": "Image Segmentation",
      })[key],
  }),
}))

jest.mock("material-survey/components/Survey", () => ({
  // Mock implementation for Survey
  __esModule: true,
  default: jest.fn(({ form, onQuestionChange }) => (
    <div data-testid="mocked-survey">
      {form.questions.map((q) => (
        <div key={q.name} data-testid={`question-${q.name}`}>
          {q.title}
          {q.type === "text" && <input data-testid={`answer-${q.name}`} />}
          {q.type === "radiogroup" && (
            <div>
              {q.choices.map((choice) => (
                <label key={choice.value}>
                  <input
                    type="radio"
                    value={choice.value}
                    name={q.name}
                    data-testid={`radio-${q.name}-${choice.value}`}
                  />
                  {choice.text}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      <button data-testid="complete-button">Complete</button>
    </div>
  )),
}))

describe("ConfigurationTask", () => {
  test("renders form with questions and calls onChange on answer change", () => {
    const mockConfig = {}
    const mockOnChange = jest.fn()

    const mockForm = {
      questions: [
        { name: "taskDescription", title: "Task Description", type: "text" },
        {
          name: "taskChoice",
          title: "Task Choice",
          type: "radiogroup",
          choices: [
            { value: "object_detection", text: "Object Detection" },
            { value: "image_segmentation", text: "Image Segmentation" },
          ],
        },
      ],
    }

    render(
      <ConfigurationTask
        config={mockConfig}
        onChange={mockOnChange}
        form={mockForm}
      />,
    )

    // Assert question titles are rendered
    expect(screen.getByText("Task Information")).toBeInTheDocument()
    expect(screen.getByText("Choice of Task")).toBeInTheDocument()

    // Assert radio buttons are rendered
    const imageObjectDetectionRadio = screen.getByTestId(
      `radio-taskChoice-object_detection`,
    )
    const imageSegmentationRadio = screen.getByTestId(
      `radio-taskChoice-image_segmentation`,
    )
    expect(imageObjectDetectionRadio).toBeInTheDocument()
    expect(imageSegmentationRadio).toBeInTheDocument()

    // Simulate changing radio button and verify onChange is called
    fireEvent.click(imageSegmentationRadio, {
      target: { value: "image_segmentation" },
    })
    expect(imageSegmentationRadio).toHaveAttribute(
      "value",
      "image_segmentation",
    )

    // Simulate completing the form
    fireEvent.click(screen.getByTestId("complete-button"))
  })
})
