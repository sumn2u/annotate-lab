// @flow

import React, {memo} from "react"
import SidebarBoxContainer from "../SidebarBoxContainer"
import {createTheme, styled, ThemeProvider} from "@mui/material/styles"
import {grey} from "@mui/material/colors"
import RegionIcon from "@mui/icons-material/PictureInPicture"
import Grid from "@mui/material/Grid"
import ReorderIcon from "@mui/icons-material/SwapVert"
import PieChartIcon from "@mui/icons-material/PieChart"
import TrashIcon from "@mui/icons-material/Delete"
import LockIcon from "@mui/icons-material/Lock"
import UnlockIcon from "@mui/icons-material/LockOpen"
import VisibleIcon from "@mui/icons-material/Visibility"
import VisibleOffIcon from "@mui/icons-material/VisibilityOff"
import styles from "./styles"
import classnames from "classnames"
import isEqual from "lodash/isEqual"
import {useTranslation} from "react-i18next";
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import Tooltip from "@mui/material/Tooltip";

const theme = createTheme()

const ChipSpan = styled('span')(() => styles.chip)
const RowDiv = styled('div')(() => styles.row)
const ContainerDiv = styled('div')(() => styles.container)
const HeaderSep = styled("div")(({theme}) => ({
  borderTop: `1px solid ${grey[200]}`,
  marginTop: 2,
  marginBottom: 2,
}))

const Chip = ({color, text}) => {
  return (
    <ChipSpan>
      <div className="color" style={{backgroundColor: color}} />
      <div className="text">{text}</div>
    </ChipSpan>
  )
}

const RowLayout = ({
  header,
  highlighted,
  order,
  name,
  minimize,
  tags,
  trash,
  lock,
  visible,
  onClick,
}) => {
  return (
    <RowDiv
      onClick={onClick}
      className={classnames({header, highlighted})}
    >
      <Grid container alignItems="center">
        <Grid item xs={2}>
          <div style={{textAlign: "right", paddingRight: 10}}>{order}</div>
        </Grid>
        <Grid item xs={5}>
          {name}
        </Grid>
        <Grid item xs={2}>
          <div style={{textAlign: "right", paddingRight: 6}}>{minimize}</div>
        </Grid>
        <Grid item xs={1}>
          {trash}
        </Grid>
        <Grid item xs={1}>
          {lock}
        </Grid>
        <Grid item xs={1}>
          {visible}
        </Grid>
      </Grid>
    </RowDiv>
  )
}

const RowHeader = ({ regions, onChangeRegion, onDeleteRegion }) => {
  const visible = regions.find(r => r.visible === false) == null;
  const locked = regions.find(r => r.locked === false) == null;
  const {t} = useTranslation();
  return (
    <RowLayout
      header
      highlighted={false}
      order={<ReorderIcon className="icon" />}
      name={<div style={{paddingLeft: 10}}>{t("desc.class")}</div>}
      area={<PieChartIcon className="icon" />}
      trash={
        <Tooltip title={t("delete_regions")}>
          <TrashIcon className="icon"  
            onClick={() => {
                regions.forEach(r => {
                  onDeleteRegion(r);
                });
            }} 
            data-testid="DeleteIcon-header"
          />
        </Tooltip>
        }
      lock={
        locked === true ? (
          <Tooltip title={t("lock_regions")}>
            <LockIcon
              onClick={() => {
                regions.forEach(r => {
                  onChangeRegion({ ...r, locked: false });
                });
              }}
              className="icon"
              data-testid="LockIcon-header"
            />
          </Tooltip>
        ) : (
          <Tooltip title={t("unlock_regions")}>
            <UnlockIcon
              onClick={() => {
                regions.forEach(r => {
                  onChangeRegion({ ...r, locked: true });
                });
              }}
              className="icon"
              data-testid="UnlockIcon-header"
            />
          </Tooltip>
        )    
      }
      visible={
          visible ? (
            <Tooltip title={t("show_regions")}>
              <VisibleIcon
                onClick={() => {
                  regions.forEach(r => {
                    onChangeRegion({ ...r, visible: false });
                  });
                }}
                className="icon"
                data-testid="VisibleIcon-header"
              />
            </Tooltip>
          ) : (
            <Tooltip title={t("hide_regions")}>
              <VisibleOffIcon
                onClick={() => {
                  regions.forEach(r => {
                    onChangeRegion({ ...r, visible: true });
                  });
                }}
                className="icon"
                data-testid="InvisibleIcon-header"
              />
            </Tooltip>
          )
      }
    />
  )
}

