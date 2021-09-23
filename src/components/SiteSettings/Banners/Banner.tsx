import { Button, Grid, TextField } from "@material-ui/core";
import React, { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { Translate } from "react-localize-redux";

import { BannerType } from "api/models";
import { getBanner, updateBanner } from "backend";
import theme from "types/theme";

const idAffix = "site-settings-banner";

export default function Banner(): ReactElement {
  const [announcement, setAnnouncement] = useState<string>("");
  const [login, setLogin] = useState<string>("");

  useEffect(() => {
    getBanner(BannerType.Announcement).then((banner) =>
      setAnnouncement(banner.text)
    );
    getBanner(BannerType.Login).then((banner) => setLogin(banner.text));
  }, []);

  const handleLoginOnChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setLogin(e.target.value);
  };

  const handleAnnouncementOnChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setAnnouncement(e.target.value);
  };

  const handleSaveClick = async () => {
    await updateBanner({ type: BannerType.Announcement, text: announcement });
    await updateBanner({ type: BannerType.Login, text: login });
  };

  const handleResetClick = async () => {
    await updateBanner({ type: BannerType.Announcement, text: "" });
    setAnnouncement("");
    await updateBanner({ type: BannerType.Login, text: "" });
    setLogin("");
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
            value={login}
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
            value={announcement}
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
