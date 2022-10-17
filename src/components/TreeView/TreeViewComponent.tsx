import { Grid, Zoom } from "@material-ui/core";
import { animate } from "motion";
import React, { ReactElement, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { SemanticDomain, WritingSystem } from "api";
import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeSearch from "components/TreeView/TreeSearch";
import {
  initTreeDomain,
  traverseTreeAction,
  updateTreeLanguage,
} from "components/TreeView/TreeViewActions";
import { StoreState } from "types";
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
  const semDomLanguage = useSelector(
    (state: StoreState) => state.treeViewState.language
  );
  const semDomWritingSystem = useSelector(
    (state: StoreState) => state.currentProjectState.project.semDomWritingSystem
  );
  const [visible, setVisible] = useState(true);
  const dispatch = useDispatch();
  const { i18n } = props;

  useEffect(() => {
    /* Select the language used for the semantic domains.
     * Primary: Has it been specified for the project?
     * Secondary: What is the current browser/ui language? */
    const newLang =
      getSemDomWritingSystem(semDomWritingSystem)?.bcp47 ??
      i18n.resolvedLanguage;
    if (newLang && newLang !== semDomLanguage) {
      dispatch(updateTreeLanguage(newLang));
    }
    dispatch(initTreeDomain(newLang));
  }, [semDomLanguage, semDomWritingSystem, dispatch, i18n.resolvedLanguage]);

  function animateHandler(domain: SemanticDomain): Promise<void> {
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
        <TreeSearch currentDomain={currentDomain} animate={animateHandler} />
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
          />
        </Grid>
      </Zoom>
    </React.Fragment>
  );
}

export default withTranslation()(TreeView);
