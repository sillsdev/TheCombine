import { Dialog, Divider, Grid, Paper } from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";

import { getFrontierWords, getSemanticDomainFull } from "backend";
import AppBar from "components/AppBar/AppBarComponent";
import DataEntryHeader from "components/DataEntry/DataEntryHeader";
import DataEntryTable from "components/DataEntry/DataEntryTable";
import ExistingDataTable from "components/DataEntry/ExistingDataTable";
import {
  filterWordsByDomain,
  sortDomainWordsByVern,
} from "components/DataEntry/utilities";
import {
  closeTreeAction,
  openTreeAction,
} from "components/TreeView/TreeViewActions";
import TreeView from "components/TreeView/TreeViewComponent";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { newSemanticDomain } from "types/semanticDomain";
import theme from "types/theme";
import { DomainWord } from "types/word";
import { useWindowSize } from "utilities/useWindowSize";

export const smallScreenThreshold = 960;

const paperStyle = {
  padding: theme.spacing(2),
  maxWidth: 800,
  marginLeft: "auto",
  marginRight: "auto",
};

/**
 * Allows users to add words to a project, add senses to an existing word,
 * and add the current semantic domain to a sense
 */
export default function DataEntry(): ReactElement {
  const dispatch = useAppDispatch();

  const { currentDomain, open } = useAppSelector(
    (state: StoreState) => state.treeViewState
  );
  const { id, lang, name } = useAppSelector(
    (state: StoreState) => state.treeViewState.currentDomain
  );
  const [domain, setDomain] = useState(newSemanticDomain(id, name, lang));
  const [domainWords, setDomainWords] = useState<DomainWord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  //const [isLoaded, setIsLoaded] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(false);

  const { windowWidth } = useWindowSize();

  // Open tree when DataEntry first renders, not when props update.
  useEffect(() => {
    dispatch(openTreeAction());
  }, [dispatch]);

  useEffect(() => {
    setIsSmallScreen(windowWidth < smallScreenThreshold);
  }, [windowWidth]);

  useEffect(() => {
    getSemanticDomainFull(id, lang).then((fullDomain) => {
      if (fullDomain) {
        setDomain(fullDomain);
      }
    });
  }, [id, lang]);

  const returnControlToCaller = useCallback(async () => {
    const words = filterWordsByDomain(await getFrontierWords(), id);
    setDomainWords(sortDomainWordsByVern(words));
    dispatch(closeTreeAction());
  }, [dispatch, id]);

  return (
    <Grid container justifyContent="center" spacing={3} wrap={"nowrap"}>
      <Grid item>
        <Paper style={paperStyle}>
          <DataEntryHeader
            domain={domain}
            questionsVisible={questionsVisible}
            setQuestionVisibility={setQuestionsVisible}
          />
          <Divider />
          <DataEntryTable
            semanticDomain={currentDomain}
            isTreeOpen={open}
            openTree={() => dispatch(openTreeAction())}
            showExistingData={() => setDrawerOpen(true)}
            hasDrawerButton={isSmallScreen && domainWords.length > 0}
            hideQuestions={() => setQuestionsVisible(false)}
          />
        </Paper>
      </Grid>
      <ExistingDataTable
        domain={domain}
        typeDrawer={isSmallScreen}
        domainWords={domainWords}
        drawerOpen={drawerOpen}
        toggleDrawer={setDrawerOpen}
      />

      <Dialog fullScreen open={!!open}>
        <AppBar />
        <TreeView returnControlToCaller={returnControlToCaller} />
      </Dialog>
    </Grid>
  );
}
