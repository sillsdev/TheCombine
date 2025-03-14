import { type AnimationOptions, animate } from "motion";
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
  height?: number;
  loading?: boolean;
}

// Opacity of the 3 images, each fading in then fading out while the next fades in.
const opacityKeyframes1 = [0, 0.5, 1, 1, 0.5, 0, 0, 0, 0, 0, 0, 0, 0];
const opacityKeyframes2 = [0, 0, 0, 0, 0.5, 1, 1, 0.5, 0, 0, 0, 0, 0];
const opacityKeyframes3 = [0, 0, 0, 0, 0, 0, 0, 0.5, 1, 1, 0.5, 0, 0];

/** A custom harvest-thresh-winnow image */
export default function HarvestThreshWinnow(
  props: HarvestThreshWinnowProps
): ReactElement {
  useEffect(() => {
    if (props.loading) {
      const options: AnimationOptions = {
        duration: 7,
        ease: "linear",
        repeat: Infinity,
      };
      animate(`#${ImageId.License}`, { opacity: opacityKeyframes1 }, options);
      animate(`#${ImageId.Harvest}`, { opacity: opacityKeyframes1 }, options);
      animate(`#${ImageId.Thresh}`, { opacity: opacityKeyframes2 }, options);
      animate(`#${ImageId.Winnow}`, { opacity: opacityKeyframes3 }, options);
    }
  }, [props.loading]);

  const imageSize = Math.min(
    0.75 * window.innerHeight,
    0.25 * window.innerWidth,
    props.height || 1000
  );

  const imageStyle: CSSProperties = {
    border: "1px solid black",
    borderRadius: imageSize,
    height: imageSize,
    position: "relative",
  };

  const overlap = 0.23;

  return (
    <div style={{ height: imageSize, position: "relative", margin: 10 }}>
      <img
        alt={ImageAlt.Harvest}
        id={ImageId.Harvest}
        src={harvest}
        style={{ ...imageStyle, insetInlineStart: overlap * imageSize }}
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
        style={{ ...imageStyle, insetInlineEnd: overlap * imageSize }}
      />
      <div
        id={ImageId.License}
        style={{
          // Use -10 to offset the button padding
          bottom: -10,
          insetInlineStart: 0.2 * imageSize - 10,
          position: "absolute",
        }}
      >
        <ImageAttributions images={imageMetadata} width={0.15 * imageSize} />
      </div>
    </div>
  );
}
