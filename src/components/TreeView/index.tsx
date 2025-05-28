import { Close, KeyboardDoubleArrowUp } from "@mui/icons-material";
import { Grid2, Zoom } from "@mui/material";
import { animate } from "motion";
import { type ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import { type SemanticDomain, type WritingSystem } from "api/models";
import { IconButtonWithTooltip } from "components/Buttons";
import {
  initTreeDomain,
  setDomainLanguage,
  traverseTree,
} from "components/TreeView/Redux/TreeViewActions";
import { defaultTreeNode } from "components/TreeView/Redux/TreeViewReduxTypes";
import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeNavigator from "components/TreeView/TreeNavigator";
import TreeSearch from "components/TreeView/TreeSearch";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { newSemanticDomain, rootId } from "types/semanticDomain";
import { semDomWritingSystems } from "types/writingSystem";

function getSemDomWritingSystem(
  lang: WritingSystem
): WritingSystem | undefined {
  return semDomWritingSystems.find((ws) => lang.bcp47.startsWith(ws.bcp47));
}

export enum TreeViewIds {
  ButtonExit = "tree-view-exit-button",
  ButtonTop = "tree-view-top-button",
}

export interface TreeViewProps {
  exit?: () => void;
  returnControlToCaller: (domain?: SemanticDomain) => void | Promise<void>;
}

export default function TreeView(props: TreeViewProps): ReactElement {
  const { exit, returnControlToCaller } = props;
  const currentDomain = useAppSelector(
    (state: StoreState) => state.treeViewState.currentDomain
  );
  const customDomains = useAppSelector(
    (state: StoreState) => state.currentProjectState.project.semanticDomains
  );
  const semDomLanguage = useAppSelector(
    (state: StoreState) => state.treeViewState.language
  );
  const semDomWritingSystem = useAppSelector(
    (state: StoreState) => state.currentProjectState.project.semDomWritingSystem
  );
  const [visible, setVisible] = useState(true);
  const dispatch = useAppDispatch();
  const { resolvedLanguage } = useTranslation().i18n;

  useEffect(() => {
    /* Select the language used for the semantic domains.
     * Primary: Has it been specified for the project?
     * Secondary: What is the current browser/ui language? */
    const newLang =
      getSemDomWritingSystem(semDomWritingSystem)?.bcp47 ?? resolvedLanguage;
    if (newLang && newLang !== semDomLanguage) {
      dispatch(setDomainLanguage(newLang));
    }
    dispatch(initTreeDomain(newLang));
  }, [semDomLanguage, semDomWritingSystem, dispatch, resolvedLanguage]);

  useEffect(() => {
    if (!exit) {
      return;
    }
    const handleEsc = (event: KeyboardEvent): void => {
      if (exit && event.key === Key.Escape) {
        exit();
      }
    };
    window.addEventListener("keydown", handleEsc, true);
    return () => {
      window.removeEventListener("keydown", handleEsc, true);
    };
  }, [exit]);

  useEffect(() => {
    setVisible(true);
  }, [currentDomain]);

  const goToDomFromId = useCallback(
    async (dom: SemanticDomain, id: string): Promise<void> => {
      if (dom.id !== id) {
        await dispatch(traverseTree(dom));
      } else if (dom.id !== defaultTreeNode.id) {
        await returnControlToCaller(dom);
      } else {
        setVisible(true);
      }
    },
    [dispatch, returnControlToCaller, setVisible]
  );

  const animateHandler = async (dom?: SemanticDomain): Promise<void> => {
    if (visible) {
      setVisible(false);
      dom ||= newSemanticDomain(defaultTreeNode.id, "", currentDomain.lang);
      await goToDomFromId(dom, currentDomain.id);
    }
  };

  const onClickTop =
    currentDomain.id === defaultTreeNode.id
      ? undefined
      : () => animateHandler();

  return (
    <>
      {/* Domain search */}
      <TreeNavigator currentDomain={currentDomain} animate={animateHandler} />
      <Grid2 container justifyContent="space-between">
        <Grid2>
          {/* Empty grid to balance the buttons */}
          <div style={{ width: exit ? 80 : 40 }} />
        </Grid2>

        <Grid2 container justifyContent="center" size="grow">
          <TreeSearch
            animate={animateHandler}
            currentDomain={currentDomain}
            customDomains={customDomains}
          />
        </Grid2>

        <Grid2>
          <IconButtonWithTooltip
            icon={<KeyboardDoubleArrowUp />}
            textId={"treeView.returnToTop"}
            onClick={onClickTop}
            buttonId={TreeViewIds.ButtonTop}
          />
          {exit && (
            <IconButtonWithTooltip
              icon={<Close />}
              textId={"buttons.exit"}
              onClick={exit}
              buttonId={TreeViewIds.ButtonExit}
            />
          )}
        </Grid2>
      </Grid2>

      {/* Domain tree */}
      <Zoom
        in={visible}
        onEntered={() => {
          if (currentDomain.id && currentDomain.id !== rootId) {
            animate("#current-domain", { scale: [1, 0.9, 1] }, { duration: 1 });
          }
        }}
      >
        <Grid2
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <TreeDepiction
            currentDomain={currentDomain}
            animate={animateHandler}
          />
        </Grid2>
      </Zoom>
    </>
  );
}
