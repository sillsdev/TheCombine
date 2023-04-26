import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

interface ProgressBarProps {
  value: number;
}

export default function LinearProgressWithLabel(props: ProgressBarProps) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: "flex", alignItems: "center", width: "50%" }}>
      <Box sx={{ width: "100%", m: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {t("statistics.percent", { val: Math.round(props.value) })}
        </Typography>
      </Box>
    </Box>
  );
}
