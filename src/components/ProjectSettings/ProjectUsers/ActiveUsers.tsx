import {
  Avatar,
  FormControl,
  IconButton,
  IconButtonProps,
  InputLabel,
  List,
  ListItem,
  ListItemProps,
  ListItemText,
  MenuItem,
  Select,
} from "@material-ui/core";
import DeleteDialog from "components/Buttons/DeleteDialog";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { toast } from "react-toastify";
//styles the ToastContainer so that it appears on the upper right corner with the message.
import "react-toastify/dist/ReactToastify.min.css";
import { Translate } from "react-localize-redux";
import React from "react";

import { Permission, Project, User } from "api/models";
import {
  avatarSrc,
  getAllUsersInCurrentProject,
  removeUserRole,
} from "backend";
import theme from "types/theme";

enum UserOrder {
  Username,
  Name,
}

interface UserProps {
  project: Project;
}

interface UserState {
  projUsers: User[];
  userAvatar: { [key: string]: string };
  userOrder: UserOrder;
  dialogOpen: boolean;
}

export default class ActiveUsers extends React.Component<UserProps, UserState> {
  constructor(props: UserProps) {
    super(props);
    this.state = {
      projUsers: [],
      userAvatar: {},
      userOrder: UserOrder.Username,
      dialogOpen: false,
    };
  }

  componentDidMount() {
    this.populateUsers();
  }

  componentDidUpdate(prevProps: UserProps) {
    if (this.props.project.name !== prevProps.project.name) {
      this.populateUsers();
    }
  }

  // TODO: Add the correct text for toast
  private removeUser() {
    removeUserRole(
      [Permission.DeleteEditSettingsAndUsers],
      (arguments[0] as unknown) as string
    )
      .then(this.handleClose.bind(this))
      .then(() => {
        toast(<Translate id="projectSettings.invite.toastSuccess" />);
      })
      .catch((err: string) => {
        console.log(err);
        toast(<Translate id="projectSettings.invite.toastFail" />);
      });
  }

  private populateUsers() {
    console.log("populated users");
    getAllUsersInCurrentProject()
      .then(async (projUsers) => {
        this.setState({ projUsers });
        const userAvatar = this.state.userAvatar;
        const promises = projUsers.map(async (u) => {
          if (u.hasAvatar) {
            userAvatar[u.id] = await avatarSrc(u.id);
          }
        });
        await Promise.all(promises);
        this.setState({ userAvatar });
      })
      .catch((err) => console.error(err));
  }

  private getSortedUsers() {
    const users = this.state.projUsers;

    // Need to make a copy of the "projUser" field in the state because sort()
    // mutates
    return users.slice(0).sort((a: User, b: User) => {
      switch (this.state.userOrder) {
        case UserOrder.Name:
          return a.name.localeCompare(b.name);
        case UserOrder.Username:
          return a.username.localeCompare(b.username);
        default:
          throw new Error();
      }
    });
  }

  private handleOpen() {
    this.setState({ dialogOpen: true });
  }

  private handleClose() {
    this.setState({ dialogOpen: false });
  }

  render() {
    var userList: React.ReactElement<ListItemProps>[] = [];
    var removeUser: React.ReactElement<IconButtonProps>;
    const currentUser = localStorage.getItem("user");
    const currentProjectId = localStorage.getItem("projectId");
    const sortedUserList = this.getSortedUsers();

    for (var i = 0; i < sortedUserList.length; i++) {
      var user = sortedUserList[i];
      if (
        currentUser &&
        JSON.parse(currentUser).isAdmin &&
        currentProjectId &&
        user.id !== JSON.parse(currentUser).id &&
        !user.isAdmin
      ) {
        removeUser = (
          <div>
            <IconButton onClick={this.handleOpen.bind(this)}>
              <DeleteForeverIcon />
            </IconButton>
            <DeleteDialog
              open={this.state.dialogOpen}
              // TODO: Add the correct text
              textId={"reviewEntries.deleteWordWarning"}
              handleCancel={this.handleClose.bind(this)}
              handleAccept={this.removeUser.bind(this, [user.id])}
            />
          </div>
        );
      } else {
        removeUser = (
          <IconButton disabled>
            <DeleteForeverIcon />
          </IconButton>
        );
      }
      userList.push(
        <ListItem key={user.id}>
          <Avatar
            alt="User Avatar"
            src={this.state.userAvatar[user.id]}
            style={{ marginRight: theme.spacing(1) }}
          />
          <ListItemText primary={`${user.name} (${user.username})`} />
          {removeUser}
        </ListItem>
      );
    }

    return (
      <React.Fragment>
        <FormControl style={{ minWidth: 100 }}>
          <InputLabel id="sorting-order-select">
            <Translate id="charInventory.sortBy" />
          </InputLabel>
          <Select
            labelId="sorting-order-select"
            defaultValue={UserOrder.Username}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
              this.setState({
                userOrder: event.target.value as UserOrder,
              });
            }}
          >
            <MenuItem value={UserOrder.Name}>
              <Translate id="projectSettings.language.name" />
            </MenuItem>
            <MenuItem value={UserOrder.Username}>
              <Translate id="login.username" />
            </MenuItem>
          </Select>
        </FormControl>
        <List>{userList}</List>
      </React.Fragment>
    );
  }
}
