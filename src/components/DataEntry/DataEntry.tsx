import { Dialog, Divider, Grid, Paper } from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";

import { SemanticDomainTreeNode, Status, Word } from "api/models";
import { getFrontierWords, getSemanticDomainFull } from "backend";
import AppBar from "components/AppBar/AppBarComponent";
import DataEntryHeader from "components/DataEntry/DataEntryHeader";
import DataEntryTable from "components/DataEntry/DataEntryTable/DataEntryTable";
import ExistingDataTable from "components/DataEntry/ExistingDataTable/ExistingDataTable";
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

/** Filter out words that do not have at least 1 active sense */
export function filterWords(words: Word[]): Word[] {
  return words.filter((w) =>
    w.senses.find((s) =>
      [Status.Active, Status.Protected].includes(s.accessibility)
    )
  );
}

export function filterWordsByDomain(
  words: Word[],
  domainId: string
): DomainWord[] {
  const domainWords: DomainWord[] = [];
  for (const currentWord of words) {
    const senses = currentWord.senses.filter((s) =>
      // The undefined is for Statuses created before .accessibility was required in the frontend.
      [Status.Active, Status.Protected, undefined].includes(s.accessibility)
    );
    for (const sense of senses) {
      if (sense.semanticDomains.map((dom) => dom.id).includes(domainId)) {
        domainWords.push(new DomainWord({ ...currentWord, senses: [sense] }));
      }
    }
  }
  return domainWords;
}

export function sortDomainWordsByVern(words: DomainWord[]): DomainWord[] {
  return words.sort((a, b) => {
    const comp = a.vernacular.localeCompare(b.vernacular);
    return comp !== 0 ? comp : a.gloss.localeCompare(b.gloss);
  });
}

interface DataEntryProps {
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
  const { id, lang, name } = props.currentDomain;
  const closeTree = props.closeTree;

  const [domain, setDomain] = useState(newSemanticDomain(id, name, lang));
  const [domainWords, setDomainWords] = useState<DomainWord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(false);

  const { windowWidth } = useWindowSize();

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

      <Dialog fullScreen open={!!props.isTreeOpen}>
        <AppBar />
        <TreeView returnControlToCaller={returnControlToCaller} />
      </Dialog>
    </Grid>
  );
}
