import { Dialog, Divider, Grid, Paper } from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";

import { SemanticDomainTreeNode } from "api/models";
import { getFrontierWords, getSemanticDomainFull } from "backend";
import AppBar from "components/AppBar/AppBarComponent";
import DataEntryHeader from "components/DataEntry/DataEntryHeader";
import DataEntryTable from "components/DataEntry/DataEntryTable";
import ExistingDataTable from "components/DataEntry/ExistingDataTable";
import {
  filterWordsByDomain,
  sortDomainWordsByVern,
} from "components/DataEntry/utilities";
import TreeView from "components/TreeView/TreeViewComponent";
import { newSemanticDomain } from "types/semanticDomain";
import theme from "types/theme";
import { DomainWord } from "types/word";
import { useWindowSize } from "utilities/useWindowSize";

const paperStyle = {
  padding: theme.spacing(2),
  maxWidth: 800,
  marginLeft: "auto",
  marginRight: "auto",
};

export interface DataEntryProps {
  currentDomain: SemanticDomainTreeNode;
  isTreeOpen?: boolean;
  closeTree: () => void;
  openTree: () => void;
}

/**
 * Allows users to add words to a project, add senses to an existing word,
 * and add the current semantic domain to a sense
 */
export default function DataEntry(props: DataEntryProps): ReactElement {
  const { closeTree, openTree, isTreeOpen } = props;
  const { id, lang, name } = props.currentDomain;

  const [domain, setDomain] = useState(newSemanticDomain(id, name, lang));
  const [domainWords, setDomainWords] = useState<DomainWord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(false);

  const { windowWidth } = useWindowSize();

  // Open tree when DataEntry first renders, not when props update.
  useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true);
      openTree();
    }
  }, [isLoaded, openTree]);

  useEffect(() => {
    setIsSmallScreen(windowWidth < 960);
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
    closeTree();
  }, [closeTree, id]);

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
            semanticDomain={props.currentDomain}
            isTreeOpen={props.isTreeOpen}
            openTree={props.openTree}
            showExistingData={() => setDrawerOpen(true)}
            hasDrawerButton={isSmallScreen && domainWords.length > 0}
            hideQuestions={() => setQuestionsVisible(false)}
          />
        </Paper>
      </Grid>
      <ExistingDataTable
        domain={props.currentDomain}
        typeDrawer={isSmallScreen}
        domainWords={domainWords}
        drawerOpen={drawerOpen}
        toggleDrawer={setDrawerOpen}
      />

      <Dialog fullScreen open={!!isTreeOpen}>
        <AppBar />
        <TreeView returnControlToCaller={returnControlToCaller} />
      </Dialog>
    </Grid>
  );
}
