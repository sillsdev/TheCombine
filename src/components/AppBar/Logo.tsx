import { Button, Theme, useMediaQuery } from "@mui/material";
import { ReactElement } from "react";
import { useNavigate } from "react-router";

import { buttonMinHeight } from "components/AppBar/AppBarTypes";
import { small, white } from "resources/logo";
import { Path } from "types/path";
import { themeColors } from "types/theme";

const logoButtonId = "logo-button";
export const logoButtonLabel = "The Combine - return home";

/** A button that redirects to the home page */
export default function Logo(): ReactElement {
  const isSmDown = useMediaQuery<Theme>((th) => th.breakpoints.down("sm"));
  const isMdDown = useMediaQuery<Theme>((th) => th.breakpoints.down("md"));
  const navigate = useNavigate();
  return (
    <Button
      aria-label={logoButtonLabel}
      id={logoButtonId}
      onClick={() => navigate(Path.ProjScreen)}
      style={{
        background: themeColors.lightShade,
        marginInline: 2,
        minHeight: buttonMinHeight,
        minWidth: 0,
        padding: 2,
      }}
    >
      <img
        alt="Logo"
        height={isSmDown ? "20" : isMdDown ? "30" : "45"}
        src={isMdDown ? small : white}
      />
    </Button>
  );
}
