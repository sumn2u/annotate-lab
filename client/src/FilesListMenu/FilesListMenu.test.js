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
    "selectedTool": "create-box",
    "mode": null,
    "taskDescription": "One ",
    "settings": {
        "taskDescription": "One ",
        "taskChoice": "image_segmentation",
        "images": [
            {
                "src": "http://127.0.0.1:5000/uploads/clothes.jpeg",
                "name": "clothes",
                "selectedClsList": "",
                "comment": "",
                "processed": false
            },
            {
                "src": "http://127.0.0.1:5000/uploads/orange.png",
                "name": "orange",
                "selectedClsList": "",
                "comment": "",
                "processed": false
            }
        ],
        "showLab": false,
        "configuration": {
            "labels": [
                {
                    "id": "One"
                },
                {
                    "id": "Two"
                }
            ],
            "multipleRegions": true,
            "multipleRegionLabels": true,
            "regionTypesAllowed": [
                "polygon",
                "circle",
                "bounding-box"
            ]
        }
    },
    "labelImages": false,
    "regionClsList": [
        "One",
        "Two"
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
    "history": [
        {
            "time": "2024-06-17T17:41:43.746Z",
            "state": {
                "annotationType": "image",
                "showTags": true,
                "selectedTool": "create-box",
                "mode": null,
                "taskDescription": "One ",
                "settings": {
                    "taskDescription": "One ",
                    "taskChoice": "image_segmentation",
                    "images": [
                        {
                            "src": "http://127.0.0.1:5000/uploads/clothes.jpeg",
                            "name": "clothes",
                            "selectedClsList": "",
                            "comment": "",
                            "processed": false
                        },
                        {
                            "src": "http://127.0.0.1:5000/uploads/orange.png",
                            "name": "orange",
                            "selectedClsList": "",
                            "comment": "",
                            "processed": false
                        }
                    ],
                    "showLab": false,
                    "configuration": {
                        "labels": [
                            {
                                "id": "One"
                            },
                            {
                                "id": "Two"
                            }
                        ],
                        "multipleRegions": true,
                        "multipleRegionLabels": true,
                        "regionTypesAllowed": [
                            "polygon",
                            "circle",
                            "bounding-box"
                        ]
                    }
                },
                "labelImages": false,
                "regionClsList": [
                    "One",
                    "Two"
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
                            "One"
                        ],
                        "comment": "",
                        "processed": false,
                        "pixelSize": {
                            "w": 400,
                            "h": 533
                        },
                        "regions": [
                            {
                                "type": "box",
                                "x": 0.27464787836925525,
                                "y": 0.3584253046565505,
                                "w": 0.37793427230046944,
                                "h": 0.39108950136088577,
                                "highlighted": true,
                                "editingLabels": false,
                                "color": "#f44336",
                                "cls": "One",
                                "id": "4928182238230594",
                                "comment": "fox",
                                "falseInput": false
                            }
                        ]
                    },
                    {
                        "src": "http://127.0.0.1:5000/uploads/orange.png",
                        "name": "orange",
                        "selectedClsList": "",
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
                            "One"
                        ],
                        "comment": "",
                        "processed": false,
                        "pixelSize": {
                            "w": 400,
                            "h": 533
                        },
                        "regions": [
                            {
                                "type": "box",
                                "x": 0.27464787836925525,
                                "y": 0.3584253046565505,
                                "w": 0.37793427230046944,
                                "h": 0.39108950136088577,
                                "highlighted": true,
                                "editingLabels": false,
                                "color": "#f44336",
                                "cls": "One",
                                "id": "4928182238230594",
                                "comment": "fox",
                                "falseInput": false
                            }
                        ]
                    }
                },
                "selectedCls": "One",
                "lastMouseMoveCall": 1718646103611,
                "mouseDownAt": {
                    "x": 0.8568075027824008,
                    "y": 0.4588401766275887
                },
                "hasNewChange": true
            },
            "name": "Create Box"
        },
        {
            "time": "2024-06-17T17:41:41.632Z",
            "state": {
                "annotationType": "image",
                "showTags": true,
                "selectedTool": "create-box",
                "mode": null,
                "taskDescription": "One ",
                "settings": {
                    "taskDescription": "One ",
                    "taskChoice": "image_segmentation",
                    "images": [
                        {
                            "src": "http://127.0.0.1:5000/uploads/clothes.jpeg",
                            "name": "clothes",
                            "selectedClsList": "",
                            "comment": "",
                            "processed": false
                        },
                        {
                            "src": "http://127.0.0.1:5000/uploads/orange.png",
                            "name": "orange",
                            "selectedClsList": "",
                            "comment": "",
                            "processed": false
                        }
                    ],
                    "showLab": false,
                    "configuration": {
                        "labels": [
                            {
                                "id": "One"
                            },
                            {
                                "id": "Two"
                            }
                        ],
                        "multipleRegions": true,
                        "multipleRegionLabels": true,
                        "regionTypesAllowed": [
                            "polygon",
                            "circle",
                            "bounding-box"
                        ]
                    }
                },
                "labelImages": false,
                "regionClsList": [
                    "One",
                    "Two"
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
                            "One"
                        ],
                        "comment": "",
                        "processed": false,
                        "pixelSize": {
                            "w": 400,
                            "h": 533
                        },
                        "regions": [
                            {
                                "type": "box",
                                "x": 0.27464787836925525,
                                "y": 0.3584253046565505,
                                "w": 0.37793427230046944,
                                "h": 0.39108950136088577,
                                "highlighted": true,
                                "editingLabels": true,
                                "color": "#f44336",
                                "cls": "One",
                                "id": "4928182238230594",
                                "comment": "fo"
                            }
                        ]
                    },
                    {
                        "src": "http://127.0.0.1:5000/uploads/orange.png",
                        "name": "orange",
                        "selectedClsList": "",
                        "comment": "",
                        "processed": false
                    }
                ],
                "lastAction": {
                    "type": "CHANGE_REGION",
                    "region": {
                        "type": "box",
                        "x": 0.27464787836925525,
                        "y": 0.3584253046565505,
                        "w": 0.37793427230046944,
                        "h": 0.39108950136088577,
                        "highlighted": true,
                        "editingLabels": true,
                        "color": "#f44336",
                        "cls": "One",
                        "id": "4928182238230594",
                        "comment": "fox"
                    }
                },
                "selectedCls": "One",
                "lastMouseMoveCall": 1718646099066,
                "mouseDownAt": null
            },
            "name": "Change Region Comment"
        },
        {
            "time": "2024-06-17T17:41:41.424Z",
            "state": {
                "annotationType": "image",
                "showTags": true,
                "selectedTool": "create-box",
                "mode": null,
                "taskDescription": "One ",
                "settings": {
                    "taskDescription": "One ",
                    "taskChoice": "image_segmentation",
                    "images": [
                        {
                            "src": "http://127.0.0.1:5000/uploads/clothes.jpeg",
                            "name": "clothes",
                            "selectedClsList": "",
                            "comment": "",
                            "processed": false
                        },
                        {
                            "src": "http://127.0.0.1:5000/uploads/orange.png",
                            "name": "orange",
                            "selectedClsList": "",
                            "comment": "",
                            "processed": false
                        }
                    ],
                    "showLab": false,
                    "configuration": {
                        "labels": [
                            {
                                "id": "One"
                            },
                            {
                                "id": "Two"
                            }
                        ],
                        "multipleRegions": true,
                        "multipleRegionLabels": true,
                        "regionTypesAllowed": [
                            "polygon",
                            "circle",
                            "bounding-box"
                        ]
                    }
                },
                "labelImages": false,
                "regionClsList": [
                    "One",
                    "Two"
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
                            "One"
                        ],
                        "comment": "",
                        "processed": false,
                        "pixelSize": {
                            "w": 400,
                            "h": 533
                        },
                        "regions": [
                            {
                                "type": "box",
                                "x": 0.27464787836925525,
                                "y": 0.3584253046565505,
                                "w": 0.37793427230046944,
                                "h": 0.39108950136088577,
                                "highlighted": true,
                                "editingLabels": true,
                                "color": "#f44336",
                                "cls": "One",
                                "id": "4928182238230594",
                                "comment": "f"
                            }
                        ]
                    },
                    {
                        "src": "http://127.0.0.1:5000/uploads/orange.png",
                        "name": "orange",
                        "selectedClsList": "",
                        "comment": "",
                        "processed": false
                    }
                ],
                "lastAction": {
                    "type": "CHANGE_REGION",
                    "region": {
                        "type": "box",
                        "x": 0.27464787836925525,
                        "y": 0.3584253046565505,
                        "w": 0.37793427230046944,
                        "h": 0.39108950136088577,
                        "highlighted": true,
                        "editingLabels": true,
                        "color": "#f44336",
                        "cls": "One",
                        "id": "4928182238230594",
                        "comment": "fo"
                    }
                },
                "selectedCls": "One",
                "lastMouseMoveCall": 1718646099066,
                "mouseDownAt": null
            },
            "name": "Change Region Comment"
        },
        {
            "time": "2024-06-17T17:41:41.283Z",
            "state": {
                "annotationType": "image",
                "showTags": true,
                "selectedTool": "create-box",
                "mode": null,
                "taskDescription": "One ",
                "settings": {
                    "taskDescription": "One ",
                    "taskChoice": "image_segmentation",
                    "images": [
                        {
                            "src": "http://127.0.0.1:5000/uploads/clothes.jpeg",
                            "name": "clothes",
                            "selectedClsList": "",
                            "comment": "",
                            "processed": false
                        },
                        {
                            "src": "http://127.0.0.1:5000/uploads/orange.png",
                            "name": "orange",
                            "selectedClsList": "",
                            "comment": "",
                            "processed": false
                        }
                    ],
                    "showLab": false,
                    "configuration": {
                        "labels": [
                            {
                                "id": "One"
                            },
                            {
                                "id": "Two"
                            }
                        ],
                        "multipleRegions": true,
                        "multipleRegionLabels": true,
                        "regionTypesAllowed": [
                            "polygon",
                            "circle",
                            "bounding-box"
                        ]
                    }
                },
                "labelImages": false,
                "regionClsList": [
                    "One",
                    "Two"
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
                            "One"
                        ],
                        "comment": "",
                        "processed": false,
                        "pixelSize": {
                            "w": 400,
                            "h": 533
                        },
                        "regions": [
                            {
                                "type": "box",
                                "x": 0.27464787836925525,
                                "y": 0.3584253046565505,
                                "w": 0.37793427230046944,
                                "h": 0.39108950136088577,
                                "highlighted": true,
                                "editingLabels": true,
                                "color": "#f44336",
                                "cls": "One",
                                "id": "4928182238230594"
                            }
                        ]
                    },
                    {
                        "src": "http://127.0.0.1:5000/uploads/orange.png",
                        "name": "orange",
                        "selectedClsList": "",
                        "comment": "",
                        "processed": false
                    }
                ],
                "lastAction": {
                    "type": "CHANGE_REGION",
                    "region": {
                        "type": "box",
                        "x": 0.27464787836925525,
                        "y": 0.3584253046565505,
                        "w": 0.37793427230046944,
                        "h": 0.39108950136088577,
                        "highlighted": true,
                        "editingLabels": true,
                        "color": "#f44336",
                        "cls": "One",
                        "id": "4928182238230594",
                        "comment": "f"
                    }
                },
                "selectedCls": "One",
                "lastMouseMoveCall": 1718646099066,
                "mouseDownAt": null
            },
            "name": "Change Region Comment"
        },
        {
            "time": "2024-06-17T17:41:37.192Z",
            "state": {
                "annotationType": "image",
                "showTags": true,
                "selectedTool": "create-box",
                "mode": null,
                "taskDescription": "One ",
                "settings": {
                    "taskDescription": "One ",
                    "taskChoice": "image_segmentation",
                    "images": [
                        {
                            "src": "http://127.0.0.1:5000/uploads/clothes.jpeg",
                            "name": "clothes",
                            "selectedClsList": "",
                            "comment": "",
                            "processed": false
                        },
                        {
                            "src": "http://127.0.0.1:5000/uploads/orange.png",
                            "name": "orange",
                            "selectedClsList": "",
                            "comment": "",
                            "processed": false
                        }
                    ],
                    "showLab": false,
                    "configuration": {
                        "labels": [
                            {
                                "id": "One"
                            },
                            {
                                "id": "Two"
                            }
                        ],
                        "multipleRegions": true,
                        "multipleRegionLabels": true,
                        "regionTypesAllowed": [
                            "polygon",
                            "circle",
                            "bounding-box"
                        ]
                    }
                },
                "labelImages": false,
                "regionClsList": [
                    "One",
                    "Two"
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
                            "One"
                        ],
                        "comment": "",
                        "processed": false,
                        "pixelSize": {
                            "w": 400,
                            "h": 533
                        }
                    },
                    {
                        "src": "http://127.0.0.1:5000/uploads/orange.png",
                        "name": "orange",
                        "selectedClsList": "",
                        "comment": "",
                        "processed": false
                    }
                ],
                "lastAction": {
                    "type": "SELECT_TOOL",
                    "selectedTool": "create-box"
                },
                "selectedCls": "One",
                "lastMouseMoveCall": 1718646097081,
                "mouseDownAt": {
                    "x": 0.27464787836925525,
                    "y": 0.3584253046565505
                }
            },
            "name": "Create Box"
        }
    ],
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
                "One"
            ],
            "comment": "",
            "processed": false,
            "pixelSize": {
                "w": 400,
                "h": 533
            },
            "regions": [
                {
                    "type": "box",
                    "x": 0.27464787836925525,
                    "y": 0.3584253046565505,
                    "w": 0.37793427230046944,
                    "h": 0.39108950136088577,
                    "highlighted": false,
                    "editingLabels": false,
                    "color": "#f44336",
                    "cls": "One",
                    "id": "4928182238230594",
                    "comment": "fox",
                    "falseInput": false
                }
            ]
        },
        {
            "src": "http://127.0.0.1:5000/uploads/orange.png",
            "name": "orange",
            "selectedClsList": "",
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
                "One"
            ],
            "comment": "",
            "processed": false,
            "pixelSize": {
                "w": 400,
                "h": 533
            },
            "regions": [
                {
                    "type": "box",
                    "x": 0.27464787836925525,
                    "y": 0.3584253046565505,
                    "w": 0.37793427230046944,
                    "h": 0.39108950136088577,
                    "highlighted": false,
                    "editingLabels": false,
                    "color": "#f44336",
                    "cls": "One",
                    "id": "4928182238230594",
                    "comment": "fox",
                    "falseInput": false
                }
            ]
        }
    },
    "selectedCls": "One",
    "lastMouseMoveCall": 1718646105660,
    "mouseDownAt": null,
    "hasNewChange": true
}

  it('renders correctly', () => {
    const onSelectJumpMock = jest.fn();
    const saveActiveImageMock = jest.fn();
    const onClickMock = jest.fn();
    const onSelectFileMock = jest.fn();
    const { getByText, getAllByTestId } = render(
      <FilesListMenu
        state={state}
        selectedImage={'image1'}
        allImages={mockAllImages}
        onSelectJump={onSelectJumpMock}
        onSelectFile={onSelectFileMock}
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
    expect(onClickMock).toHaveBeenCalledWith({"activeImage": {"comment": "", "name": "clothes", "pixelSize": {"h": 533, "w": 400}, "processed": false, "regions": [{"cls": "One", "color": "#f44336", "comment": "fox", "editingLabels": false, "falseInput": false, "h": 0.39108950136088577, "highlighted": false, "id": "4928182238230594", "type": "box", "w": 0.37793427230046944, "x": 0.27464787836925525, "y": 0.3584253046565505}], "selectedClsList": ["One"], "src": "http://127.0.0.1:5000/uploads/clothes.jpeg"}, "currentImageIndex": 0, "pathToActiveImage": ["images", 0]});

    // // Check if the onSelectJump and saveActiveImage callbacks are called with the correct arguments
    expect(onSelectJumpMock).toHaveBeenCalledWith('Image1');
    
    // simulate click on the first checkbox
    fireEvent.click(checkboxes[0]);

    //check if the saveActiveImageMock is called with the correct arguments 
    // expect(saveActiveImageMock).toHaveBeenCalledWith({"comment": "", "name": "clothes", "pixelSize": {"h": 533, "w": 400}, "processed": false, "regions": [{"cls": "One", "color": "#f44336", "comment": "fox", "editingLabels": false, "falseInput": false, "h": 0.39108950136088577, "highlighted": false, "id": "4928182238230594", "type": "box", "w": 0.37793427230046944, "x": 0.27464787836925525, "y": 0.3584253046565505}], "selectedClsList": ["One"], "src": "http://127.0.0.1:5000/uploads/clothes.jpeg"})
  });
});
