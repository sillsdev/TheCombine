import { type AnimationOptionsWithOverrides, animate } from "motion";
import { type CSSProperties, type ReactElement, useEffect } from "react";

import ImageAttributions, {
  ImageMetadata,
} from "components/HarvestThreshWinnow/ImageAttributions";
import imageLicenses from "resources/HTW-licenses.json";
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

const imageMetadata: ImageMetadata[] = [
  imageLicenses.harvest,
  imageLicenses.thresh,
  imageLicenses.winnow,
];

interface HarvestThreshWinnowProps {
  loading?: boolean;
  maxSize?: number;
}

// Opacity of the 3 images, each fading in then fading out while the next fades in.
const opacity1 = [0, 0.5, 1, 1, 0.5, 0, 0, 0, 0, 0, 0, 0, 0];
const opacity2 = [0, 0, 0, 0, 0.5, 1, 1, 0.5, 0, 0, 0, 0, 0];
const opacity3 = [0, 0, 0, 0, 0, 0, 0, 0.5, 1, 1, 0.5, 0, 0];

/** A custom harvest-thresh-winnow image */
export default function HarvestThreshWinnow(
  props: HarvestThreshWinnowProps
): ReactElement {
  useEffect(() => {
    if (props.loading) {
      const opacity = [opacity1, opacity1, opacity2, opacity3];
      const options: AnimationOptionsWithOverrides = {
        duration: 7,
        easing: "linear",
        repeat: Infinity,
      };
      animate(`#${ImageId.License}`, { opacity: opacity[0] }, options);
      animate(`#${ImageId.Harvest}`, { opacity: opacity[1] }, options);
      animate(`#${ImageId.Thresh}`, { opacity: opacity[2] }, options);
      animate(`#${ImageId.Winnow}`, { opacity: opacity[3] }, options);
    }
  }, [props.loading]);

  const size = Math.min(
    0.75 * window.innerHeight,
    0.25 * window.innerWidth,
    props.maxSize || 1000
  );

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
        style={{ ...imageStyle, left: overlap * size }}
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
        style={{ ...imageStyle, right: overlap * size }}
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
        <ImageAttributions images={imageMetadata} width={0.15 * size} />
      </div>
    </div>
  );
}
