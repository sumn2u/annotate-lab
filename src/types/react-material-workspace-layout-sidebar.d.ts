declare module "src/types/react-material-workspace-layout/SidebarBox" {
  export interface SidebarBoxProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    noScroll?: boolean;
    expandedByDefault?: boolean;
  }

  const SidebarBox: React.ComponentType<SidebarBoxProps>
  export default SidebarBox
}
