import { type AnimationOptionsWithOverrides, animate } from "motion";
import { type CSSProperties, type ReactElement, useEffect } from "react";

import ImageAttributions, {
  ImageMetadata,
} from "components/HarvestThreshWinnow/ImageAttributions";
import harvest from "resources/HTW1-harvest-Ethiopia.jpg";
import thresh from "resources/HTW2-thresh-Bangladesh.jpg";
import winnow from "resources/HTW3-winnow-India.jpg";

enum ImageAlt {
  License = "CC BY-SA 4.0 license",
  Harvest = "Harvesting in Ethiopia",
  Thresh = "Threshing in Bangladesh",
  Winnow = "Winnowing in India",
}

enum ImageId {
  License = "image-license",
  Harvest = "harvest-image",
  Thresh = "thresh-image",
  Winnow = "winnow-image",
}

const harvestMetadata: ImageMetadata = {
  name: "Ethiopia Farmers Harvest Teff",
  nameHref:
    "https://commons.wikimedia.org/wiki/File:Ethiopia-farmers-harvest-teff.jpg",
  by: "Esayas Ayele",
  license: "CC BY-SA 4.0",
  licenseHref: "https://creativecommons.org/licenses/by-sa/4.0/",
  cropped: true,
};

const threshMetadata: ImageMetadata = {
  name: "Farmers Threshing Rice Crops",
  nameHref:
    "https://www.pexels.com/photo/farmers-threshing-rice-crops-9487554/",
  by: "Imam Hossain",
  byHref: "https://www.pexels.com/@imam-hossain-95404804/",
  license: "Pexels license",
  licenseHref: "https://www.pexels.com/license/",
  cropped: true,
};

const winnowMetadata: ImageMetadata = {
  name: "Woman Holding a Winnowing Basket with Grains",
  nameHref:
    "https://www.pexels.com/photo/woman-holding-a-winnowing-basket-with-grains-11398292/",
  by: "Mehmet Turgut Kirkgoz",
  byHref: "https://www.pexels.com/@tkirkgoz/",
  license: "Pexels license",
  licenseHref: "https://www.pexels.com/license/",
  cropped: true,
};

interface HarvestThreshWinnowProps {
  fadeOutSeparate?: boolean;
  loading?: boolean;
  maxSize?: number;
}

// Opacity of the 3 images for fading in separately then out together
const opacityA1 = [0, 0.5, 1, 1, 1, 1, 1, 1, 0, 0];
const opacityA2 = [0, 0, 0, 0.5, 1, 1, 1, 1, 0, 0];
const opacityA3 = [0, 0, 0, 0, 0, 0.5, 1, 1, 0, 0];

// Opacity of the 3 images for fading in separately then out separately
const opacityB1 = [0, 1, 1, 1, 0, 0, 0];
const opacityB2 = [0, 0, 1, 1, 1, 0, 0];
const opacityB3 = [0, 0, 0, 1, 1, 1, 0];

// Opacity of the 3 images for fading in and out separately
const opacityC1 = [0, 0.5, 1, 1, 0.5, 0, 0, 0, 0, 0, 0, 0, 0];
const opacityC2 = [0, 0, 0, 0, 0.5, 1, 1, 0.5, 0, 0, 0, 0, 0];
const opacityC3 = [0, 0, 0, 0, 0, 0, 0, 0.5, 1, 1, 0.5, 0, 0];

/** A custom harvest-thresh-winnow image */
export default function HarvestThreshWinnow(
  props: HarvestThreshWinnowProps
): ReactElement {
  const size = Math.min(
    0.75 * window.innerHeight,
    0.25 * window.innerWidth,
    props.maxSize || 1000
  );

  useEffect(() => {
    const options: AnimationOptionsWithOverrides = {
      duration: 7,
      easing: "linear",
      repeat: Infinity,
    };
    if (props.loading) {
      animate(
        `#${ImageId.License}`,
        { opacity: props.fadeOutSeparate ? opacityC1 : opacityB1 },
        options
      );
      animate(
        `#${ImageId.Harvest}`,
        { opacity: props.fadeOutSeparate ? opacityC1 : opacityB1 },
        options
      );
      animate(
        `#${ImageId.Thresh}`,
        { opacity: props.fadeOutSeparate ? opacityC2 : opacityB2 },
        options
      );
      animate(
        `#${ImageId.Winnow}`,
        { opacity: props.fadeOutSeparate ? opacityC3 : opacityB3 },
        options
      );
    }
  }, [props.fadeOutSeparate, props.loading]);

  const imageStyle: CSSProperties = {
    border: "1px solid black",
    borderRadius: size,
    position: "relative",
    width: size,
  };

  const whiteCircleStyle: CSSProperties = {
    backgroundColor: "white",
    border: "1px solid white",
    borderRadius: size,
    height: size,
    position: "absolute",
    width: size,
  };

  const overlap = 0.23;

  return (
    <div style={{ height: size, position: "relative", margin: 10 }}>
      {/*props.fadeOutSeparate || (
        <div
          style={{
            ...whiteCircleStyle,
            right: (1 - overlap) * size,
            zIndex: -1,
          }}
        />
      )}
      {props.fadeOutSeparate || (
        <div
          style={{ ...whiteCircleStyle, right: overlap * size, zIndex: 1 }}
        />
      )*/}
      <img
        alt={ImageAlt.Harvest}
        id={ImageId.Harvest}
        src={harvest}
        style={{ ...imageStyle, left: overlap * size, zIndex: -2 }}
      />
      <img
        alt={ImageAlt.Thresh}
        id={ImageId.Thresh}
        src={thresh}
        style={{ ...imageStyle }}
      />
      <img
        alt={ImageAlt.Winnow}
        id={ImageId.Winnow}
        src={winnow}
        style={{ ...imageStyle, right: overlap * size, zIndex: 2 }}
      />
      <div
        id={ImageId.License}
        style={{
          bottom: -10, // The -10 offsets the button padding
          left: 0.2 * size - 10,
          position: "absolute",
        }}
      >
        <ImageAttributions
          images={[harvestMetadata, threshMetadata, winnowMetadata]}
          width={0.15 * size}
        />
      </div>
    </div>
  );
}
