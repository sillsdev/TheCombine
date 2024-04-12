import { Box, Dialog, IconButton, Typography } from "@mui/material";
import { animate } from "motion";
import {
  type CSSProperties,
  type ReactElement,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import harvest from "resources/HTW1-harvest-Ethiopia.jpg";
import thresh from "resources/HTW2-thresh-Bangladesh.jpg";
import winnow from "resources/HTW3-winnow-India.jpg";
import by from "resources/cc-icons/by.svg";
import cc from "resources/cc-icons/cc.svg";
import sa from "resources/cc-icons/sa.svg";

enum LoadingImageAlt {
  Harvest = "Harvesting in Ethiopia",
  Thresh = "Threshing in Bangledesh",
  Winnow = "Winnowing in India",
}

enum LoadingImageId {
  Harvest = "loading-harvest",
  Thresh = "loading-thresh",
  Winnow = "loading-winnow",
}

/** A custom loading page */
export default function Loading(): ReactElement {
  const { t } = useTranslation();
  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Typography variant="h4">{t("generic.loadingTitle")}</Typography>
      <ImageSlider />
      <Typography variant="h5">{t("generic.loadingText")}</Typography>
    </Box>
  );
}

interface ImageSliderProps {
  maxSize?: number;
  minSize?: number;
}

// Give x/y positions of the 3 images (12 entries and a 13th matching the first)
// x: -1 is left, 1 is right; y: -1 is upper, 1 is lower
// 1st image starts in upper-left and slides first
const x1 = [-1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1];
const y1 = [-1, -1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1, -1];
// 2nd image stars in lower-left and slides second
const x2 = [-1, -1, -1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1];
const y2 = [1, 1, -1, -1, -1, -1, -1, -1, 1, 1, 1, 1, 1];
// 3rd image starts in lower-right and slides third
const x3 = [1, 1, 1, -1, -1, -1, -1, -1, -1, 1, 1, 1, 1];
const y3 = [1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, 1];

/** An image slider that use 3-images in a loading screen */
function ImageSlider(props: ImageSliderProps): ReactElement {
  const [imgAttributionDialogOpen, setImgAttributionDialogOpen] =
    useState(false);

  const maxSize = Math.min(
    0.8 * window.innerHeight,
    0.8 * window.innerWidth,
    props.maxSize || 1000
  );
  const double = Math.max(maxSize, props.minSize || 100);
  const half = double / 4;

  useEffect(() => {
    animate(
      `#${LoadingImageId.Harvest}`,
      { x: x1.map((v) => v * half), y: y1.map((v) => v * half) },
      { duration: 18, easing: "linear", repeat: Infinity }
    );
    animate(
      `#${LoadingImageId.Thresh}`,
      { x: x2.map((v) => v * half), y: y2.map((v) => v * half) },
      { duration: 18, easing: "linear", repeat: Infinity }
    );
    animate(
      `#${LoadingImageId.Winnow}`,
      { x: x3.map((v) => v * half), y: y3.map((v) => v * half) },
      { duration: 18, easing: "linear", repeat: Infinity }
    );
  }, [half]);

  const imageStyle: CSSProperties = { position: "absolute", width: 2 * half };

  return (
    <div style={{ height: double, position: "relative", width: double }}>
      <div style={{ position: "absolute", left: half - 30, top: half - 35 }}>
        <ImageAttributionsButton
          onClick={() => setImgAttributionDialogOpen(true)}
        />
      </div>
      <div style={{ position: "absolute", right: half - 30, top: half - 35 }}>
        <ImageAttributionsButton
          onClick={() => setImgAttributionDialogOpen(true)}
        />
      </div>
      <div style={{ position: "absolute", left: half - 30, bottom: half - 35 }}>
        <ImageAttributionsButton
          onClick={() => setImgAttributionDialogOpen(true)}
        />
      </div>
      <div
        style={{ position: "absolute", right: half - 30, bottom: half - 35 }}
      >
        <ImageAttributionsButton
          onClick={() => setImgAttributionDialogOpen(true)}
        />
      </div>
      <img
        alt={LoadingImageAlt.Harvest}
        id={LoadingImageId.Harvest}
        src={harvest}
        style={{ ...imageStyle, left: half, top: half }}
      />
      <img
        alt={LoadingImageAlt.Thresh}
        id={LoadingImageId.Thresh}
        src={thresh}
        style={{ ...imageStyle, left: half, bottom: half }}
      />
      <img
        alt={LoadingImageAlt.Winnow}
        id={LoadingImageId.Winnow}
        src={winnow}
        style={{ ...imageStyle, left: half, top: half }}
      />
      <Dialog
        open={imgAttributionDialogOpen}
        onClose={() => setImgAttributionDialogOpen(false)}
      >
        <ImageAttribution
          name="Ethiopia Farmers Harvest Teff"
          nameHref="https://commons.wikimedia.org/wiki/File:Ethiopia-farmers-harvest-teff.jpg"
          by="Esayas Ayele"
          license="CC BY-SA 4.0"
          licenseHref="https://creativecommons.org/licenses/by-sa/4.0/"
          cropped
        />
        <ImageAttribution
          name="Farmers Threshing Rice Crops"
          nameHref="https://www.pexels.com/photo/farmers-threshing-rice-crops-9487554/"
          by="Imam Hossain"
          byHref="https://www.pexels.com/@imam-hossain-95404804/"
          license="Pexels license"
          licenseHref="https://www.pexels.com/license/"
          cropped
        />
        <ImageAttribution
          name="Woman Holding a Winnowing Basket with Grains"
          nameHref="https://www.pexels.com/photo/woman-holding-a-winnowing-basket-with-grains-11398292/"
          by="Mehmet Turgut Kirkgoz"
          byHref="https://www.pexels.com/@tkirkgoz/"
          license="Pexels license"
          licenseHref="https://www.pexels.com/license/"
          cropped
        />
      </Dialog>
    </div>
  );
}

interface ImageAttributionProps {
  name: string;
  nameHref?: string;
  by: string;
  byHref?: string;
  license: string;
  licenseHref?: string;
  cropped?: boolean;
}

/** Typography with attribution info and links for an image */
function ImageAttribution(props: ImageAttributionProps): ReactElement {
  const nameLink = props.nameHref ? (
    <a href={props.nameHref} rel="noreferrer" target="_blank">
      {props.name}
    </a>
  ) : (
    props.name
  );
  const byLink = props.byHref ? (
    <a href={props.byHref} rel="noreferrer" target="_blank">
      {props.by}
    </a>
  ) : (
    props.by
  );
  const licenseLink = props.licenseHref ? (
    <a href={props.licenseHref} rel="noreferrer" target="_blank">
      {props.license}
    </a>
  ) : (
    props.license
  );
  return (
    <Typography>
      {'"'}
      {nameLink}
      {'" by '}
      {byLink}
      {props.cropped ? ", cropped" : ""}
      {", "}
      {licenseLink}
    </Typography>
  );
}

/** Icon button for image attributions */
function ImageAttributionsButton(props: { onClick: () => void }): ReactElement {
  return (
    <IconButton aria-label="show image attribution" onClick={props.onClick}>
      <ImageAttributionsIcon />
    </IconButton>
  );
}

/** Custom cc-by-sa icon */
function ImageAttributionsIcon(): ReactElement {
  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <img alt="CreativeCommons" src={cc} style={{ width: 40 }} />
      <div style={{ marginTop: -4 }}>
        <img alt="Attribution" src={by} style={{ width: 30 }} />
        <img alt="ShareAlike" src={sa} style={{ width: 30 }} />
      </div>
    </Box>
  );
}
