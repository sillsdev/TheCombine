import React from "react";
import { RouteComponentProps } from "react-router-dom";
import * as Backend from "../../backend";
import Register from "../Login/RegisterPage/RegisterComponent";

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
  var token = getLastURLParam(pathname);
  pathname = removeLastURLParam(pathname);
  var projectId = getLastURLParam(pathname);

  Backend.validateLink(projectId, token).then(() => {
    console.log("hi");
  });

  return (
    <div>
      <p>
        If the project was added successfully, you will need to log out and log
        back in to see it.
      </p>
      <p>
        <a href="http://localhost:3000">TheCombine</a>
      </p>
      <Register></Register>
    </div>
  );
}
