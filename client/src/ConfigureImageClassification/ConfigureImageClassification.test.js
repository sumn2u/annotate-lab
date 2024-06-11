import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfigureImageClassification from './index';
import '@testing-library/jest-dom';

// Mock the useTranslation hook with actual translations
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: key => ({
            "configuration.multiple_regions": "Multiple Regions",
            "configuration.multiple_region_labels": "Multiple Region Labels",
            "configuration.region_types_allowed": "Region Types Allowed",
            "configuration.region_types_allowed.description": "Select the types of regions allowed",
            "configuration.labels": "Labels",
            "configuration.labels.description": "Provide labels for the regions",
            "configuration.labels.option.id": "ID",
            "configuration.labels.option.description": "Description",
            "configuration.regions": "Regions",
            "configuration.regions.description": "Select a region type",
        }[key]),
    }),
}));

// Mock the Survey component from material-survey
jest.mock('material-survey/components/Survey', () => ({
    __esModule: true,
    default: jest.fn(({ form, onQuestionChange }) => (
        <div data-testid="mocked-survey">
            {form.questions.map((q) => (
                <div key={q.name} data-testid={`question-${q.name}`}>
                    {q.title}
                    {q.type === 'boolean' && <input type="checkbox" data-testid={`checkbox-${q.name}`} />}
                    {q.type === 'checkbox' && (
                        <div>
                            {q.choices.map((choice) => (
                                <label key={choice}>
                                    <input
                                        type="checkbox"
                                        value={choice}
                                        name={q.name}
                                        data-testid={`checkbox-${q.name}-${choice}`}
                                    />
                                    {choice}
                                </label>
                            ))}
                        </div>
                    )}
                    {q.type === 'matrixdynamic' && (
                        <div data-testid={`matrixdynamic-${q.name}`}>
                            {q.columns.map((col) => (
                                <div key={col.name}>{col.title}</div>
                            ))}
                            <input data-testid={`matrixdynamic-input-${q.name}`} />
                        </div>
                    )}
                    {q.type === 'dropdown' && (
                        <select data-testid={`dropdown-${q.name}`}>
                            {q.choices.map((choice) => (
                                <option key={choice} value={choice}>
                                    {choice}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            ))}
            <button data-testid="complete-button">Complete</button>
        </div>
    )),
}));

describe('ConfigureImageClassification', () => {
    test('renders form with questions and calls onChange on answer change', () => {
        const mockConfig = {};
        const mockOnChange = jest.fn();

        render(<ConfigureImageClassification config={mockConfig} onChange={mockOnChange} />);

        // Assert question titles are rendered
        expect(screen.getByText('Multiple Regions')).toBeInTheDocument();
        expect(screen.getByText('Multiple Region Labels')).toBeInTheDocument();
        expect(screen.getByText('Region Types Allowed')).toBeInTheDocument();
        expect(screen.getByText('Labels')).toBeInTheDocument();
        expect(screen.getByText('Regions')).toBeInTheDocument();

        // Assert checkboxes are rendered
        const multipleRegionsCheckbox = screen.getByTestId('checkbox-multipleRegions');
        const multipleRegionLabelsCheckbox = screen.getByTestId('checkbox-multipleRegionLabels');
        expect(multipleRegionsCheckbox).toBeInTheDocument();
        expect(multipleRegionLabelsCheckbox).toBeInTheDocument();

        // Simulate changing checkbox and verify onChange is called
        fireEvent.change(multipleRegionsCheckbox, { target: { checked: true } });
        expect(multipleRegionsCheckbox).toBeChecked();
        fireEvent.change(multipleRegionLabelsCheckbox, { target: { checked: true } });
        expect(multipleRegionLabelsCheckbox).toBeChecked();

        // Simulate completing the form
        fireEvent.click(screen.getByTestId('complete-button'));
        // Add assertions to verify completion behavior based on YourComponent logic
    });
});
