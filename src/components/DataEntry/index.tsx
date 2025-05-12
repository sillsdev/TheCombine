import { Dialog, Divider, Grid2, Paper } from "@mui/material";
import {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { getFrontierWords, getSemanticDomainFull } from "backend";
import AppBar from "components/AppBar";
import DataEntryHeader from "components/DataEntry/DataEntryHeader";
import DataEntryTable from "components/DataEntry/DataEntryTable";
import ExistingDataTable from "components/DataEntry/ExistingDataTable";
import { filterWordsByDomain } from "components/DataEntry/utilities";
import TreeView from "components/TreeView";
import { closeTree, openTree } from "components/TreeView/Redux/TreeViewActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { newSemanticDomain } from "types/semanticDomain";
import theme from "types/theme";
import { DomainWord } from "types/word";
import { useWindowSize } from "utilities/useWindowSize";

export const smallScreenThreshold = 960;
export const treeViewDialogId = "tree-view-dialog";

const paperStyle = {
  marginInline: "auto",
  maxWidth: 900,
  padding: theme.spacing(2),
};

/**
 * Allows users to add words to a project, add senses to an existing word,
 * and add the current semantic domain to an existing sense.
 */
export default function DataEntry(): ReactElement {
  const dispatch = useAppDispatch();

  const analysisLang = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems[0].bcp47
  );
  const { currentDomain, open } = useAppSelector(
    (state: StoreState) => state.treeViewState
  );
  const customDomains = useAppSelector(
    (state: StoreState) => state.currentProjectState.project.semanticDomains
  );

  const { id, lang, name } = currentDomain;

  /* This ref is for a container of both the <DataEntryHeader> and <DataEntryTable>,
   * in order to check its height and update the height of the <ExistingDataTable>.
   * Attach to the <Paper> because the parent <Grid2> won't shrink to its content,
   * but will match the height of its neighbor <Grid2> in <ExistingDataTable>. */
  const dataEntryRef = useRef<HTMLDivElement | null>(null);

  const [domain, setDomain] = useState(newSemanticDomain(id, name, lang));
  const [domainWords, setDomainWords] = useState<DomainWord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [height, setHeight] = useState<number>();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(false);

  const { windowWidth } = useWindowSize();

  const updateHeight = useCallback(() => {
    setHeight(dataEntryRef.current?.clientHeight);
  }, []);

  // On first render, open tree.
  useLayoutEffect(() => {
    dispatch(openTree());
  }, [dispatch]);

  // When window width changes, check if there's space for the sidebar.
  useLayoutEffect(() => {
    setIsSmallScreen(windowWidth < smallScreenThreshold);
  }, [windowWidth]);

  // When domain changes, fetch full domain details.
  useEffect(() => {
    const customDomain = customDomains.find(
      (d) => d.id === id && d.lang === lang
    );
    if (customDomain) {
      setDomain(customDomain);
    } else {
      getSemanticDomainFull(id, lang).then((fullDomain) => {
        if (fullDomain) {
          setDomain(fullDomain);
        }
      });
    }
  }, [customDomains, id, lang]);

  // Recalculate height if something changed that might affect it.
  useEffect(() => {
    updateHeight();
  }, [domain, questionsVisible, updateHeight, windowWidth]);

  const returnControlToCaller = useCallback(async () => {
    setDomainWords(
      filterWordsByDomain(await getFrontierWords(), id, analysisLang)
    );
    dispatch(closeTree());
  }, [analysisLang, dispatch, id]);

  return (
    <>
      {!open && !!domain.guid && (
        <Grid2
          container
          justifyContent="center"
          spacing={theme.spacing(2)}
          wrap={"nowrap"}
        >
          <Grid2>
            <Paper ref={dataEntryRef} style={paperStyle}>
              <DataEntryHeader
                domain={domain}
                questionsVisible={questionsVisible}
                setQuestionVisibility={setQuestionsVisible}
              />
              <Divider sx={{ my: theme.spacing(2) }} />
              <DataEntryTable
                hasDrawerButton={isSmallScreen && domainWords.length > 0}
                hideQuestions={() => setQuestionsVisible(false)}
                isTreeOpen={open}
                openTree={() => dispatch(openTree())}
                semanticDomain={currentDomain}
                showExistingData={() => setDrawerOpen(true)}
                updateHeight={updateHeight}
              />
            </Paper>
          </Grid2>

          <ExistingDataTable
            domain={domain}
            domainWords={domainWords}
            drawerOpen={drawerOpen}
            height={height}
            toggleDrawer={setDrawerOpen}
            typeDrawer={isSmallScreen}
          />
        </Grid2>
      )}
      <Dialog id={treeViewDialogId} fullScreen open={open}>
        <AppBar />
        <TreeView returnControlToCaller={returnControlToCaller} />
      </Dialog>
    </>
  );
}
