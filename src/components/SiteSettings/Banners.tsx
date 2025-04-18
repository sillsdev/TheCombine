import { Button, Grid } from "@mui/material";
import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { BannerType } from "api/models";
import { getBannerText, updateBanner } from "backend";
import theme from "types/theme";
import { NormalizedTextField } from "utilities/fontComponents";

export default function Banners(): ReactElement {
  return (
    <>
      {[BannerType.Announcement, BannerType.Login].map((type) => (
        <Banner key={type} type={type} />
      ))}
    </>
  );
}

interface BannerProps {
  type: BannerType;
}

function Banner(props: BannerProps): ReactElement {
  const idAffix = `site-settings-banner-${props.type}`;
  const [text, setText] = useState<string>("");
  const { t } = useTranslation();

  useEffect(() => {
    getBannerText(props.type).then(setText);
  }, [props.type]);

  const handleOnChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    setText(e.target.value);
  };

  const handleSaveClick = async (): Promise<void> => {
    await updateBanner({ type: props.type, text });
  };

  const handleResetClick = async (): Promise<void> => {
    await updateBanner({ type: props.type, text: "" });
    setText("");
  };

  const labelId = (type: BannerType): string => {
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
        <NormalizedTextField
          id={`${idAffix}-text`}
          variant="outlined"
          fullWidth
          multiline
          label={t(labelId(props.type))}
          value={text}
          onChange={handleOnChange}
          style={{ minWidth: 300 }}
        />
      </Grid>

      <Grid item>
        <Button
          id={`${idAffix}-save`}
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSaveClick}
        >
          {t("buttons.save")}
        </Button>
      </Grid>

      <Grid item>
        <Button
          id={`${idAffix}-reset`}
          type="reset"
          variant="contained"
          onClick={handleResetClick}
        >
          {t("buttons.reset")}
        </Button>
      </Grid>
    </Grid>
  );
}
