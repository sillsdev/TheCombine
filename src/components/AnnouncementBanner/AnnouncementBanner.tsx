import React, { useEffect, useState } from "react";
import { IconButton, TextField, Toolbar } from "@material-ui/core";
import { Cancel } from "@material-ui/icons";

import * as backend from "backend";
import { getClosedBanner, setClosedBanner } from "backend/localStorage";
import { topBarHeight } from "components/LandingPage/TopBar";
import { themeColors } from "types/theme";

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<string>("");

  useEffect(() => {
    const getBanner = async () => {
      const text = (await backend.getBanner()).announcement;
      if (text && text !== getClosedBanner()) {
        setBanner(text);
      }
    };
    getBanner();
  }, []);

  function closeBanner() {
    setClosedBanner(banner);
    setBanner("");
  }

  return (
    <React.Fragment>
      {banner !== "" && (
        <div style={{ marginTop: topBarHeight }}>
          <Toolbar>
            <IconButton onClick={closeBanner}>
              <Cancel />
            </IconButton>
            <TextField
              id="login.banner"
              variant="outlined"
              multiline
              disabled
              style={{ width: "100%", backgroundColor: themeColors.warn }}
              value={banner}
            />
          </Toolbar>
        </div>
      )}
    </React.Fragment>
  );
}
