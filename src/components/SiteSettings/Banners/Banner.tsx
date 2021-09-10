import React, { ChangeEvent, ReactElement, useState } from "react";
import { Button, Grid, TextField } from "@material-ui/core";
import { AddAlert, ExitToApp } from "@material-ui/icons";

import { SiteBanner } from "api";
import { Translate } from "react-localize-redux";

export default function Banner(): ReactElement {
  const [banner, setBanner] = useState<SiteBanner>({
    login: "Login",
    announcement: "Announcement",
  });

  const handleLoginOnChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setBanner({ ...banner, login: e.target.value });
  };

  const handleAnnouncementOnChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setBanner({ ...banner, announcement: e.target.value });
  };

  return (
    <React.Fragment>
      <Grid item container spacing={1} alignItems="center">
        <Grid item>
          <ExitToApp />
        </Grid>
        <Grid item xs>
          <TextField
            id="site-settings-banner-login"
            variant="outlined"
            label={<Translate id="siteSettings.banners.loginBanner" />}
            onChange={handleLoginOnChange}
            multiline
            value={banner.login}
          />
        </Grid>
      </Grid>

      <Grid item container spacing={1} alignItems="center">
        <Grid item>
          <AddAlert />
        </Grid>
        <Grid item xs>
          <TextField
            id="site-settings-banner-announcement"
            variant="outlined"
            label={<Translate id="siteSettings.banners.announcementBanner" />}
            onChange={handleAnnouncementOnChange}
            multiline
            value={banner.announcement}
          />
        </Grid>
      </Grid>
      <Grid item container justifyContent="flex-end">
        <Button
          type="submit"
          variant="contained"
          id="site-settings-banner-save"
        >
          <Translate id="buttons.save" />
        </Button>
      </Grid>
    </React.Fragment>
  );
}
