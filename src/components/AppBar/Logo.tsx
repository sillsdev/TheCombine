import { Button, Theme, useMediaQuery } from "@mui/material";
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

import { buttonMinHeight } from "components/AppBar/AppBarTypes";
import logo from "resources/CombineLogoV1White.png";
import smallLogo from "resources/CombineSmallLogoV1.png";
import { Path } from "types/path";
import { themeColors } from "types/theme";

/** A button that redirects to the home page */
export default function Logo(): ReactElement {
  const isSmDown = useMediaQuery<Theme>((th) => th.breakpoints.down("sm"));
  const isMdDown = useMediaQuery<Theme>((th) => th.breakpoints.down("md"));
  const navigate = useNavigate();
  return (
    <Button
      id="logo-button"
      onClick={() => navigate(Path.ProjScreen)}
      style={{
        background: themeColors.lightShade,
        marginLeft: 2,
        marginRight: 2,
        minHeight: buttonMinHeight,
        minWidth: 0,
        padding: 2,
      }}
    >
      <img
        alt="Logo"
        height={isSmDown ? "20" : isMdDown ? "30" : "45"}
        src={isMdDown ? smallLogo : logo}
      />
    </Button>
  );
}
