import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { RouteComponentProps } from "react-router-dom";

import * as Backend from "backend";
import history, { Path } from "browserHistory";
import Register from "components/Login/RegisterPage/RegisterComponent";

export interface ProjectInviteDispatchProps {
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

class ProjectInvite extends React.Component<
  ProjectInviteDispatchProps &
    ProjectInviteStateProps &
    LocalizeContextProps &
    RouteComponentProps,
  ProjectInviteState
> {
  constructor(
    props: ProjectInviteDispatchProps &
      ProjectInviteStateProps &
      LocalizeContextProps &
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
    var index = pathname.lastIndexOf("/");
    return pathname.substring(index + 1);
  }
  removeLastURLParam(pathname: string): string {
    var index = pathname.lastIndexOf("/");
    return pathname.substr(0, index);
  }

  async validateLink() {
    var pathname = this.props.location.pathname;
    var token = this.getLastURLParam(pathname);
    pathname = this.removeLastURLParam(pathname);
    var projectId = this.getLastURLParam(pathname);

    var status = await Backend.validateLink(projectId, token);

    if (status[0] /* Link is valid */) {
      this.setState({
        isValidLink: true,
      });
    }
    if (status[1] /* User is already registered */) {
      this.setState({
        isAlreadyUser: true,
      });
    }
    if (status[0] && status[1]) {
      history.push(Path.Login);
    }
  }

  render() {
    var text = (
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

export default withLocalize(ProjectInvite);
