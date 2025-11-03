import {
  Add,
  ArrowUpward,
  BorderColor,
  Clear,
  Delete,
  Done,
  Search,
} from "@mui/icons-material";
import {
  Button,
  Grid2,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { Fragment, type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { type WritingSystem } from "api/models";
import { getFrontierWords } from "backend";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import { LanguagePicker } from "components/LanguagePicker";
import { type ProjectSettingProps } from "components/ProjectSettings/ProjectSettingsTypes";
import theme from "types/theme";
import { newWritingSystem, semDomWritingSystems } from "types/writingSystem";
import { NormalizedTextField } from "utilities/fontComponents";
import { getAnalysisLangsFromWords } from "utilities/wordUtilities";

export enum ProjectLanguagesId {
  ButtonAddAnalysisLang = "analysis-language-new",
  ButtonAddAnalysisLangClear = "analysis-language-new-clear",
  ButtonAddAnalysisLangConfirm = "analysis-language-new-confirm",
  ButtonEditVernacularName = "vernacular-language-edit",
  ButtonEditVernacularNameSave = "vernacular-language-save",
  ButtonGetProjAnalysisLangs = "analysis-language-get",
  FieldEditVernacularName = "vernacular-language-name",
  SelectSemDomLang = "semantic-domains-language",
}

export default function ProjectLanguages(
  props: ProjectSettingProps
): ReactElement {
  const [add, setAdd] = useState(false);
  const [changeVernName, setChangeVernName] = useState(false);
  const [isNewLang, setIsNewLang] = useState(false);
  const [langsInProj, setLangsInProj] = useState("");
  const [newLang, setNewLang] = useState(newWritingSystem());
  const [newVernName, setNewVernName] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    setIsNewLang(
      !!newLang.bcp47 &&
        !props.project.analysisWritingSystems
          .map((ws) => ws.bcp47)
          .includes(newLang.bcp47)
    );
  }, [newLang.bcp47, props.project.analysisWritingSystems]);

  useEffect(() => {
    setNewVernName(props.project.vernacularWritingSystem.name);
  }, [props.project.vernacularWritingSystem.name]);

  const setNewAnalysisDefault = async (index: number): Promise<void> => {
    const analysisWritingSystems = [...props.project.analysisWritingSystems];
    const newDefault = analysisWritingSystems.splice(index, 1)[0];
    analysisWritingSystems.splice(0, 0, newDefault);
    await props
      .setProject({ ...props.project, analysisWritingSystems })
      .then(() => resetState())
      .catch((err) => {
        console.error(err);
        toast.error(
          t("projectSettings.language.makeDefaultAnalysisLanguageFailed")
        );
      });
  };

  const deleteAnalysisWritingSystem = async (index: number): Promise<void> => {
    const analysisWritingSystems = [...props.project.analysisWritingSystems];
    analysisWritingSystems.splice(index, 1);
    await props
      .setProject({ ...props.project, analysisWritingSystems })
      .then(() => resetState())
      .catch((err) => {
        console.error(err);
        toast.error(t("projectSettings.language.deleteAnalysisLanguageFailed"));
      });
  };

  const addAnalysisWritingSystem = async (): Promise<void> => {
    if (!isNewLang) {
      toast.error(t("projectSettings.language.addAnalysisLanguageFailed"));
      return;
    }
    const analysisWritingSystems = [...props.project.analysisWritingSystems];
    analysisWritingSystems.push(newLang);
    await props
      .setProject({ ...props.project, analysisWritingSystems })
      .then(() => resetState())
      .catch((err) => {
        console.error(err);
        toast.error(t("projectSettings.language.addAnalysisLanguageFailed"));
      });
  };

  const writingSystemButtons = (index: number): ReactElement => {
    return index === 0 || props.readOnly ? (
      // The top writing system is default and needs no buttons.
      <Fragment />
    ) : (
      <>
        <IconButtonWithTooltip
          icon={<ArrowUpward fontSize="inherit" />}
          textId="projectSettings.language.makeDefaultAnalysisLanguage"
          size="small"
          onClick={() => setNewAnalysisDefault(index)}
          buttonId={`analysis-language-${index}-bump`}
        />
        <IconButtonWithTooltip
          icon={<Delete fontSize="inherit" />}
          textId="projectSettings.language.deleteAnalysisLanguage"
          size="small"
          onClick={() => deleteAnalysisWritingSystem(index)}
          buttonId={`analysis-language-${index}-delete`}
        />
      </>
    );
  };

  const getActiveAnalysisLangs = async (): Promise<void> => {
    const langCodes = getAnalysisLangsFromWords(await getFrontierWords());
    langCodes.sort();
    setLangsInProj(langCodes.join(", "));
  };

  const resetState = (): void => {
    setAdd(false);
    setLangsInProj("");
    setNewLang(newWritingSystem());
    setChangeVernName(false);
  };

  const updateVernacularName = async (): Promise<void> => {
    if (
      !newVernName ||
      newVernName === props.project.vernacularWritingSystem.name
    ) {
      return;
    }

    const vernacularWritingSystem: WritingSystem = {
      ...props.project.vernacularWritingSystem,
      name: newVernName,
    };
    await props
      .setProject({ ...props.project, vernacularWritingSystem })
      .then(() => {
        resetState();
        toast.success(
          t("projectSettings.language.updateVernacularLanguageNameSuccess")
        );
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          t("projectSettings.language.updateVernacularLanguageNameFailed")
        );
      });
  };

  const addAnalysisLangButtons = (): ReactElement => (
    <>
      <IconButtonWithTooltip
        icon={<Add />}
        textId="projectSettings.language.addAnalysisLanguage"
        onClick={() => setAdd(true)}
        buttonId={ProjectLanguagesId.ButtonAddAnalysisLang}
      />
      <IconButtonWithTooltip
        icon={<Search />}
        textId="projectSettings.language.getGlossLanguages"
        onClick={() => getActiveAnalysisLangs()}
        buttonId={ProjectLanguagesId.ButtonGetProjAnalysisLangs}
      />
      {langsInProj}
    </>
  );

  const addAnalysisLangPicker = (): ReactElement => (
    <Grid2 alignItems="center" container spacing={1}>
      <LanguagePicker
        value={newLang.bcp47}
        setCode={(bcp47: string) =>
          setNewLang((prev: WritingSystem) => ({ ...prev, bcp47 }))
        }
        name={newLang.name}
        setName={(name: string) =>
          setNewLang((prev: WritingSystem) => ({ ...prev, name }))
        }
        font={newLang.font}
        setFont={(font: string) =>
          setNewLang((prev: WritingSystem) => ({ ...prev, font }))
        }
        setDir={(rtl: boolean) =>
          setNewLang((prev: WritingSystem) => ({
            ...prev,
            rtl: rtl || undefined,
          }))
        }
      />

      <IconButton
        data-testid={ProjectLanguagesId.ButtonAddAnalysisLangConfirm}
        disabled={!isNewLang}
        id={ProjectLanguagesId.ButtonAddAnalysisLangConfirm}
        onClick={() => addAnalysisWritingSystem()}
        size="large"
      >
        <Done />
      </IconButton>

      <IconButton
        data-testid={ProjectLanguagesId.ButtonAddAnalysisLangClear}
        id={ProjectLanguagesId.ButtonAddAnalysisLangClear}
        onClick={() => resetState()}
        size="large"
      >
        <Clear />
      </IconButton>
    </Grid2>
  );

  const vernacularLanguageDisplay = (): ReactElement => (
    <ImmutableWritingSystem
      ws={props.project.vernacularWritingSystem}
      buttons={
        props.readOnly ? (
          <Fragment />
        ) : (
          <IconButtonWithTooltip
            icon={<BorderColor fontSize="inherit" />}
            size="small"
            textId="projectSettings.language.changeName"
            onClick={() => setChangeVernName(true)}
            buttonId={ProjectLanguagesId.ButtonEditVernacularName}
          />
        )
      }
    />
  );

  const vernacularLanguageEditor = (): ReactElement => (
    <Stack spacing={1}>
      <NormalizedTextField
        autoFocus
        id={ProjectLanguagesId.FieldEditVernacularName}
        onBlur={() => {
          setChangeVernName(false);
          setNewVernName(props.project.vernacularWritingSystem.name);
        }}
        onChange={(e) => setNewVernName(e.target.value)}
        value={newVernName}
        variant="standard"
      />

      <Button
        data-testid={ProjectLanguagesId.ButtonEditVernacularNameSave}
        id={ProjectLanguagesId.ButtonEditVernacularNameSave}
        onClick={() => updateVernacularName()}
        onMouseDown={(e) => e.preventDefault()}
        variant="contained"
      >
        {t("buttons.save")}
      </Button>
    </Stack>
  );

  return (
    <>
      {/* Vernacular language */}
      <Typography variant="h6">
        {t("projectSettings.language.vernacular")}
      </Typography>
      {changeVernName
        ? vernacularLanguageEditor()
        : vernacularLanguageDisplay()}

      {/* Analysis languages */}
      <Typography style={{ marginTop: theme.spacing(1) }} variant="h6">
        {t("projectSettings.language.analysis")}
      </Typography>
      {props.project.analysisWritingSystems.map((writingSystem, index) => (
        <ImmutableWritingSystem
          key={index}
          ws={writingSystem}
          index={index}
          buttons={writingSystemButtons(index)}
        />
      ))}
      {!props.readOnly &&
        (add ? addAnalysisLangPicker() : addAnalysisLangButtons())}

      {/* Semantic domains language */}
      <SemanticDomainLanguage {...props} />
    </>
  );
}

