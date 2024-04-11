import { useEffect } from "react";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import * as muiColors from "@mui/material/colors";
import SidebarBoxContainer from "../SidebarBoxContainer";
import colors from "../colors";
import BallotIcon from "@mui/icons-material/Ballot";
import capitalize from "lodash/capitalize";
import classnames from "classnames";

const theme = createTheme();
const LabelContainer = styled("div")(() => ({
  display: "flex",
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 16,
  paddingRight: 16,
  alignItems: "center",
  cursor: "pointer",
  opacity: 0.7,
  backgroundColor: "#fff",
  "&:hover": {
    opacity: 1,
  },
  "&.selected": {
    opacity: 1,
    fontWeight: "bold",
  },
}));
const Circle = styled("div")(() => ({
  width: 12,
  height: 12,
  borderRadius: 12,
  marginRight: 8,
}));
const Label = styled("div")(() => ({
  fontSize: 11,
}));
const DashSep = styled("div")(() => ({
  flexGrow: 1,
  borderBottom: `2px dotted ${muiColors.grey[300]}`,
  marginLeft: 8,
  marginRight: 8,
}));
const Number = styled("div")(() => ({
  fontSize: 11,
  textAlign: "center",
  minWidth: 14,
  paddingTop: 2,
  paddingBottom: 2,
  fontWeight: "bold",
  color: muiColors.grey[700],
}));

interface ClassSelectionMenuProps {
  selectedCls?: string;
  regionClsList: string[];
  onSelectCls: (label?: string) => void;
}

export const ClassSelectionMenu = ({
  selectedCls,
  regionClsList,
  onSelectCls,
}: ClassSelectionMenuProps) => {
  useEffect(() => {
    const keyMapping: Record<string, (label?: string) => void> = {};
    for (let i = 0; i < 9 && i < regionClsList.length; i++) {
      keyMapping[i + 1] = () => onSelectCls(regionClsList[i]);
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (keyMapping[e.key]) {
        keyMapping[e.key]();
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [regionClsList, selectedCls]);

  return (
    <ThemeProvider theme={theme}>
      <SidebarBoxContainer
        title="Classifications"
        icon={<BallotIcon style={{ color: muiColors.grey[700] }} />}
        expandedByDefault
      >
        {regionClsList.map((label, index) => (
          <LabelContainer
            className={classnames({ selected: label === selectedCls })}
            onClick={() => onSelectCls(label)}
          >
            <Circle
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <Label className={classnames({ selected: label === selectedCls })}>
              {capitalize(label)}
            </Label>
            <DashSep />
            <Number className={classnames({ selected: label === selectedCls })}>
              {index < 9 ? `Key [${index + 1}]` : ""}
            </Number>
          </LabelContainer>
        ))}
        <Box pb={2} />
      </SidebarBoxContainer>
    </ThemeProvider>
  );
};

export default ClassSelectionMenu;
