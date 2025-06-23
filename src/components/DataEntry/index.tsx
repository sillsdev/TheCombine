import { Dialog, Divider, Paper, Stack, useMediaQuery } from "@mui/material";
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
import { DomainWord } from "types/word";
import { useWindowSize } from "utilities/useWindowSize";

export const treeViewDialogId = "tree-view-dialog";

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

  /* This ref is for the container of both the <DataEntryHeader> and <DataEntryTable>,
   * in order to check its height and update the height of the <ExistingDataTable>. */
  const dataEntryRef = useRef<HTMLDivElement | null>(null);

  const [domain, setDomain] = useState(newSemanticDomain(id, name, lang));
  const [domainWords, setDomainWords] = useState<DomainWord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [height, setHeight] = useState<number>();
  const [questionsVisible, setQuestionsVisible] = useState(false);

  const isSmallScreen = useMediaQuery((th) => th.breakpoints.down("md"));
  const { windowHeight } = useWindowSize();

  const updateHeight = useCallback(() => {
    setHeight(dataEntryRef.current?.clientHeight);
  }, []);

  // On first render, open tree.
  useLayoutEffect(() => {
    dispatch(openTree());
  }, [dispatch]);

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
  }, [domain, questionsVisible, updateHeight, windowHeight]);

  const returnControlToCaller = useCallback(async () => {
    setDomainWords(
      filterWordsByDomain(await getFrontierWords(), id, analysisLang)
    );
    dispatch(closeTree());
  }, [analysisLang, dispatch, id]);

  return (
    <>
      {!open && !!domain.guid && (
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="center"
          spacing={2}
        >
          {/* Domain data entry */}
          <Paper ref={dataEntryRef} sx={{ maxWidth: 900, p: 2 }}>
            <Stack divider={<Divider />} spacing={2}>
              <DataEntryHeader
                domain={domain}
                questionsVisible={questionsVisible}
                setQuestionVisibility={setQuestionsVisible}
              />

              <DataEntryTable
                hasDrawerButton={isSmallScreen && domainWords.length > 0}
                hideQuestions={() => setQuestionsVisible(false)}
                isTreeOpen={open}
                openTree={() => dispatch(openTree())}
                semanticDomain={currentDomain}
                showExistingData={() => setDrawerOpen(true)}
                updateHeight={updateHeight}
              />
            </Stack>
          </Paper>

          {/* Existing domain entries */}
          <ExistingDataTable
            domain={domain}
            domainWords={domainWords}
            drawerOpen={drawerOpen}
            height={height}
            toggleDrawer={setDrawerOpen}
            typeDrawer={isSmallScreen}
          />
        </Stack>
      )}

      <Dialog id={treeViewDialogId} fullScreen open={open}>
        <AppBar />
        <TreeView returnControlToCaller={returnControlToCaller} />
      </Dialog>
    </>
  );
}
