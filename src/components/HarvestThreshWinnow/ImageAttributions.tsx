import { Box, Dialog, IconButton, Typography } from "@mui/material";
import { type ReactElement, useState } from "react";

import by from "resources/cc-icons/by.svg";
import cc from "resources/cc-icons/cc.svg";
import sa from "resources/cc-icons/sa.svg";

export interface ImageMetadata {
  name: string;
  nameHref?: string;
  by: string;
  byHref?: string;
  license: string;
  licenseHref?: string;
  cropped?: boolean;
}

/** Icon button for image attributions */
export default function ImageAttributionsButton(props: {
  images: ImageMetadata[];
}): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton
        aria-label="show image attribution"
        onClick={() => setOpen(true)}
      >
        <CCBYSAIcon />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        {props.images.map((image, index) => (
          <ImageAttribution key={index} {...image} />
        ))}
      </Dialog>
    </>
  );
}

/** Custom cc-by-sa icon */
function CCBYSAIcon(): ReactElement {
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

/** Typography with attribution info and links for an image */
function ImageAttribution(props: ImageMetadata): ReactElement {
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
