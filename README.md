# Annotate-Lab

Annotate-Lab is an open-source application designed for image annotation, comprising two main components: the client and the server. The client, a React application, is responsible for the user interface where users perform annotations. On the other hand, the server, a Flask application, manages persisting the annotated changes and generating masked and annotated images, along with configuration settings. More information can be found in our [documentation](https://annotate-docs.dwaste.live/).

[![Open Source Helpers](https://www.codetriage.com/sumn2u/annotate-lab/badges/users.svg)](https://www.codetriage.com/sumn2u/annotate-lab)
[![Test Workflow](https://github.com/sumn2u/annotate-lab/actions/workflows/python-app.yml/badge.svg)](https://github.com/sumn2u/annotate-lab/actions)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/9112/badge)](https://www.bestpractices.dev/projects/9112)
[![Test Workflow](https://github.com/sumn2u/annotate-lab/actions/workflows/vite-app.yml/badge.svg)](https://github.com/sumn2u/annotate-lab/actions)
[![GitHub issues](https://img.shields.io/github/issues/sumn2u/annotate-lab)](https://github.com/sumn2u/annotate-lab/issues) [![GitHub forks](https://img.shields.io/github/forks/sumn2u/annotate-lab)](https://github.com/sumn2u/annotate-lab/network)
[![GitHub stars](https://img.shields.io/github/stars/sumn2u/annotate-lab)](https://github.com/sumn2u/annotate-lab/stargazers)
[![GitHub license](https://img.shields.io/github/license/sumn2u/annotate-lab)](https://github.com/sumn2u/annotate-lab/blob/master/LICENSE)



![example](./sample_images/example.png)

# Demo [V1.0]
[![Annotate Lab](https://img.youtube.com/vi/gR17uHbfoU4/0.jpg)](https://www.youtube.com/watch?v=gR17uHbfoU4)


<br/>


## Table of Contents
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
    - [Client Tests](#client-tests)
    - [Server Tests](#server-tests)
- [Usage](#usage)
- [Outputs](#outputs)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Project Structure [[documentation page]](https://annotate-docs.dwaste.live/overview/project-structure)
```sh

annotation-lab/
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── ... (other React app files)
├── server/
│   ├── db/
│   ├── tests/
│   ├── venv/
│   ├── app.py
│   ├── requirements.txt
│   └── ... (other Flask app files)
├── README.md
```


### Client
- **public/**: Static files and the root HTML file.
- **src/**: React components and other frontend code.
- **package.json**: Contains client dependencies and scripts.

### Server
- **db/**: Database-related files and handlers.
- **venv/**: Python virtual environment (not included in version control).
- **tests/**: Contains test files.
- **app.py**: Main Flask application file.
- **requirements.txt**: Contains server dependencies.

## Settings [[documentation page]](https://annotate-docs.dwaste.live/fundamentals/set-up-and-run/configuration)
One can configure the tools, tags, upload images and do many more from the settings.

![configuration](./sample_images/configuration.png)
## Dependencies

### Client
- React
- Axios
- Other dependencies as listed in `package.json`

### Server
- Flask
- Flask-CORS
- pandas
- Other dependencies as listed in `requirements.txt`

## Setup and Installation [[documentation page]](https://annotate-docs.dwaste.live/fundamentals/set-up-and-run)

### Client Setup
1. Navigate to the `client` directory:
   ```sh
   cd client
    ```
2. Install the dependencies:
    ```sh
   npm install
    ```
### Server Setup
1. Navigate to the `server` directory:
   ```sh
   cd server
    ```
2. Create and activate a virtual environment:
    ```sh
   python3 -m venv venv

   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install the dependencies:
```sh
   pip install -r requirements.txt
```

## Running the Application

### Running the Client
1. Navigate to the `client` directory:
   ```sh
   cd client
    ```
2. Install the dependencies:
    ```sh
   npm start
   ```
The application should now be running on [http://localhost:5173](http://localhost:5173).


### Running the Server
1. Navigate to the `server` directory:
   ```sh
   cd server
    ```
2. Activate the virtual environment:
    ```sh
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Start the Flask application:
   ```sh
   flask run
    ```
The server should now be running on [http://localhost:5000](http://localhost:5000).

### Running using Docker.
Navigate to the root directory and run the following command to start the application: 
```sh
docker-compose build
docker-compose up -d #running in detached mode
```
The  application should be running on [http://localhost](http://localhost). 

## Running Tests

### Client Tests

The client tests are located in the `client/src` directory and utilize `.test.js` extensions. They are built using [Jest](https://jestjs.io/) and [React Testing Library](https://github.com/testing-library/react-testing-library).

#### Install Dependencies:

```bash
cd client
npm install
```
#### Run Tests:
```bash
npm test
```

This command launches the test runner in interactive watch mode. It runs all test files and provides feedback on test results.


### Server Tests

The server tests are located in the `server/tests` directory and are implemented using [unittest](https://docs.python.org/3/library/unittest.html).

#### Install Dependencies:

```bash
cd ../server
python -m venv venv
source venv/bin/activate # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```
#### Run Tests:
```bash
python3 -m unittest discover -s tests -p 'test_*.py'

```

This command discovers and runs all test files (`test_*.py`) in the `server/tests` directory using unittest.

## Usage

1. Open your web browser and navigate to [http://localhost:5173](http://localhost:5173).
2. Use the user interface to upload and annotate images.
3. The annotations and other interactions will be handled by the Flask server running at [http://localhost:5000](http://localhost:5000).

## Configurations (Optional) [[documentation page]](https://annotate-docs.dwaste.live/overview/customization)
You can customize various aspects of Annotate-Lab through configuration settings. To do this, modify the `config.py` file in the `server` directory or the `config.js` file in the `client` directory.
```python
# config.py
MASK_BACKGROUND_COLOR = (0, 0, 0)  # Black background for masks
```

```Javascript
// config.js
const config = {
    SERVER_URL, // url of server
    UPLOAD_LIMIT: 5, // image upload limit
    OUTLINE_THICKNESS_CONFIG : { // outline thickness of tools
      POLYGON: 2,
      CIRCLE: 2,
      BOUNDING_BOX: 2
    }
  };
```

## Outputs [[documentation page]](https://annotate-docs.dwaste.live/fundamentals/set-up-and-run/outputs)
Sample of annotated image along with its mask and settings is show below.

![orange_annotation](./sample_images/orange_annotated-image.png)
![orange_annotation_mask](./sample_images/orange_masked-image.png)

```json
{
   "configuration":[
      {
         "image-name":"orange.png",
         "regions":[
            {
               "region-id":"47643630436867834",
               "image-src":"http://127.0.0.1:5000/uploads/orange.png",
               "class":"Orange",
               "comment":"",
               "tags":"",
               "points":[
                  [
                     0.4685613390092879,
                     0.7693498452012384
                  ],
                  [
                     0.6781491873065015,
                     0.6640866873065016
                  ],
                  [
                     0.723921246130031,
                     0.5092879256965944
                  ],
                  [
                     0.7480118034055728,
                     0.34055727554179566
                  ],
                  [
                     0.5841960139318886,
                     0.14705882352941177
                  ],
                  [
                     0.41917569659442727,
                     0.13312693498452013
                  ],
                  [
                     0.30113196594427244,
                     0.22755417956656346
                  ],
                  [
                     0.21079237616099072,
                     0.4411764705882353
                  ],
                  [
                     0.26620065789473685,
                     0.6764705882352942
                  ],
                  [
                     0.4011077786377709,
                     0.7879256965944272
                  ]
               ]
            },
            {
               "region-id":"5981359766055432",
               "image-src":"http://127.0.0.1:5000/uploads/orange.png",
               "class":"Apple",
               "comment":"",
               "tags":"",
               "x":[
                  0.1770655959752322
               ],
               "y":[
                  0.11764705882352941
               ],
               "w":[
                  0.5854005417956657
               ],
               "h":[
                  0.6981424148606811
               ]
            }
         ],
         "color-map":{
            "Orange":[
               244,
               67,
               54
            ],
            "Apple":[
               33,
               150,
               243
            ]
         }
      }
   ]
}

```

## Troubleshooting [[documentation page]](https://annotate-docs.dwaste.live/troubleshooting)

- Ensure that both the client and server are running.
- Check the browser console and terminal for any errors and troubleshoot accordingly.
- Verify that dependencies are correctly installed.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request. For major changes, open an issue first to discuss your proposed changes. Additionally, please adhere to the [code of conduct](CODE_OF_CONDUCT.md). More information about contributing can be found [here](./CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](./LICENSE).

## Acknowledgment

This project uses some part of work from idapgroup [react-image-annotate](https://github.com/idapgroup/react-image-annotate) and [image_annotator](https://github.com/gnamiro/image_annotator/tree/master).
