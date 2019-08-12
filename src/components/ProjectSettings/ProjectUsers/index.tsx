import ProjectUsers from "./ProjectUsers";
import { StoreState } from "../../../types";
import { connect } from "react-redux";

import { Dispatch } from "redux";
import { ProjectAction, setCurrentProject } from "../../Project/ProjectActions";
import { Project } from "../../../types/project";

export default connect(
  null,
  null
)(ProjectUsers);
