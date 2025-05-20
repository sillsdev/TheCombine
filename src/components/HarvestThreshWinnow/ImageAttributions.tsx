import { Dialog, IconButton, Typography } from "@mui/material";
import { type ReactElement, useState } from "react";

import { copyright } from "resources/htw";

export interface ImageMetadata {
  name: string;
  nameHref?: string;
  by: string;
  byHref?: string;
  license: string;
  licenseHref?: string;
  cropped?: boolean;
}

interface ImageAttributionsButtonProps {
  images: ImageMetadata[];
  width?: number;
}

/** Icon button for image attributions (assumes CC BY-SA) */
export default function ImageAttributionsButton(
  props: ImageAttributionsButtonProps
): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton
        aria-label="show image attribution"
        onClick={() => setOpen(true)}
      >
        <img
          alt="CreativeCommons-Attribution-ShareAlike"
          src={copyright}
          style={{ width: props.width || 60 }}
        />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        {props.images.map((image, index) => (
          <ImageAttribution key={index} {...image} />
        ))}
      </Dialog>
    </>
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
      {'• "'}
      {nameLink}
      {'" by '}
      {byLink}
      {props.cropped ? ", cropped" : ""}
      {", "}
      {licenseLink}
    </Typography>
  );
}
