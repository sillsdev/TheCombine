import { Grid, Zoom } from "@material-ui/core";
import { animate } from "motion";
import React, { useCallback, useEffect, useState } from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import {
  SetParentMapAction,
  TraverseTreeAction,
  TreeActionType,
} from "./TreeViewActions";
import { WritingSystem } from "api";
import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeSearch from "components/TreeView/TreeSearch";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import { createDomains } from "components/TreeView/TreeViewReducer";
import { StoreState } from "types";
import { newWritingSystem } from "types/project";

/* This list should cover the domain data imported from resources/semantic-domains/
 * and be covered by the switch statement below. */
export const allSemDomWritingSystems = [
  newWritingSystem("en", "English"),
  newWritingSystem("es", "Español"),
  newWritingSystem("fr", "Francés"),
];

function getSemDomWritingSystem(
  lang: WritingSystem
): WritingSystem | undefined {
  return allSemDomWritingSystems.find((ws) => lang.bcp47.startsWith(ws.bcp47));
}

export interface TreeViewProps {
  semDomWritingSystem: WritingSystem;
  currentDomain: TreeSemanticDomain;
  navigateTree: (domain: TreeSemanticDomain) => void;
  returnControlToCaller: () => void;
}

export function TreeView(props: TreeViewProps & LocalizeContextProps) {
  const visible = useSelector((state: StoreState) => state.treeViewState.open);
  const parentMap = useSelector(
    (state: StoreState) => state.treeViewState.parentMap
  );
  const currentDomain = useSelector(
    (state: StoreState) => state.treeViewState.currentDomain
  );
  const dispatch = useDispatch();

  const loadLocalizedJson = (languageKey: string): Promise<any> => {
    return new Promise((res, rej) => {
      import(`resources/semantic-domains/${languageKey}.json`).then((data) => {
        res(data?.default);
      });
    });
  };

  const loadLocalizedDomains = useCallback(() => {
    async function getSemanticDomains(lang: string) {
      const localizedDomains = await loadLocalizedJson(lang);
      const { currentDomain, parentMap } = createDomains(localizedDomains);
      if (!currentDomain.name) {
        currentDomain.name = props.translate("addWords.domain") as string;
      }
      dispatch(SetParentMapAction(parentMap));
      dispatch(TraverseTreeAction(currentDomain));
    }

    /* Select the language used for the semantic domains.
     * Primary: Has it been specified for the project?
     * Secondary: What is the current browser/ui language?
     * Default: English. */
    const lang =
      getSemDomWritingSystem(props.semDomWritingSystem)?.bcp47 ??
      props.activeLanguage.code;

    getSemanticDomains(lang);
  }, [props, dispatch]);

  useEffect(() => {
    dispatch({ type: TreeActionType.OPEN_TREE }); // Start with the tree open
    loadLocalizedDomains();
  }, [dispatch, loadLocalizedDomains]);

  function animateHandler(domain?: TreeSemanticDomain): Promise<void> {
    if (visible) {
      dispatch({ type: TreeActionType.OPEN_TREE });
      return new Promise((resolve) =>
        setTimeout(() => {
          if (domain && !visible) {
            if (domain.id !== props.currentDomain.id) {
              props.navigateTree(domain);
              dispatch({ type: TreeActionType.OPEN_TREE });
            } else {
              props.returnControlToCaller();
            }
          }
          resolve();
        }, 300)
      );
    } else return Promise.reject("Change already in-progress");
  }

  return (
    <React.Fragment>
      {/* Domain search */}
      <Grid container justifyContent="center">
        <TreeSearch
          currentDomain={props.currentDomain}
          parentMap={parentMap}
          animate={animateHandler}
        />
      </Grid>
      {/* Domain tree */}
      <Zoom
        in={visible}
        onEntered={() => {
          if (props.currentDomain.id) {
            animate(
              "#current-domain",
              { transform: ["none", "scale(.9)", "none"] },
              { delay: 0.25, duration: 1 }
            );
          }
        }}
      >
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
        >
          <TreeDepiction
            currentDomain={props.currentDomain}
            animate={animateHandler}
            parentMap={parentMap}
          />
        </Grid>
      </Zoom>
    </React.Fragment>
  );
}

export default withLocalize(TreeView);
