import { type AnimationOptionsWithOverrides, animate } from "motion";
import {
  type CSSProperties,
  type ReactElement,
  useEffect,
  useState,
} from "react";

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
  loading?: boolean;
  maxSize?: number;
}

// Opacity of the 3 images for fading in separately then out separately
const opacityA1 = [0, 1, 1, 1, 0, 0, 0];
const opacityA2 = [0, 0, 1, 1, 1, 0, 0];
const opacityA3 = [0, 0, 0, 1, 1, 1, 0];

// Opacity of the 3 images for fading in and out separately
const opacityB1 = [0, 0.5, 1, 1, 0.5, 0, 0, 0, 0, 0, 0, 0, 0];
const opacityB2 = [0, 0, 0, 0, 0.5, 1, 1, 0.5, 0, 0, 0, 0, 0];
const opacityB3 = [0, 0, 0, 0, 0, 0, 0, 0.5, 1, 1, 0.5, 0, 0];

/** A custom harvest-thresh-winnow image */
export default function HarvestThreshWinnow(
  props: HarvestThreshWinnowProps
): ReactElement {
  const [fadeOutSeparate, setFadeOutSeparate] = useState(false);

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
        { opacity: fadeOutSeparate ? opacityB1 : opacityA1 },
        options
      );
      animate(
        `#${ImageId.Harvest}`,
        { opacity: fadeOutSeparate ? opacityB1 : opacityA1 },
        options
      );
      animate(
        `#${ImageId.Thresh}`,
        { opacity: fadeOutSeparate ? opacityB2 : opacityA2 },
        options
      );
      animate(
        `#${ImageId.Winnow}`,
        { opacity: fadeOutSeparate ? opacityB3 : opacityA3 },
        options
      );
    }
  }, [fadeOutSeparate, props.loading]);

  const imageStyle: CSSProperties = {
    border: "1px solid black",
    borderRadius: size,
    position: "relative",
    width: size,
  };

  const overlap = 0.23;

  return (
    <div style={{ height: size, position: "relative", margin: 10 }}>
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
        onClick={() => setFadeOutSeparate(!fadeOutSeparate)}
        src={winnow}
        style={{ ...imageStyle, right: overlap * size, zIndex: 2 }}
      />
      <div
        id={ImageId.License}
        style={{
          // Use -10 to offset the button padding
          bottom: -10,
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
