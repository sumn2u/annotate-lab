// @flow

import { memo, ReactNode } from "react";
import SidebarBoxContainer from "../SidebarBoxContainer";
import { makeStyles } from "@mui/styles";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import RegionIcon from "@mui/icons-material/PictureInPicture";
import Grid from "@mui/material/Grid";
import ReorderIcon from "@mui/icons-material/SwapVert";
import PieChartIcon from "@mui/icons-material/PieChart";
import TrashIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import UnlockIcon from "@mui/icons-material/LockOpen";
import VisibleIcon from "@mui/icons-material/Visibility";
import VisibleOffIcon from "@mui/icons-material/VisibilityOff";
import styles from "./styles";
import classnames from "classnames";
import isEqual from "lodash/isEqual";
import { Region } from "../ImageCanvas/region-tools.tsx";

const theme = createTheme();
const useStyles = makeStyles(styles);

const HeaderSep = styled("div")(() => ({
  borderTop: `1px solid ${grey[200]}`,
  marginTop: 2,
  marginBottom: 2,
}));

interface ChipProps {
  color: string;
  text: string;
}

const Chip = ({ color, text }: ChipProps) => {
  const classes = useStyles();
  return (
    <span className={classes.chip}>
      <div className="color" style={{ backgroundColor: color }} />
      <div className="text">{text}</div>
    </span>
  );
};

interface RowLayoutProps {
  header: boolean;
  highlighted: boolean;
  order: ReactNode;
  classification: ReactNode;
  area: ReactNode;
  trash: ReactNode;
  lock: ReactNode;
  visible: ReactNode;
  onClick?: () => void;
}

const RowLayout = ({
  header,
  highlighted,
  order,
  classification,
  area,
  trash,
  lock,
  visible,
  onClick,
}: RowLayoutProps) => {
  const classes = useStyles();
  return (
    <div
      onClick={onClick}
      className={classnames(classes.row, { header, highlighted })}
    >
      <Grid container alignItems="center">
        <Grid item xs={2}>
          <div style={{ textAlign: "right", paddingRight: 10 }}>{order}</div>
        </Grid>
        <Grid item xs={5}>
          {classification}
        </Grid>
        <Grid item xs={2}>
          <div style={{ textAlign: "right", paddingRight: 6 }}>{area}</div>
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
    </div>
  );
};

const RowHeader = () => {
  return (
    <RowLayout
      header
      highlighted={false}
      order={<ReorderIcon className="icon" />}
      classification={<div style={{ paddingLeft: 10 }}>Class</div>}
      area={<PieChartIcon className="icon" />}
      trash={<TrashIcon className="icon" />}
      lock={<LockIcon className="icon" />}
      visible={<VisibleIcon className="icon" />}
    />
  );
};

const MemoRowHeader = memo(RowHeader);

interface RowProps {
  region: Region;
  highlighted?: boolean;
  onSelectRegion: (r: Region) => void;
  onDeleteRegion: (r: Region) => void;
  onChangeRegion: (r: Region) => void;
  visible?: boolean;
  locked?: boolean;
  color: string;
  cls?: string;
  index: number;
  rId: string | number;
}

const Row = ({
  region: r,
  highlighted,
  onSelectRegion,
  onDeleteRegion,
  onChangeRegion,
  color,
  cls,
  index,
}: RowProps) => {
  return (
    <RowLayout
      header={false}
      highlighted={highlighted || false}
      onClick={() => onSelectRegion(r)}
      order={`#${index + 1}`}
      classification={<Chip text={cls || ""} color={color || "#ddd"} />}
      area=""
      trash={<TrashIcon onClick={() => onDeleteRegion(r)} className="icon2" />}
      lock={
        r.locked ? (
          <LockIcon
            onClick={() => onChangeRegion({ ...r, locked: false })}
            className="icon2"
          />
        ) : (
          <UnlockIcon
            onClick={() => onChangeRegion({ ...r, locked: true })}
            className="icon2"
          />
        )
      }
      visible={
        r.visible || r.visible === undefined ? (
          <VisibleIcon
            onClick={() => onChangeRegion({ ...r, visible: false })}
            className="icon2"
          />
        ) : (
          <VisibleOffIcon
            onClick={() => onChangeRegion({ ...r, visible: true })}
            className="icon2"
          />
        )
      }
    />
  );
};

const MemoRow = memo(
  Row,
  (prevProps, nextProps) =>
    prevProps.highlighted === nextProps.highlighted &&
    prevProps.visible === nextProps.visible &&
    prevProps.locked === nextProps.locked &&
    prevProps.rId === nextProps.rId &&
    prevProps.index === nextProps.index &&
    prevProps.cls === nextProps.cls &&
    prevProps.color === nextProps.color
);

const emptyArr: Region[] = [];

interface RegionSelectorSidebarBoxProps {
  regions?: Region[];
  onDeleteRegion: (r: Region) => void;
  onChangeRegion: (r: Region) => void;
  onSelectRegion: (r: Region) => void;
}

export const RegionSelectorSidebarBox = ({
  regions = emptyArr,
  onDeleteRegion,
  onChangeRegion,
  onSelectRegion,
}: RegionSelectorSidebarBoxProps) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title="Regions"
        icon={<RegionIcon style={{ color: grey[700] }} />}
        expandedByDefault
      >
        <div className={classes.container}>
          <MemoRowHeader />
          <HeaderSep />
          {regions.map((r, i) => (
            <MemoRow
              key={r.id}
              rId={r.id}
              {...r}
              region={r}
              index={i}
              onSelectRegion={onSelectRegion}
              onDeleteRegion={onDeleteRegion}
              onChangeRegion={onChangeRegion}
            />
          ))}
        </div>
      </SidebarBoxContainer>
    </ThemeProvider>
  );
};

const mapUsedRegionProperties = (r: Region) => [
  r.id,
  r.color,
  r.locked,
  r.visible,
  r.highlighted,
];

export default memo(RegionSelectorSidebarBox, (prevProps, nextProps) =>
  isEqual(
    (prevProps.regions || emptyArr).map(mapUsedRegionProperties),
    (nextProps.regions || emptyArr).map(mapUsedRegionProperties)
  )
);
