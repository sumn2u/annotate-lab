import { useEffect } from "react";
import { createTheme, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CategoryIcon from "@mui/icons-material/Category";
import BuildIcon from "@mui/icons-material/Build";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import React, { useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PropTypes from "prop-types"
import ConfigureImageClassification from "../ConfigureImageClassification";
import ConfigureImageSegmentation from "../ConfigureImageSegmentation";
import Button from '@mui/material/Button';
import ConfigurationTask from "../ConfigurationTask";
import ImageUpload from "../ImageUpload";
import { useSettings } from "../SettingsProvider";
import { useTranslation } from "react-i18next"
import { Info } from '@mui/icons-material';
import NoteSection from "../NoteSection";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from '@mui/material/useMediaQuery';
import config from '../config.js';
import { saveSettings } from "../utils/send-data-to-server.js";

const theme = createTheme()

const Container = styled("div")({
  marginTop: "2rem",
})

const StyledCard = styled(Card)(({ theme, selected }) => ({
    minWidth: 215,
    maxWidth: 200,
    marginTop: theme.spacing(2),
    boxShadow: theme.shadows[3],
    borderRadius: theme.shape.borderRadius,
    backgroundColor: selected ? theme.palette.primary.main : theme.palette.background.paper,
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'scale(1.02)',
      cursor: 'pointer',
    },
  }));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
  }));
  

