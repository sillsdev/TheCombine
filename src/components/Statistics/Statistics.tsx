import {
  Avatar,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  TextField,
  Typography,
  ListItem,
  List,
} from "@material-ui/core";
import React, { ReactElement, useState, useEffect } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { getCurrentUser } from "backend/localStorage";
import { User } from "api/models";
import { newUser } from "types/user";
import { render } from "@testing-library/react";
import * as LocalStorage from "backend/localStorage";
import {
  getAllProjects,
  getAllSemanticDomainTreeNode,
  getAllStatisticsPair,
  getAllWords,
  getFrontierWords,
  getProjectName,
  getSemanticDomainFull,
  getSemanticDomainTreeNode,
  getSemanticDomainTreeNodeByName,
} from "backend";
import { Project } from "api/models";
import theme from "types/theme";
import { SemanticDomain } from "api/models";
import { defaultWritingSystem, newWritingSystem } from "types/writingSystem";

export default function Statistics(): ReactElement {
  const [user, setUser] = useState(LocalStorage.getCurrentUser());
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState<string>();
  const [semanticDomain, setSemanticDomain] = useState<SemanticDomain[]>();
  const [lang, setLang] = useState<string>(defaultWritingSystem.bcp47);

  useEffect(() => {
    updateProjectList();
    updateCurrentProjectId();
    console.log(getAllSemanticDomainTreeNode());
    console.log(getAllProjects());
    console.log(getAllWords());
    console.log(getAllStatisticsPair("63c84f7fb3617471c12b36bf", "en"));
  }, [setAllProjects]);

  async function updateCurrentProjectId() {
    setCurrentProjectName(await getProjectName(LocalStorage.getProjectId()));
  }
  async function updateProjectList() {
    await getAllProjects().then(setAllProjects);
  }

  function getListItems(projects: Project[]) {
    return projects.map((project) => (
      <ListItem key={project.id}>
        <Typography variant="h6" style={{ marginRight: theme.spacing(1) }}>
          {project.name}
        </Typography>
      </ListItem>
    ));
  }

  return (
    <React.Fragment>
      <Grid container justifyContent="center">
        <Card style={{ width: 450 }}>
          <h1>{user?.username}</h1>
          <List>{getListItems(allProjects)}</List>
          <h1>currentProject:</h1>
          <List>{currentProjectName}</List>
        </Card>
      </Grid>
    </React.Fragment>
  );
}
