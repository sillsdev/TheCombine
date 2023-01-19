import { Card, Grid, Typography, ListItem, List } from "@material-ui/core";
import React, { ReactElement, useState, useEffect } from "react";

import {
  Project,
  SemanticDomain,
  SemanticDomainTreeNode,
  SemanticDomainTreeNodeInt32KeyValuePair,
} from "api/models";
import {
  getAllProjects,
  getAllSemanticDomainTreeNode,
  getAllStatisticsPair,
  getAllWords,
  getProject,
  getProjectName,
} from "backend";
import * as LocalStorage from "backend/localStorage";
import theme from "types/theme";
import { defaultWritingSystem } from "types/writingSystem";
import StatisticsTable from "./StatisticsTable";
import { getPanelId } from "@material-ui/lab";

// interface temp {
//   domain: SemanticDomainTreeNode;
//   number: number;
// }

export default function Statistics(): ReactElement {
  const [user, setUser] = useState(LocalStorage.getCurrentUser());
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project>();
  const [lang, setLang] = useState<string>(defaultWritingSystem.bcp47);
  const [statisticsList, setStatisticsList] = useState<
    SemanticDomainTreeNodeInt32KeyValuePair[]
  >([]);

  useEffect(() => {
    updateProjectList();
    updateCurrentProject();
    updateStatisticsList();
  }, []);

  console.log(getAllSemanticDomainTreeNode());
  console.log(getAllProjects());
  console.log(getAllWords());
  console.log(currentProject?.id);
  console.log(statisticsList);

  async function updateCurrentProject() {
    setCurrentProject(await getProject(LocalStorage.getProjectId()));
  }
  async function updateProjectList() {
    await getAllProjects().then(setAllProjects);
  }

  async function updateStatisticsList() {
    getAllStatisticsPair(await LocalStorage.getProjectId(), lang).then(
      setStatisticsList
    );
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

  function getStatisticsList(
    statisticsList: SemanticDomainTreeNodeInt32KeyValuePair[]
  ) {
    console.log(statisticsList.length);
    return statisticsList.map((t) => (
      <ListItem style={{ minWidth: "600px" }} key={`${t.key?.id}`}>
        <Typography
          variant="h6"
          style={{ marginRight: theme.spacing(1) }}
        ></Typography>
        <StatisticsTable
          key={`${t.key?.id}`}
          domain={t.key!}
          statistics={t.value!}
        />
      </ListItem>
    ));
  }

  return (
    <React.Fragment>
      <Grid container justifyContent="center">
        <Card style={{ width: 800 }}>
          <h1>{user?.username} Project List: </h1>
          <List>{getListItems(allProjects)}</List>
          <List>
            <h1>Statistics: {currentProject?.name}</h1>
          </List>
          <List>{getStatisticsList(statisticsList)}</List>
        </Card>
      </Grid>
    </React.Fragment>
  );
}
