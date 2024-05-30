import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CategoryIcon from "@mui/icons-material/Category";
import BuildIcon from "@mui/icons-material/Build";
import PreviewIcon from "@mui/icons-material/Preview";
import React, { useEffect, useState } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import PropTypes from "prop-types"
import InfoIcon from '@mui/icons-material/Info'; 
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import ImageIcon from '@mui/icons-material/Image';
import ConfigureImageClassification from "../ConfigureImageClassification";
import ConfigureImageSegmentation from "../ConfigureImageSegmentation";
import Button from '@mui/material/Button';

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
  const dataTypes = [
    { name: "Image Classification", icon: ImageIcon },
    { name: "Image Segmentation", icon: ImageSearchIcon },
  ];

  const updateConfiguration = (newConfig) => {
    const {labels} = newConfig
    setHasConfig(labels.length > 0)
    setConfiguration({type: "UPDATE_CONFIGURATION", payload: newConfig})
  }

  const showLab = ()=> {
    const { configuration } = settings;
    const hasLabels = configuration.labels.length > 0;
    setShowLabel(hasLabels)
    if(hasLabels) {
      window.localStorage.__REACT_WORKSPACE_CONFIGURATION =
      JSON.stringify(settings)
    }
  }

  return (
    <Box display="flex"  justifyContent="center" minHeight="100vh" marginTop={"5rem"}>
        <Box>
            <Box  paddingBottom="0px">
                <Tabs sx={{ borderBottom: 1, borderColor: 'divider' }} value={currentTab} onChange={(e, newTab) => setTab(newTab)}>
                <Tab icon={<CategoryIcon />} label="Task Info" value="datatype" />
                <Tab disabled={!settings.dataTask} icon={<BuildIcon />} label="Configure" value="configure" />
                </Tabs>
            </Box>
            {currentTab === "datatype" && (
                <Box display="flex" flexWrap="wrap" justifyContent="initial" gap={2}>
                {dataTypes.map(dataType => (
                    <StyledCard key={dataType.name} 
                        selected={dataType.name === settings.dataTask}
                        onClick={() =>{
                          setConfiguration({type: "SET_DATATYPE", payload: dataType.name});
                          setTab("configure")
                        }
                        
                    }>
                    <StyledCardContent>
                        <IconWrapper icon={dataType.icon} />
                        <Typography variant="body2" color="textSecondary">
                        {dataType.name}
                        </Typography>
                    </StyledCardContent>
                    </StyledCard>
                ))}
                </Box>
            )}

            {currentTab === "configure" && ( 
                <Container>
                  {settings.dataTask === "Image Classification" && (
                    <>
                      <ConfigureImageClassification config={settings.configuration} onChange={updateConfiguration} />
                      <Box display="flex"  justifyContent="center">
                        <Button variant="contained" disabled={!hasConfig} onClick={showLab} disableElevation>
                            Open Lab
                        </Button>
                      </Box>
                    </>
                  
                  )}
                  {settings.dataTask === "Image Segmentation" && (
                    <>
                      <ConfigureImageSegmentation config={settings.configuration} onChange={updateConfiguration} />
                      <Box display="flex"  justifyContent="center">
                        <Button variant="contained" disabled={!hasConfig} onClick={showLab} disableElevation>
                            Open Lab
                        </Button>
                      </Box>
                    </>
                  
                  )}
                </Container>
            )
            }
        </Box>
    </Box>
  );
}
SetupPage.propTypes = {
  settings:PropTypes.object,
  setConfiguration: PropTypes.func,
}
export default SetupPage;