import { Button, List, ListItem, Typography } from "@material-ui/core";
import * as React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { User } from "../../../types/user";

interface UserListProps {
  allUsers: User[];
  projUsers: User[];
}

interface UserListState {
  filtered: User[];
  hovering: boolean;
  hoverUserID: string;
}

class UserList extends React.Component<
  UserListProps & LocalizeContextProps,
  UserListState
> {
  constructor(props: UserListProps & LocalizeContextProps) {
    super(props);
    this.state = {
      filtered: [],
      hovering: false,
      hoverUserID: "",
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      filtered: this.props.allUsers,
    });
  }

  componentWillReceiveProps(nextProps: UserListProps) {
    this.setState({
      filtered: nextProps.allUsers,
    });
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Variable to hold the original version of the list
    let currentList = [];
    // Variable to hold the filtered list before putting into state
    let newList = [];

    // If the search bar isn't empty
    if (event.target.value !== "") {
      // Assign the original list to currentList
      currentList = this.props.allUsers;

      // Use .filter() to determine which items should be displayed
      // based on the search terms
      newList = currentList.filter((item) => {
        const name = item.name.toLowerCase();
        const username = item.username.toLowerCase();
        const email = item.email.toLowerCase();
        // change search term to lowercase
        const filter = event.target.value.toLowerCase();
        // check to see if the current list item includes the search term
        // If it does, it will be added to newList. Using lowercase eliminates
        // issues with capitalization in search terms and search content
        return (
          name.includes(filter) ||
          username.includes(filter) ||
          email.includes(filter)
        );
      });
    } else {
      // If the search bar is empty, set newList to original task list
      newList = this.props.allUsers;
    }
    // Set the filtered state based on what our rules added to newList
    this.setState({
      filtered: newList,
    });
  }

  render() {
    return (
      <div>
        <input
          type="text"
          className="input"
          onChange={this.handleChange}
          placeholder="Search..."
        />
        {/* List of projects */}
        <List>
          {this.state.filtered.map((user) => (
            <ListItem
              key={user.id}
              button
              onMouseEnter={() =>
                this.setState({ hovering: true, hoverUserID: user.id })
              }
              onMouseLeave={() =>
                this.setState({ hovering: false, hoverUserID: "" })
              }
            >
              <Typography variant="h6">{`${user.name} (${user.username})`}</Typography>
              {this.state.hovering && this.state.hoverUserID === user.id && (
                <Button>Add</Button>
              )}
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}

export default withLocalize(UserList);
