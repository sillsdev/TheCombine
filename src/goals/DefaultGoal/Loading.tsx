import { Typography } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";
//import { Animated } from "react-native";

import tractor from "resources/tractor.png";

/**
 * A custom loading page.
 */
export default function Loading() {
  return (
    <React.Fragment>
      <Typography variant="h4" style={{ textAlign: "center" }}>
        <Translate id="generic.loadingTitle" />
      </Typography>
      <img
        src={tractor}
        alt="Tractor"
        style={{
          width: "50%",
          margin: "0% 25%",
        }}
      />
      <Typography variant="h5" style={{ textAlign: "center" }}>
        <Translate id="generic.loadingText" />
      </Typography>
    </React.Fragment>
  );
}

/*function MovingTractor() {
  const halfWidth = window.innerWidth * 0.75;
  const travelTime = 10000;
  const travelAnim = useRef(new Animated.Value(0)).current;
  const travelLeft = () => {
    Animated.timing(travelAnim, {
      toValue: -1 * halfWidth,
      duration: travelTime,
      useNativeDriver: true,
    }).start();
    setTimeout(travelReset, travelTime);
  };
  const travelReset = () => {
    Animated.timing(travelAnim, {
      toValue: halfWidth,
      duration: 0,
      useNativeDriver: true,
    }).start(travelLeft);
  };

  travelLeft();

  return (
    <Animated.View style={[{ transform: [{ translateX: travelAnim }] }]}>
      <img
        src={tractor}
        alt="Tractor"
        style={{
          width: "50%",
          margin: "0% 25%",
        }}
      />
    </Animated.View>
  );
}*/
