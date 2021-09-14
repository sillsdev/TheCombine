import React, { useEffect, useState } from "react";
import { TextField, Toolbar } from "@material-ui/core";

import * as backend from "backend";
import { topBarHeight } from "components/LandingPage/TopBar";

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<string>("");

  useEffect(() => {
    const getBanner = async () => {
      const banner = await backend.getBanner();
      setBanner(banner.announcement);
    };
    getBanner();
  }, []);

  return (
    <React.Fragment>
      {banner !== "" && (
        <div style={{ marginTop: topBarHeight }}>
          <Toolbar style={{ background: "#ffc046" }}>
            <TextField
              id="login.banner"
              variant="outlined"
              multiline
              disabled
              style={{ width: "100%" }}
              value={banner}
            />
          </Toolbar>
        </div>
      )}
    </React.Fragment>
  );
}
