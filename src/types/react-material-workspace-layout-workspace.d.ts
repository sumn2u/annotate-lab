declare module "react-material-workspace-layout/Workspace" {
  import { ComponentType, ReactElement } from "react";

  export interface WorkspaceProps {
    allowFullscreen?: boolean;
    hideHeader?: boolean;
    hideHeaderText?: boolean;
    headerItems?: Array<{ name: string }>;
    iconDictionary: Record<string, () => ReactElement>;
    headerLeftSide: Array<ReactElement>;
    rightSidebarItems: Array<() => ReactElement>;
    onClickHeaderItem: (name: string) => void;
    onClickIconSidebarItem: (name: string) => void;
    selectedTools: Array<string>;
    iconSidebarItems: Array<{
      name: string;
      helperText: string;
      alwaysShowing?: boolean;
    }>;
  }

  const Workspace: ComponentType<WorkspaceProps>;
  export default Workspace;
}
