import React, { useState, useRef } from "react"
import Survey from "material-survey/components/Survey"
import AlertDialog from "../AlertDialog" 

export default function SurveyWithConfirmDelete({
  form,
  defaultAnswers,
  onQuestionChange,
  ...surveyProps
}) {
  const [pendingDelete, setPendingDelete] = useState(null)
  const [surveyKey, setSurveyKey] = useState(0)
  const prevAnswersRef = useRef({})

  prevAnswersRef.current = defaultAnswers

  const handleQuestionChange = (questionId, newValue) => {
    const question = form.questions.find((q) => q.name === questionId)
    const isMatrixDynamic = question?.type === "matrixdynamic"
    const needsConfirm = isMatrixDynamic && question?.confirmDelete === true

    if (needsConfirm) {
      const oldAnswers = prevAnswersRef.current[questionId] || []
      const newAnswers = newValue || []
      if (
        Array.isArray(oldAnswers) &&
        Array.isArray(newAnswers) &&
        newAnswers.length < oldAnswers.length
      ) {
        setPendingDelete({
          questionId,
          newValue,
          confirmDeleteText:
            question.confirmDeleteText || "Are you sure you want to delete this row?",
        })
        return
      }
    }

    // No confirmation needed – apply change immediately
    applyChange(questionId, newValue)
  }

  const applyChange = (questionId, newValue) => {
    if (onQuestionChange) {
      onQuestionChange(questionId, newValue)
    }
    prevAnswersRef.current[questionId] = newValue
  }

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      applyChange(pendingDelete.questionId, pendingDelete.newValue)
      setPendingDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setPendingDelete(null)
    setSurveyKey((prev) => prev + 1) // Force remount to revert internal state
  }

  return (
    <>
      <Survey
        key={surveyKey}
        form={form}
        defaultAnswers={defaultAnswers}
        onQuestionChange={handleQuestionChange}
        {...surveyProps}
      />
      <AlertDialog
        open={!!pendingDelete}
        handleClose={handleCancelDelete}
        handleExit={handleConfirmDelete}
        title="Confirm Delete"
        description={pendingDelete?.confirmDeleteText || ""}
        exitConfirm="Delete"
        exitCancel="Cancel"
      />
    </>
  )
}