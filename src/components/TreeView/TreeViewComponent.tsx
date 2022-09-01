import { Grid, Zoom } from "@material-ui/core";
import { animate } from "motion";
import React, { ReactElement, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { WritingSystem } from "api";
import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeSearch from "components/TreeView/TreeSearch";
import {
  traverseTreeAction,
  updateTreeLanguage,
} from "components/TreeView/TreeViewActions";
import { StoreState } from "types";
import { TreeSemanticDomain } from "types/semanticDomain";
import { semDomWritingSystems } from "types/writingSystem";

function getSemDomWritingSystem(
  lang: WritingSystem
): WritingSystem | undefined {
  return semDomWritingSystems.find((ws) => lang.bcp47.startsWith(ws.bcp47));
}

export interface TreeViewProps extends WithTranslation {
  returnControlToCaller: () => void;
}

export function TreeView(props: TreeViewProps): ReactElement {
  const currentDomain = useSelector(
    (state: StoreState) => state.treeViewState.currentDomain
  );
  const domainMap = useSelector(
    (state: StoreState) => state.treeViewState.domainMap
  );
  const semDomLanguage = useSelector(
    (state: StoreState) => state.treeViewState.language
  );
  const semDomWritingSystem = useSelector(
    (state: StoreState) => state.currentProjectState.project.semDomWritingSystem
  );
  const [visible, setVisible] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    /* Select the language used for the semantic domains.
     * Primary: Has it been specified for the project?
     * Secondary: What is the current browser/ui language? */
    const newLang =
      getSemDomWritingSystem(semDomWritingSystem)?.bcp47 ??
      props.i18n.resolvedLanguage;
    if (newLang && newLang !== semDomLanguage) {
      const headString = props.t("addWords.domain") as string;
      dispatch(updateTreeLanguage(newLang, headString));
      // Don't update when props updates, except props.i18n.resolvedLanguage
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    semDomLanguage,
    semDomWritingSystem,
    dispatch,
    props.i18n.resolvedLanguage,
  ]);

  function animateHandler(domain: TreeSemanticDomain): Promise<void> {
    if (visible) {
      setVisible(false);
      return new Promise((resolve) =>
        setTimeout(() => {
          if (domain.id !== currentDomain.id) {
            dispatch(traverseTreeAction(domain));
            setVisible(true);
          } else {
            props.returnControlToCaller();
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
          currentDomain={currentDomain}
          domainMap={domainMap}
          animate={animateHandler}
        />
      </Grid>
      {/* Domain tree */}
      <Zoom
        in={visible}
        onEntered={() => {
          if (currentDomain.id) {
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
            currentDomain={currentDomain}
            animate={animateHandler}
            domainMap={domainMap}
          />
        </Grid>
      </Zoom>
    </React.Fragment>
  );
}

export default withTranslation()(TreeView);