interface ImmutableWritingSystemProps {
  ws: WritingSystem;
  index?: number;
  buttons?: ReactElement;
}

function ImmutableWritingSystem(
  props: ImmutableWritingSystemProps
): ReactElement {
  const { t } = useTranslation();

  const number = props.index === undefined ? "" : `${props.index + 1}. `;
  const wsText: string[] = [];
  if (props.ws.name) {
    wsText.push(`${t("projectSettings.language.name")}: ${props.ws.name}`);
  }
  wsText.push(`${t("projectSettings.language.bcp47")}: ${props.ws.bcp47}`);
  if (props.ws.font) {
    wsText.push(`${t("projectSettings.language.font")}: ${props.ws.font}`);
  }
  const text = number + wsText.join(", ");

  return (
    <Grid2 container spacing={1}>
      <Typography>{text}</Typography>
      {props.buttons}
    </Grid2>
  );
}

export function SemanticDomainLanguage(
  props: ProjectSettingProps
): ReactElement {
  const { t } = useTranslation();

  const setSemDomWritingSystem = async (lang: string): Promise<void> => {
    const semDomWritingSystem =
      semDomWritingSystems.find((ws) => ws.bcp47 === lang) ??
      newWritingSystem();
    await props
      .setProject({ ...props.project, semDomWritingSystem })
      .catch((err) => {
        console.error(err);
        toast.error(
          t("projectSettings.language.updateSemDomWritingSystemFailed")
        );
      });
  };

  return (
    <>
      <Typography style={{ marginTop: theme.spacing(1) }} variant="h6">
        {t("projectSettings.language.semanticDomains")}
      </Typography>
      {props.readOnly ? (
        props.project.semDomWritingSystem.bcp47 ? (
          <ImmutableWritingSystem ws={props.project.semDomWritingSystem} />
        ) : (
          <Typography>
            {t("projectSettings.language.semanticDomainsDefault")}
          </Typography>
        )
      ) : (
        <Select
          data-testid={ProjectLanguagesId.SelectSemDomLang}
          id={ProjectLanguagesId.SelectSemDomLang}
          onChange={(event: SelectChangeEvent<string>) =>
            setSemDomWritingSystem(event.target.value as string)
          }
          value={props.project.semDomWritingSystem.bcp47}
          variant="standard"
          /* Use `displayEmpty` and a conditional `renderValue` function to force
           * something to appear when the menu is closed and its value is "" */
          displayEmpty
          renderValue={
            props.project.semDomWritingSystem.bcp47
              ? undefined
              : () => t("projectSettings.language.semanticDomainsDefault")
          }
        >
          <MenuItem value={""}>
            {t("projectSettings.language.semanticDomainsDefault")}
          </MenuItem>
          {semDomWritingSystems.map((ws) => (
            <MenuItem key={ws.bcp47} value={ws.bcp47}>
              {`${ws.bcp47} (${ws.name})`}
            </MenuItem>
          ))}
        </Select>
      )}
    </>
  );
}
