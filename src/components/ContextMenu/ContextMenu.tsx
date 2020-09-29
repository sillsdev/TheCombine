import { Menu, MenuItem } from "@material-ui/core";
import React, { ReactElement } from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate,
} from "react-localize-redux";

export type MenuType = [string, () => void];

export interface ContextMenuProps {
  options: MenuType[];
  anchorName: string;
}
export interface ContextMenuState {
  isOpen: boolean;
}

const RIGHT_CLICK: string = "contextmenu";

export class ContextMenu extends React.Component<
  ContextMenuProps & LocalizeContextProps,
  ContextMenuState
> {
  anchor: Element | null;

  constructor(props: ContextMenuProps & LocalizeContextProps) {
    super(props);
    this.state = { isOpen: false };
    this.anchor = null;

    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.mapItems = this.mapItems.bind(this);
  }

  componentDidMount() {
    this.anchor = document
      .getElementsByClassName(this.props.anchorName)
      .item(0);
    if (this.anchor) this.anchor.addEventListener(RIGHT_CLICK, this.openMenu);
  }
  componentWillUnmount() {
    if (this.anchor) this.anchor.addEventListener(RIGHT_CLICK, this.openMenu);
  }

  openMenu(event: Event | React.MouseEvent) {
    if (event.currentTarget === this.anchor) {
      event.preventDefault();
      event.stopPropagation();
      this.setState({ isOpen: true });
    }
  }

  closeMenu(event?: React.MouseEvent): void {
    this.setState({ isOpen: false });
    if (event !== undefined) event.stopPropagation();
  }

  mapItems(item: MenuType, index: number): ReactElement {
    return (
      <MenuItem
        key={index}
        onClick={(e: React.MouseEvent) => {
          this.closeMenu(e);
          item[1]();
        }}
      >
        <Translate id={item[0]} />
      </MenuItem>
    );
  }

  render() {
    return (
      <Menu
        className={this.props.anchorName + "_menu"}
        anchorEl={this.anchor}
        open={this.state.isOpen}
        onClose={this.closeMenu as any}
        onContextMenu={this.openMenu}
      >
        {this.props.options.map(this.mapItems)}
      </Menu>
    );
  }
}

export default withLocalize(ContextMenu);
