import { Box, IconButton, Typography } from "@mui/material";
import { animate } from "motion";
import { type CSSProperties, type ReactElement, useEffect } from "react";
import { useTranslation } from "react-i18next";

import harvest from "resources/HTW1-harvest-Ethiopia.jpg";
import thresh from "resources/HTW2-thresh-Bangladesh.jpg";
import winnow from "resources/HTW3-winnow-India.jpg";

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
      flexDirection="column"
      display="flex"
      justifyContent="center"
      alignItems="center"
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
// Attribution button starts in upper-right and goes CCW every step
const xA = [1, -1, -1, 1, 1, -1, -1, 1, 1, -1, -1, 1, 1];
const yA = [-1, -1, 1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1];

/** An image slider that use 3-images in a loading screen */
function ImageSlider(props: ImageSliderProps): ReactElement {
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
    </div>
  );
}

function ImageAttributionsButton(): ReactElement {
  return (
    <>
      <IconButton aria-label="show image attribution"></IconButton>
    </>
  );
}
