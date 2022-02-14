import { Grid, Zoom } from "@material-ui/core";
import { animate } from "motion";
import React, { useEffect, useState } from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import { WritingSystem } from "api";
import TreeDepiction from "components/TreeView/TreeDepiction";
import TreeSearch from "components/TreeView/TreeSearch";
import TreeSemanticDomain from "components/TreeView/TreeSemanticDomain";
import {
  SetDomainMapAction,
  TraverseTreeAction,
  TreeActionType,
} from "components/TreeView/TreeViewActions";
import { createDomains } from "components/TreeView/TreeViewReducer";
import { StoreState } from "types";
import { newWritingSystem } from "types/project";

// This list should cover the domain data in resources/semantic-domains/
export const allSemDomWritingSystems = [
  newWritingSystem("en", "English"),
  newWritingSystem("es", "Español"),
  newWritingSystem("fr", "Français"),
];

function getSemDomWritingSystem(
  lang: WritingSystem
): WritingSystem | undefined {
  return allSemDomWritingSystems.find((ws) => lang.bcp47.startsWith(ws.bcp47));
}

export interface TreeViewProps {
  returnControlToCaller: () => void;
}

export function TreeView(props: TreeViewProps & LocalizeContextProps) {
  const currentDomain = useSelector(
    (state: StoreState) => state.treeViewState.currentDomain
  );
  const semDomWritingSystem = useSelector(
    (state: StoreState) => state.currentProjectState.project.semDomWritingSystem
  );
  const visible = useSelector((state: StoreState) => state.treeViewState.open);
  const domainMap = useSelector(
    (state: StoreState) => state.treeViewState.domainMap
  );
  const dispatch = useDispatch();
  const navigateTree = (domain: TreeSemanticDomain) => {
    dispatch(TraverseTreeAction(domain));
  };
  const [lang, setLang] = useState("");

  const loadLocalizedJson = (languageKey: string): Promise<any> => {
    return new Promise((res) => {
      import(`resources/semantic-domains/${languageKey}.json`).then((data) => {
        res(data?.default);
      });
    });
  };

  useEffect(() => {
    dispatch({ type: TreeActionType.OPEN_TREE }); // Start with the tree open

    /* Select the language used for the semantic domains.
     * Primary: Has it been specified for the project?
     * Secondary: What is the current browser/ui language? */
    setLang(
      getSemDomWritingSystem(semDomWritingSystem)?.bcp47 ??
        props.activeLanguage.code
    );
  }, [dispatch, semDomWritingSystem, setLang, props]);

  const headDomainName = props.translate("addWords.domain") as string;
  useEffect(() => {
    async function getSemanticDomains(lang: string) {
      const localizedDomains = await loadLocalizedJson(lang);
      const { currentDomain, domainMap } = createDomains(localizedDomains);
      if (!currentDomain.name) {
        currentDomain.name = headDomainName;
      }
      dispatch(SetDomainMapAction(domainMap));
      dispatch(TraverseTreeAction(currentDomain));
    }
    if (lang) {
      getSemanticDomains(lang);
    }
  }, [dispatch, lang, headDomainName]);

  function animateHandler(domain?: TreeSemanticDomain): Promise<void> {
    if (visible) {
      dispatch({ type: TreeActionType.OPEN_TREE });
      return new Promise((resolve) =>
        setTimeout(() => {
          if (domain && !visible) {
            if (domain.id !== currentDomain.id) {
              navigateTree(domain);
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

export default withLocalize(TreeView);
