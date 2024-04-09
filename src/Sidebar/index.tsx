// TODO: remove if unused
// // @flow
//
// import { styled } from "@mui/styles";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// import TaskDescription from "../TaskDescriptionSidebarBox";
// import RegionSelector from "../RegionSelectorSidebarBox";
// import History from "../HistorySidebarBox";
// import DebugBox from "../DebugSidebarBox";
// import TagsSidebarBox from "../TagsSidebarBox";
// import KeyframesSelector from "../KeyframesSelectorSidebarBox";
// import type { Region } from "../ImageCanvas/region-tools.tsx";
// import { Action } from "../MainLayout/types.ts";
//
// const theme = createTheme();
// const Container = styled("div")(() => ({}));
//
// type Image = {
//   name: string;
//   src: string;
//   cls?: string;
//   tags?: Array<string>;
//   thumbnailSrc?: string;
//   regions?: Array<Region>;
// };
//
// type Props = {
//   debug: boolean;
//   taskDescription: string;
//   images?: Array<Image>;
//   regions: Array<Region>;
//   history: Array<{ state: Object; name: string; time: Date }>;
//   currentVideoTime?: number;
//   labelImages?: boolean;
//   currentImage?: Image;
//   imageClsList?: Array<string>;
//   imageTagList?: Array<string>;
//
//   onChangeImage: (image: Image) => void;
//   onSelectRegion: (r: Region) => void;
//   onSelectImage: (i: Image) => void;
//   onChangeRegion: (r: Region) => void;
//   onDeleteRegion: (r: Region) => void;
//   onRestoreHistory: () => void;
//   onShortcutActionDispatched: (action: Action) => ValidityState;
//   onChangeVideoTime: (time: number) => void;
//   onDeleteKeyframe: (time: number) => void;
// };
//
// const emptyArr: Region[] = [];
//
// export const Sidebar = ({
//   debug,
//   taskDescription,
//   keyframes,
//   regions,
//   history,
//   labelImages,
//   currentImage,
//   currentVideoTime,
//   imageClsList,
//   imageTagList,
//   onChangeImage,
//   onSelectRegion,
//   onChangeRegion,
//   onDeleteRegion,
//   onRestoreHistory,
//   onChangeVideoTime,
//   onDeleteKeyframe,
// }: Props) => {
//   if (!regions) regions = emptyArr;
//   console.log(currentImage);
//   console.info("SIDEBAR");
//   return (
//     <ThemeProvider theme={theme}>
//       <Container>
//         {debug && <DebugBox state={debug} lastAction={debug.lastAction} />}
//         {taskDescription && (taskDescription || "").length > 1 && (
//           <TaskDescription description={taskDescription} />
//         )}
//         {labelImages && (
//           <TagsSidebarBox
//             currentImage={currentImage}
//             imageClsList={imageClsList}
//             imageTagList={imageTagList}
//             onChangeImage={onChangeImage}
//             expandedByDefault
//           />
//         )}
//         <RegionSelector
//           regions={regions}
//           onSelectRegion={onSelectRegion}
//           onChangeRegion={onChangeRegion}
//           onDeleteRegion={onDeleteRegion}
//         />
//         {keyframes && (
//           <KeyframesSelector
//             currentVideoTime={currentVideoTime}
//             keyframes={keyframes}
//             onChangeVideoTime={onChangeVideoTime}
//             onDeleteKeyframe={onDeleteKeyframe}
//           />
//         )}
//         <History
//           history={history}
//           onRestoreHistory={() => onRestoreHistory()}
//         />
//         {/* <Shortcuts onShortcutActionDispatched={onShortcutActionDispatched} /> */}
//       </Container>
//     </ThemeProvider>
//   );
// };
//
// export default Sidebar;
