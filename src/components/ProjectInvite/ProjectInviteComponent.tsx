import React from "react";
import { RouteComponentProps } from "react-router-dom";

import * as backend from "backend";
import history, { Path } from "browserHistory";
import Register from "components/Login/RegisterPage/RegisterComponent";

interface ProjectInviteDispatchProps {
  register?: (
    name: string,
    user: string,
    email: string,
    password: string
  ) => void;
  reset: () => void;
}

export interface ProjectInviteStateProps {
  inProgress: boolean;
  success: boolean;
  failureMessage: string;
}

interface ProjectInviteState {
  isValidLink: boolean;
  isAlreadyUser: boolean;
}

export default class ProjectInvite extends React.Component<
  ProjectInviteDispatchProps & ProjectInviteStateProps & RouteComponentProps,
  ProjectInviteState
> {
  constructor(
    props: ProjectInviteDispatchProps &
      ProjectInviteStateProps &
      RouteComponentProps
  ) {
    super(props);
    this.state = {
      isAlreadyUser: false,
      isValidLink: false,
    };
    this.validateLink();
    this.validateLink = this.validateLink.bind(this);
  }

  getLastURLParam(pathname: string): string {
    const index = pathname.lastIndexOf("/");
    return pathname.substring(index + 1);
  }
  removeLastURLParam(pathname: string): string {
    const index = pathname.lastIndexOf("/");
    return pathname.substr(0, index);
  }

  async validateLink() {
    let pathname = this.props.location.pathname;

    // TODO: Use regex to more cleanly parse this.
    // Parse URL of the form /invite/{projectId}/{token}
    const token = this.getLastURLParam(pathname);
    pathname = this.removeLastURLParam(pathname);
    const projectId = this.getLastURLParam(pathname);

    const status = await backend.validateLink(projectId, token);
    if (status.isTokenValid) {
      this.setState({
        isValidLink: true,
      });
    }
    if (status.isUserRegistered) {
      this.setState({
        isAlreadyUser: true,
      });
    }
    if (status.isTokenValid && status.isUserRegistered) {
      history.push(Path.Login);
    }
  }

  render() {
    const text = (
      <Register
        inProgress={this.props.inProgress}
        success={this.props.success}
        failureMessage={this.props.failureMessage}
        register={this.props.register}
        reset={this.props.reset}
        returnToEmailInvite={this.validateLink}
      />
    );

    return (
      <div>
        {!this.state.isAlreadyUser && this.state.isValidLink ? text : ""}
      </div>
    );
  }
}
