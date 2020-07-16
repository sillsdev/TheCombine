import React from "react";
import { RouteComponentProps } from "react-router-dom";
import * as Backend from "../../backend";
import AppBarComponent from "../AppBar/AppBarComponent";

function getLastURLParam(pathname: string): string {
  var index = pathname.lastIndexOf("/");
  return pathname.substring(index + 1);
}
function removeLastURLParam(pathname: string): string {
  var index = pathname.lastIndexOf("/");
  return pathname.substr(0, index);
}

export default function ProjectInvite(props: RouteComponentProps) {
  var pathname = props.location.pathname;
  var emailAddress = getLastURLParam(pathname);
  pathname = removeLastURLParam(pathname);
  var token = getLastURLParam(pathname);
  pathname = removeLastURLParam(pathname);
  var projectId = getLastURLParam(pathname);

  Backend.validateLink(projectId, emailAddress, token).then(() => {
    console.log("hi");
  });
  Backend.getProject(projectId);

  return (
    <div>
      You have been added successfully! You may have to log out and log in to
      see it. <a href="http://localhost:3000">Link</a>
    </div>
  );
}