const MemoRowHeader = memo(RowHeader)

const Row = ({
  region: r,
  highlighted,
  onSelectRegion,
  onDeleteRegion,
  onChangeRegion,
  visible,
  locked,
  color,
  cls,
  name,
  index,
}) => {
  const {t} = useTranslation();
  return (
    <RowLayout
      header={false}
      highlighted={highlighted}
      onClick={() => onSelectRegion(r)}
      order={`#${index + 1}`}
      name={<Chip text={name || cls || ""} color={color || "#ddd"} />}
      minimize={
        r.minimized ? (
          <Tooltip title={t("expand_selection")}>
            <OpenInFullIcon
              onClick={() => onChangeRegion({...r, minimized: false})}
              className="icon2"
              data-testid={`OpenInFullIcon-${r.id}`}
            />
          </Tooltip>
        ) : (
          <Tooltip title={t("collapse_selection")}>
            <CloseFullscreenIcon
              onClick={() => onChangeRegion({...r, minimized: true})}
              className="icon2"
              data-testid={`CloseFullscreenIcon-${r.id}`}
            />
          </Tooltip>
        )
      }
      trash={<Tooltip title={t("delete_region")}><TrashIcon onClick={() => onDeleteRegion(r)} className="icon2" data-testid={`DeleteIcon-${r.id}`} /> </Tooltip>}
      lock={
        r.locked ? (
          <Tooltip title={t("lock_region")}>
            <LockIcon
              onClick={() => onChangeRegion({...r, locked: false})}
              className="icon2"
              data-testid={`LockIcon-${r.id}`}
            />
          </Tooltip>
        ) : (
          <Tooltip title={t("unlock_region")}>
            <UnlockIcon
              onClick={() => onChangeRegion({...r, locked: true})}
              className="icon2"
              data-testid={`UnlockIcon-${r.id}`}
            />
          </Tooltip>
        )
      }
      visible={
        r.visible || r.visible === undefined ? (
          <Tooltip title={t("show_region")}>
            <VisibleIcon
              onClick={() => onChangeRegion({...r, visible: false})}
              className="icon2"
              data-testid={`VisibleIcon-${r.id}`}
            />
          </Tooltip>
        ) : (
          <Tooltip title={t("hide_region")}>
            <VisibleOffIcon
              onClick={() => onChangeRegion({...r, visible: true})}
              className="icon2"
              data-testid={`InvisibleIcon-${r.id}`}
            />
          </Tooltip>
        )
      }
    />
  )
}

const MemoRow = memo(
  Row,
  (prevProps, nextProps) =>
    prevProps.highlighted === nextProps.highlighted &&
    prevProps.visible === nextProps.visible &&
    prevProps.locked === nextProps.locked &&
    prevProps.minimized === nextProps.minimized &&
    prevProps.id === nextProps.id &&
    prevProps.index === nextProps.index &&
    prevProps.cls === nextProps.cls &&
    prevProps.name === nextProps.name &&
    prevProps.color === nextProps.color &&
    prevProps.points === nextProps.points
)

const emptyArr = []

export const RegionSelectorSidebarBox = ({
  regions = emptyArr,
  onDeleteRegion,
  onChangeRegion,
  onSelectRegion,
}) => {

  const {t} = useTranslation();

  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title={t("menu.regions")}
        subTitle=""
        icon={<RegionIcon style={{color: grey[700]}} />}
        expandedByDefault
        noScroll={true}
      >
        <ContainerDiv>
        <MemoRowHeader 
            regions={regions}
            onChangeRegion={onChangeRegion}
            onDeleteRegion={onDeleteRegion}
          />
          <HeaderSep />
          {regions.map((r, i) => (
            <MemoRow
              key={r.id}
              {...r}
              region={r}
              index={i}
              onSelectRegion={onSelectRegion}
              onDeleteRegion={onDeleteRegion}
              onChangeRegion={onChangeRegion}
            />
          ))}
        </ContainerDiv>
      </SidebarBoxContainer>
    </ThemeProvider>
  )
}

const mapUsedRegionProperties = (r) => [
  r.id,
  r.color,
  r.locked,
  r.visible,
  r.minimized,
  r.name,
  r.highlighted,
  r.points
]

export default memo(RegionSelectorSidebarBox, (prevProps, nextProps) =>
  isEqual(
    (prevProps.regions || emptyArr).map(mapUsedRegionProperties),
    (nextProps.regions || emptyArr).map(mapUsedRegionProperties)
  )
)
