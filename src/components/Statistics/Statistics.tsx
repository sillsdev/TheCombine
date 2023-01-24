import { Card, Grid, Typography, ListItem, List } from "@material-ui/core";
import React, { ReactElement, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import StatisticsTable from "./StatisticsTable";
import { Project, SemanticDomainTreeNodeInt32KeyValuePair } from "api/models";
import { getProject, getSemanticDomainCounts } from "backend";
import * as LocalStorage from "backend/localStorage";
import { defaultWritingSystem } from "types/writingSystem";

export default function Statistics(): ReactElement {
  const [currentProject, setCurrentProject] = useState<Project>();
  const [lang, setLang] = useState<string>(defaultWritingSystem.bcp47);
  const [statisticsList, setStatisticsList] = useState<
    SemanticDomainTreeNodeInt32KeyValuePair[]
  >([]);
  const { t } = useTranslation();

  useEffect(() => {
    updateCurrentProject();
    const updateStatisticList = async () => {
      const pair = await getAllStatistics(LocalStorage.getProjectId(), lang);
      if (pair != undefined) {
        return setStatisticsList(pair);
      }
    };
    updateStatisticList();
  }, [lang]);

  async function updateCurrentProject() {
    await getProject(LocalStorage.getProjectId()).then(setCurrentProject);
  }

  async function getAllStatistics(
    projectId: string,
    lang?: string
  ): Promise<SemanticDomainTreeNodeInt32KeyValuePair[] | undefined> {
    return await getSemanticDomainCounts(projectId, lang);
  }

  function getStatisticsList(
    statisticsList: SemanticDomainTreeNodeInt32KeyValuePair[]
  ) {
    return statisticsList.map((t) => (
      <ListItem style={{ minWidth: "600px" }} key={`${t.key?.id}`}>
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
        <Card style={{ width: 600 }}>
          <List>
            <Typography variant="h5" align="center">
              {t("statistics.dataStatistics") + currentProject?.name}
            </Typography>
          </List>
          <List>
            <Grid container wrap="nowrap" justifyContent="space-around">
              <Grid
                item
                xs={5}
                style={{
                  borderBottomStyle: "dotted",
                  borderBottomWidth: 1,
                  position: "relative",
                }}
              >
                <Typography variant="subtitle1">
                  {t("statistics.domainNumber")}
                </Typography>
              </Grid>
              <Grid
                item
                xs={5}
                style={{
                  borderBottomStyle: "dotted",
                  borderBottomWidth: 1,
                  position: "relative",
                }}
              >
                <Typography variant="subtitle1">
                  {t("statistics.domainName")}
                </Typography>
              </Grid>
              <Grid
                item
                xs={5}
                style={{
                  borderBottomStyle: "dotted",
                  borderBottomWidth: 1,
                  position: "relative",
                }}
              >
                <Typography variant="subtitle1">
                  {t("statistics.countSenses")}
                </Typography>
              </Grid>
            </Grid>
          </List>
          <List>{getStatisticsList(statisticsList)}</List>
        </Card>
      </Grid>
    </React.Fragment>
  );
}

// function getListItems(projects: Project[]) {
//   return projects.map((project) => (
//     <ListItem key={project.id}>
//       <Grid container justifyContent="space-evenly">
//         <Typography variant="h6" style={{ marginRight: theme.spacing(1) }}>
//           {project.name}
//         </Typography>
//         <Button
//           id="goals"
//           onClick={() => {
//             updateCurrentProject(project.id);
//           }}
//           color="inherit"
//           style={{
//             width: "min-content",
//             background: tabColor(Path.Statistics, Path.Statistics),
//           }}
//         >
//           {t("Select")}
//         </Button>
//       </Grid>
//     </ListItem>
//   ));
// }

// interface useSearchInputState {
//   input: string;
//   handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
//   searchInput: (event: React.KeyboardEvent) => void;
// }
// export function useSearchInput(): useSearchInputState {
//   const [input, setInput] = useState<string>("");
//   function searchInput(event: React.KeyboardEvent) {
//     event.bubbles = false;

//     if (event.key === Key.Enter) {
//       event.preventDefault();
//       if (input != "") {
//         let anchorElement = document.getElementById(input);
//
//         if (anchorElement) {
//           anchorElement.scrollIntoView();
//         }
//         setInput("");
//       }
//     }
//   }
//   // Change the input on typing
//   function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
//     setInput(insertDecimalPoints(event.target.value));
//     // Reset the error dialogue when input is changes to avoid showing an error
//     // when a valid domain is entered, but Enter hasn't been pushed yet.
//   }
//   return {
//     input,
//     handleChange,
//     searchInput,
//   };
// }