export const SetupPage = ({setConfiguration, settings, setShowLabel, showAnnotationLab}) => {
  const { configuration, taskChoice } = settings;
  const [currentTab, setTab] = useState(false);
  const [hasConfig, setHasConfig] = useState(false);
  const settingsConfig = useSettings()
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeDevice = useMediaQuery(theme.breakpoints.up('md'));

  const updateConfiguration = (newConfig) => {
    const {labels, regionTypesAllowed, multipleRegionLabels, multipleRegions} = newConfig
    setHasConfig(labels?.length > 0)
    const newSettings = {
      ...settings,
      configuration: {
        ...settings.configuration,
        labels,
        regionTypesAllowed,
        multipleRegionLabels,
        multipleRegions
      }
    };
    settingsConfig.changeSetting('settings',newSettings);
    setConfiguration({type: "UPDATE_CONFIGURATION", payload: newConfig})
    showAnnotationLab(newSettings)
  }
  const {t} = useTranslation();

  const handleImageUpload = (images) => {
    const extractedNames = images.map(image => {
      let src = image.preview || image.src;
      if (src.includes("http://annotate-lab.onrender.com")) {
        src = src.replace("http://annotate-lab.onrender.com", "https://annotate-lab.onrender.com");
      }
      const selectedClsList = '' || image.selectedClsList; // Assuming 'cls' information is not present
      const comment = '' || image.comment; // Assuming 'comment' information is not present
      const processed = false || image.processed; // Assuming 'processed' information is not present
      const name = image.filename?.split('.')[0] || image.name; // Remove file extension from image name
      const selected = image.selected || false;
      return { src, name, selectedClsList, comment, processed, selected};
    });
    settings.images = extractedNames;
    settingsConfig.changeSetting('settings',settings);
    setConfiguration({type: "UPDATE_IMAGES", payload: extractedNames})
  };

  const updateTaskInfo = (newTaskInfo) => {
    setConfiguration({type: "UPDATE_TASK_INFO", payload: newTaskInfo})
    settings.taskDescription = newTaskInfo.taskDescription;
    settings.taskChoice = newTaskInfo.taskChoice;
    settingsConfig.changeSetting('settings',settings);
  }
  
  useEffect(() => {
    setTab("datatype");
  }, []);

  useEffect(() => {
    const hasLabels = configuration.labels.length > 0;
    if(hasLabels) {
      const newSettings = {...settings, showLab: true}
      settingsConfig.changeSetting('settings',newSettings);
      showAnnotationLab(newSettings)
    }
  }, [setShowLabel]);

  useEffect(() => {
    const { labels } = configuration
    if (labels.length > 0) {
      setHasConfig(true)
    }
  }, [currentTab]);
  
  const showLab = async ()=> {
    const hasLabels = configuration.labels.length > 0;
    setShowLabel(hasLabels)
    if(hasLabels) {
      const newSettings = {...settings, showLab: true}
      settingsConfig.changeSetting('settings',newSettings);
      await saveSettings(newSettings)
      showAnnotationLab(newSettings)
    }
  }

  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  };

  const isTaskInfoComplete = settings.taskDescription.trim().length > 0;
  const isConfigComplete = settings.configuration.labels.length > 0;
  const isImagesUploaded = settings.images.length > 0;
  const hasShowLab = settings.showLab;

  return (
    <Box display="flex"  justifyContent="center"  minHeight="100vh" marginTop={isSmallDevice ? "": "5rem"}>
        <Box>
          <Box paddingBottom="0px">
            <Tabs sx={{ borderBottom: 1, borderColor: 'divider' }} value={currentTab} onChange={handleTabChange}>
              <Tab icon={<CategoryIcon />} label={t("setup.tabs.taskinfo")} value="datatype" />
              <Tab disabled={!isTaskInfoComplete} icon={<BuildIcon />} label={t("setup.tabs.configure")} value="configure" />
              <Tab disabled={!isConfigComplete} icon={<AddPhotoAlternateIcon />} label={t("setup.tabs.images")} value="images" />
            </Tabs>
          </Box>
          <IconButton 
          disabled={!isTaskInfoComplete || !isConfigComplete || !isImagesUploaded}
           onClick={showLab} 
           sx={{ 
            position: 'absolute', 
            top: isLargeDevice ? '2rem' : '1rem', 
            left: isLargeDevice ? 'calc(100vw - 10rem)' : 'calc(100vw - 3rem)', 
            fontSize: isLargeDevice ? '2rem' : '1.5rem'
          }}>
              {hasShowLab && hasConfig &&  <CloseIcon fontSize={isLargeDevice ? "large" : "medium"} />}
          </IconButton>
            {currentTab === "datatype" && (
               <Box minWidth="55vw" paddingTop={"1rem"}>
                <>
                  <ConfigurationTask config={settings} onChange={updateTaskInfo} />  
                  <NoteSection 
                  icon={Info} 
                  text={t("more_info")} 
                  link={config.DOCS_URL} 
                />
                  <Box display="flex" paddingTop="5rem" justifyContent="end" marginRight={"0.5rem"}>
                        <Button variant="contained" disabled={settings.taskDescription.trim().length <= 0} onClick={() => setTab("configure")} disableElevation>
                            {t("btn.next")}
                        </Button>
                      </Box>
                      </>
                </Box>
            )}

            {currentTab === "configure" && ( 
                <Box minWidth="55vw" paddingTop={"1rem"}>
                  {settings.taskChoice === "image_classification" && (
                    <>
                      <ConfigureImageClassification config={settings.configuration} onChange={updateConfiguration} />
                      <Box display="flex"  justifyContent="end" paddingBottom="6rem" marginRight={"0.5rem"}>
                        <Button variant="contained" disabled={!hasConfig} onClick={() => setTab("images")} disableElevation>
                            {t("btn.next")}
                        </Button>
                      </Box>
                    </>
                  
                  )}
                  {settings.taskChoice === "image_segmentation" && (
                    <>
                      <ConfigureImageSegmentation config={settings.configuration} onChange={updateConfiguration} />
                      <Box display="flex"  justifyContent="end" paddingBottom="6rem" marginRight={"0.5rem"}>
                        <Button variant="contained" disabled={!hasConfig} onClick={() => setTab("images")} disableElevation>
                            {t("btn.next")}
                        </Button>
                      </Box>
                    </>
                  
                  )}
                </Box>
            )}
            {currentTab === "images" && (
              <>
               <Box sx={(theme) => ({
                  paddingTop: isSmallDevice ? '0' : '0.5rem',
                  padding: isSmallDevice ? '1.5rem' : '1rem',
                  [theme.breakpoints.down('sm')]: {
                    padding: '1rem',
                  },
                })} 
                width={isSmallDevice ? "auto" : "55vw"}>
                <Typography gutterBottom sx={{ fontWeight: 'bold', color: 'rgb(66, 66, 66)', fontSize: '18px', paddingBottom: '1rem', paddingTop: '0.5rem'}}>
                  {t("btn.upload_images")}
                </Typography>
                <ImageUpload onImageUpload={handleImageUpload} settingsImages={settings.images} />
              </Box>
              <Box display="flex"  justifyContent="end" paddingBottom="6rem" marginRight={"0.5rem"}>
                <Button variant="contained" disabled={!isImagesUploaded} onClick={showLab} disableElevation>
                  {t("btn.open_lab")}
                </Button>
              </Box>
              </>
            )}
        </Box>
    </Box>
  );
}
SetupPage.propTypes = {
  settings:PropTypes.object,
  setConfiguration: PropTypes.func,
}
export default SetupPage;