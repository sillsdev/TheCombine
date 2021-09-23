import { Button, Grid, TextField } from "@material-ui/core";
import React, { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { Translate } from "react-localize-redux";

import { BannerType } from "api/models";
import { getBannerText, updateBanner } from "backend";
import theme from "types/theme";

export default function Banners(): ReactElement {
  return (
    <React.Fragment>
      {[BannerType.Announcement, BannerType.Login].map((type) => (
        <Banner key={type} type={type} />
      ))}
    </React.Fragment>
  );
}

interface BannerProps {
  type: BannerType;
}

function Banner(props: BannerProps): ReactElement {
  const idAffix = `site-settings-banner-${props.type}`;
  const [text, setText] = useState<string>("");

  useEffect(() => {
    getBannerText(props.type).then(setText);
  }, [props.type]);

  const handleOnChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setText(e.target.value);
  };

  const handleSaveClick = async () => {
    await updateBanner({ type: props.type, text });
  };

  const handleResetClick = async () => {
    await updateBanner({ type: props.type, text: "" });
    setText("");
  };

  const labelId = (type: BannerType) => {
    switch (type) {
      case BannerType.Announcement:
        return "siteSettings.banners.announcementBanner";
      case BannerType.Login:
        return "siteSettings.banners.loginBanner";
      default:
        throw new Error();
    }
  };

  return (
    <Grid
      container
      spacing={2}
      alignItems="center"
      style={{ marginBottom: theme.spacing(1) }}
    >
      <Grid item xs={12} sm={8}>
        <TextField
          id={`${idAffix}-text`}
          variant="outlined"
          fullWidth
          multiline
          label={<Translate id={labelId(props.type)} />}
          value={text}
          onChange={handleOnChange}
          style={{ minWidth: 300 }}
        />
      </Grid>

      <Grid item sm={2}>
        <Button
          id={`${idAffix}-save`}
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSaveClick}
        >
          <Translate id="buttons.save" />
        </Button>
      </Grid>

      <Grid item sm={2}>
        <Button
          id={`${idAffix}-reset`}
          type="reset"
          variant="contained"
          onClick={handleResetClick}
        >
          <Translate id="buttons.reset" />
        </Button>
      </Grid>
    </Grid>
  );
}
