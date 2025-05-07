import { Button, Stack } from "@mui/material";
import { ChangeEvent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { BannerType } from "api/models";
import { getBannerText, updateBanner } from "backend";
import theme from "types/theme";
import { NormalizedTextField } from "utilities/fontComponents";

export default function Banners(): ReactElement {
  return (
    <Stack spacing={theme.spacing(6)}>
      {[BannerType.Announcement, BannerType.Login].map((type) => (
        <Banner key={type} type={type} />
      ))}
    </Stack>
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
    <Stack spacing={theme.spacing(2)}>
      <NormalizedTextField
        id={`${idAffix}-text`}
        variant="outlined"
        fullWidth
        multiline
        label={t(labelId(props.type))}
        value={text}
        onChange={handleOnChange}
        style={{ maxWidth: 500 }}
      />

      <Stack direction="row" spacing={theme.spacing(2)}>
        <Button
          id={`${idAffix}-save`}
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSaveClick}
        >
          {t("buttons.save")}
        </Button>

        <Button
          id={`${idAffix}-reset`}
          type="reset"
          variant="contained"
          onClick={handleResetClick}
        >
          {t("buttons.reset")}
        </Button>
      </Stack>
    </Stack>
  );
}
