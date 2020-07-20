import {
  Avatar,
  Button,
  Grid,
  Input,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Modal,
} from "@material-ui/core";
import { Done, DeleteForever, Clear } from "@material-ui/icons";
import * as React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";
import theme from "../../../types/theme";
import { User } from "../../../types/user";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

interface UserListProps {
  allUsers: User[];
  userAvatar: { [key: string]: string };
  deleteUser: (user: User) => void;
  handleOpenModal: (user: User) => void;
}

interface UserListState {
  filterInput: string;
  filteredNonProjUsers: User[];
  filteredProjUsers: User[];
  hovering: boolean;
  hoverUserID: string;
  showModal: boolean;
  userToEdit?: User;
}

class UserList extends React.Component<
  UserListProps & LocalizeContextProps,
  UserListState
> {
  constructor(props: UserListProps & LocalizeContextProps) {
    super(props);

    this.state = {
      filterInput: "",
      hovering: false,
      hoverUserID: "",
      filteredNonProjUsers: [],
      filteredProjUsers: [],
      showModal: false,
    };
  }
  componentWillReceiveProps() {
    this.handleChange(this.state.filterInput);
  }

  handleChange(event: string) {
    let filteredNonProjUsers: User[] = [];
    let filteredProjUsers: User[] = [];

    if (event.length >= 3) {
      filteredNonProjUsers = this.props.allUsers.filter((user) => {
        const name = user.name.toLowerCase();
        const username = user.username.toLowerCase();
        const email = user.email.toLowerCase();
        const filter = event.toLowerCase();

        return (
          name.includes(filter) ||
          username.includes(filter) ||
          email.includes(filter)
        );
      });
    }

    this.setState({
      filterInput: event,
      filteredNonProjUsers: filteredNonProjUsers,
    });
  }

  render() {
    return (
      <React.Fragment>
        <Grid item xs={12}>
          <Typography>
            <Translate id="projectSettings.invite.searchTitle" />
          </Typography>
          <Input
            type="text"
            onChange={(e) => this.handleChange(e.target.value)}
            placeholder="Search..."
          />

          <List>
            {this.state.filteredProjUsers.map((user) => (
              <ListItem
                key={user.id}
                onMouseEnter={() =>
                  this.setState({ hovering: true, hoverUserID: user.id })
                }
                onMouseLeave={() =>
                  this.setState({ hovering: false, hoverUserID: "" })
                }
              >
                <ListItemIcon>
                  <Done />
                </ListItemIcon>
                <Avatar
                  alt="User Avatar"
                  src={this.props.userAvatar[user.id]}
                  style={{ marginRight: theme.spacing(1) }}
                />
                <ListItemText primary={`${user.name} (${user.username})`} />
              </ListItem>
            ))}
            {this.state.filteredNonProjUsers.map((user) => (
              <ListItem
                key={user.id}
                onMouseEnter={() =>
                  this.setState({ hovering: true, hoverUserID: user.id })
                }
                onMouseLeave={() =>
                  this.setState({ hovering: false, hoverUserID: "" })
                }
              >
                <ListItemText primary={`${user.name} (${user.username})`} />
                {this.state.hovering && this.state.hoverUserID === user.id && (
                  <Button onClick={() => this.props.handleOpenModal(user)}>
                    <DeleteForever />
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withLocalize(UserList);
