import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CategoryIcon from "@mui/icons-material/Category";
import BuildIcon from "@mui/icons-material/Build";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import React, { useEffect, useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import PropTypes from "prop-types"
import InfoIcon from '@mui/icons-material/Info'; 
import ConfigureImageClassification from "../ConfigureImageClassification";
import ConfigureImageSegmentation from "../ConfigureImageSegmentation";
import Button from '@mui/material/Button';
import ConfigurationTask from "../ConfigurationTask";
import ImageUpload from "../ImageUpload";
import { useSettings } from "../SettingsProvider";
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
  

  const StyledIcon = styled('div')(({ theme, icon: IconProp }) => ({
    marginRight: theme.spacing(2),
    color: theme.palette.text.secondary,
    '& svg': {
      fontSize: theme.typography.h6.fontSize,
    },
  }));

  const IconWrapper = ({ icon: IconProp }) => (
    <StyledIcon>
      {IconProp ? <IconProp /> : <InfoIcon />}
    </StyledIcon>
  );
  
export const SetupPage = ({setConfiguration, settings, setShowLabel}) => {
  const [currentTab, setTab] = useState("datatype");
  const [hasConfig, setHasConfig] = useState(false);
  const settingsConfig = useSettings()
  const updateConfiguration = (newConfig) => {
    const {labels} = newConfig
    setHasConfig(labels.length > 0)
    setConfiguration({type: "UPDATE_CONFIGURATION", payload: newConfig})
  }

  const handleImageUpload = (images) => {
    const extractedNames = images.map(image => {
      const src = image.preview;
      const selectedClsList = ''; // Assuming 'cls' information is not present
      const comment = ''; // Assuming 'comment' information is not present
      const processed = false; // Assuming 'processed' information is not present
      const name = image.filename.split('.')[0]; // Remove file extension from image name
      return { src, name, selectedClsList, comment, processed };
    });
    setConfiguration({type: "UPDATE_IMAGES", payload: extractedNames})
  };

  const updateTaskInfo = (newTaskInfo) => {
    setConfiguration({type: "UPDATE_TASK_INFO", payload: newTaskInfo})
  }
  
  const showLab = ()=> {
    const { configuration } = settings;
    const hasLabels = configuration.labels.length > 0;
    setShowLabel(hasLabels)
    if(hasLabels) {
      settingsConfig.changeSetting('settings',settings);
    }
  }

  return (
    <Box display="flex"  justifyContent="center"  minHeight="100vh" marginTop={"5rem"}>
        <Box>
            <Box  paddingBottom="0px">
                <Tabs sx={{ borderBottom: 1, borderColor: 'divider' }} value={currentTab} onChange={(e, newTab) => setTab(newTab)}>
                <Tab icon={<CategoryIcon />} label="Task Info" value="datatype" />
                <Tab disabled={!settings.taskChoice} icon={<BuildIcon />} label="Configure" value="configure" />
                <Tab disabled={!settings.configuration.labels} icon={<AddPhotoAlternateIcon />} label="Image" value="image" />
                </Tabs>
            </Box>
            {currentTab === "datatype" && (
               <Box minWidth="35vw">
                  <ConfigurationTask config={settings} onChange={updateTaskInfo} />
                  <Box display="flex"  justifyContent="end">
                        <Button variant="contained" disabled={settings.taskDescription.trim().length <= 0} onClick={() => setTab("configure")} disableElevation>
                            Next
                        </Button>
                      </Box>
                </Box>
            )}

            {currentTab === "configure" && ( 
                <Container>
                  {settings.taskChoice === "image_classification" && (
                    <>
                      <ConfigureImageClassification config={settings.configuration} onChange={updateConfiguration} />
                      <Box display="flex"  justifyContent="end">
                        <Button variant="contained" disabled={!hasConfig} onClick={() => setTab("image")} disableElevation>
                            Next
                        </Button>
                      </Box>
                    </>
                  
                  )}
                  {settings.taskChoice === "image_segmentation" && (
                    <>
                      <ConfigureImageSegmentation config={settings.configuration} onChange={updateConfiguration} />
                      <Box display="flex"  justifyContent="end">
                        <Button variant="contained" disabled={!hasConfig} onClick={() => setTab("image")} disableElevation>
                            Next
                        </Button>
                      </Box>
                    </>
                  
                  )}
                </Container>
            )}
            {currentTab === "image" && (
              <>
               <Box sx={{ padding: '2rem' }}>
                <Typography variant="h6" gutterBottom>
                  Upload Images
                </Typography>
                <ImageUpload onImageUpload={handleImageUpload} />
              </Box>
              <Box display="flex"  justifyContent="end">
                <Button variant="contained" onClick={showLab} disableElevation>
                    Open Lab
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