import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import FilesListMenu from './index';
import '@testing-library/jest-dom';

// Mock images data
const mockAllImages = [
  { name: 'Image1', processed: false },
  { name: 'Image2', processed: true },
  { name: 'Image3', processed: false }
];

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => ({
      "menu.images": "Images",
    }[key]),
  }),
}));

describe('FilesListMenu', () => {
  const state = {
    "annotationType": "image",
    "showTags": true,
    "selectedTool": "create-polygon",
    "mode": null,
    "taskDescription": "dgdg",
    "settings": {
        "taskDescription": "dgdg",
        "taskChoice": "image_segmentation",
        "images": [
            {
                "src": "http://127.0.0.1:5000/uploads/clothes.jpeg",
                "name": "clothes",
                "selectedClsList": "",
                "comment": "",
                "processed": false
            }
        ],
        "dataTask": null,
        "configuration": {
            "labels": [
                {
                    "id": "dfgd"
                },
                {
                    "id": "dfg"
                }
            ],
            "multipleRegions": true,
            "multipleRegionLabels": true,
            "regionTypesAllowed": [
                "polygon",
                "bounding-box",
                "circle"
            ]
        }
    },
    "labelImages": false,
    "regionClsList": [
        "dfgd",
        "dfg"
    ],
    "regionColorList": [],
    "preselectCls": null,
    "regionTagList": [],
    "imageClsList": [],
    "imageTagList": [],
    "currentVideoTime": 0,
    "enabledTools": [
        "create-box",
        "create-polygon",
        "create-circle"
    ],
    "history": [],
    "enabledRegionProps": [
        "class",
        "comment"
    ],
    "selectedImage": 0,
    "images": [
        {
            "src": "http://127.0.0.1:5000/uploads/clothes.jpeg",
            "name": "clothes",
            "selectedClsList": [
                "dfgd"
            ],
            "comment": "",
            "processed": false
        }
    ],
    "lastAction": {
        "type": "SELECT_IMAGE",
        "imageIndex": 0,
        "image": {
            "src": "http://127.0.0.1:5000/uploads/clothes.jpeg",
            "name": "clothes",
            "selectedClsList": [
                "dfgd"
            ],
            "comment": "",
            "processed": false
        }
    },
    "selectedCls": "dfgd",
    "lastMouseMoveCall": 1718142223586
}
  it('renders correctly', () => {
    const onSelectJumpMock = jest.fn();
    const saveActiveImageMock = jest.fn();
    const onClickMock = jest.fn();
    
    const { getByText, getAllByTestId } = render(
      <FilesListMenu
        state={state}
        selectedImage={'image1'}
        allImages={mockAllImages}
        onSelectJump={onSelectJumpMock}
        saveActiveImage={saveActiveImageMock}
        onClick={onClickMock}
      />
    );

    // Check if the component title is rendered
    expect(getByText(/Images \[3\]/)).toBeInTheDocument();

    // Check if each image name is rendered
    mockAllImages.forEach(image => {
      expect(getByText(image.name)).toBeInTheDocument();
    });

    // Check if checkboxes are rendered for each image
    const checkboxes = getAllByTestId('checkbox');
    expect(checkboxes).toHaveLength(mockAllImages.length);

    // Simulate click on an image
    fireEvent.click(getByText('Image1'));

    // Check if the onClick callback is called with the correct arguments
    expect(onClickMock).toHaveBeenCalledWith({"activeImage": {"comment": "", "name": "clothes", "processed": false, "selectedClsList": ["dfgd"], "src": "http://127.0.0.1:5000/uploads/clothes.jpeg"}, "currentImageIndex": 0, "pathToActiveImage": ["images", 0]});

    // Check if the onSelectJump and saveActiveImage callbacks are called with the correct arguments
    expect(onSelectJumpMock).toHaveBeenCalledWith('Image1');
    expect(saveActiveImageMock).toHaveBeenCalledWith({"comment": "", "name": "clothes", "processed": false, "selectedClsList": ["dfgd"], "src": "http://127.0.0.1:5000/uploads/clothes.jpeg"});
  });
});
