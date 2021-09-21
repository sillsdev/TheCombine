import { Button, Grid, TextField } from "@material-ui/core";
import React, { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { Translate } from "react-localize-redux";

import { SiteBanner } from "api";
import * as backend from "backend";
import theme from "types/theme";

const idAffix = "site-settings-banner";

const defaultBanner = () => ({ login: "", announcement: "" });

export default function Banner(): ReactElement {
  const [banner, setBanner] = useState<SiteBanner>(defaultBanner());

  useEffect(() => {
    backend.getBanner().then(setBanner);
  }, []);

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

  const handleSaveClick = async () => {
    await backend.updateBanner(banner);
  };

  const handleResetClick = async () => {
    setBanner(defaultBanner());
    await backend.updateBanner(banner);
  };

  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12}>
          <TextField
            id={`${idAffix}-login`}
            variant="outlined"
            fullWidth
            multiline
            label={<Translate id="siteSettings.banners.loginBanner" />}
            value={banner.login}
            onChange={handleLoginOnChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            id={`${idAffix}-announcement`}
            variant="outlined"
            fullWidth
            multiline
            label={<Translate id="siteSettings.banners.announcementBanner" />}
            value={banner.announcement}
            onChange={handleAnnouncementOnChange}
          />
        </Grid>

        <Grid>
          <Button
            id={`${idAffix}-save`}
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSaveClick}
            style={{ margin: theme.spacing(1) }}
          >
            <Translate id="buttons.save" />
          </Button>
          <Button
            id={`${idAffix}-reset`}
            type="reset"
            variant="contained"
            onClick={handleResetClick}
            style={{ margin: theme.spacing(1) }}
          >
            <Translate id="buttons.reset" />
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
