import { Dialog, Divider, Grid, Paper } from "@mui/material";
import {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { getFrontierWords, getSemanticDomainFull } from "backend";
import AppBar from "components/AppBar/AppBarComponent";
import DataEntryHeader from "components/DataEntry/DataEntryHeader";
import DataEntryTable from "components/DataEntry/DataEntryTable";
import ExistingDataTable from "components/DataEntry/ExistingDataTable";
import {
  filterWordsByDomain,
  sortDomainWordsByVern,
} from "components/DataEntry/utilities";
import TreeView from "components/TreeView";
import {
  closeTreeAction,
  openTreeAction,
} from "components/TreeView/Redux/TreeViewActions";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { newSemanticDomain } from "types/semanticDomain";
import theme from "types/theme";
import { DomainWord } from "types/word";
import { useWindowSize } from "utilities/useWindowSize";

export const smallScreenThreshold = 960;
export const treeViewDialogId = "tree-view-dialog";

const paperStyle = {
  marginLeft: "auto",
  marginRight: "auto",
  maxWidth: 800,
  padding: theme.spacing(2),
};

/**
 * Allows users to add words to a project, add senses to an existing word,
 * and add the current semantic domain to an existing sense.
 */
export default function DataEntry(): ReactElement {
  const dispatch = useAppDispatch();

  const { currentDomain, open } = useAppSelector(
    (state: StoreState) => state.treeViewState
  );
  const { id, lang, name } = currentDomain;

  const dataEntryRef = useRef<HTMLDivElement | null>(null);

  const [domain, setDomain] = useState(newSemanticDomain(id, name, lang));
  const [domainWords, setDomainWords] = useState<DomainWord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [height, setHeight] = useState(0);
  const [questionsVisible, setQuestionsVisible] = useState(false);

  const { windowWidth } = useWindowSize();

  const updateHeight = useCallback(() => {
    setHeight(dataEntryRef.current?.clientHeight ?? 0);
  }, []);

  // On first render, open tree.
  useLayoutEffect(() => {
    dispatch(openTreeAction());
  }, [dispatch]);

  // When window width changes, check if there's space for the sidebar.
  useLayoutEffect(() => {
    setIsSmallScreen(windowWidth < smallScreenThreshold);
  }, [windowWidth]);

  // Recalculate height if something changed that might affect it.
  useEffect(() => {
    updateHeight();
  }, [domain, questionsVisible, updateHeight, windowWidth]);

  // When domain changes, fetch full domain details.
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
        <Paper ref={dataEntryRef} style={paperStyle}>
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
            updateHeight={updateHeight}
          />
        </Paper>
      </Grid>
      <ExistingDataTable
        domain={domain}
        domainWords={domainWords}
        drawerOpen={drawerOpen}
        tableHeight={height}
        toggleDrawer={setDrawerOpen}
        typeDrawer={isSmallScreen}
      />

      <Dialog id={treeViewDialogId} fullScreen open={!!open}>
        <AppBar />
        <TreeView returnControlToCaller={returnControlToCaller} />
      </Dialog>
    </Grid>
  );
}
