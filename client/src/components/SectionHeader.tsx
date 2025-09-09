import * as React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

export type SectionHeaderProps = {
  /** Hlavní nadpis uprostřed */
  title: string;
  /** Podtitul (např. "Týden 36 (2.–8. září 2025)") */
  subtitle?: string;
  /** Navigace šipkami */
  onPrev?: () => void;
  onNext?: () => void;
  /** Zneaktivnění šipek (např. mimo rozsah) */
  disablePrev?: boolean;
  disableNext?: boolean;
  /** Lepicí header s blur pozadím */
  sticky?: boolean;
  /** Offset shora (když máš top navbar) – např. 0, 8, 64… */
  stickyOffset?: number;
  /** Kompaktnější vertikální padding */
  compact?: boolean;
  /** Aktivovat hotkeys ←/→ (default: true) */
  enableHotkeys?: boolean;
  /** Tooltipy nad šipkami */
  prevTooltip?: string;
  nextTooltip?: string;
};

export default function SectionHeader({
  title,
  subtitle,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
  sticky = true,
  stickyOffset = 0,
  compact = false,
  enableHotkeys = true,
  prevTooltip = "Předchozí",
  nextTooltip = "Další",
}: SectionHeaderProps) {
  const theme = useTheme();

  // Klávesové zkratky ←/→
  React.useEffect(() => {
    if (!enableHotkeys) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName?.match(/input|textarea|select/i)) return;
      if (e.key === "ArrowLeft" && onPrev && !disablePrev) { e.preventDefault(); onPrev(); }
      if (e.key === "ArrowRight" && onNext && !disableNext) { e.preventDefault(); onNext(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enableHotkeys, onPrev, onNext, disablePrev, disableNext]);

  return (
    <Box
      sx={{
        position: sticky ? "sticky" : "relative",
        top: sticky ? stickyOffset : "auto",
        zIndex: 5,
        backdropFilter: sticky ? "saturate(180%) blur(10px)" : "none",
        backgroundColor: sticky ? "var(--lm-surface)" : "transparent",
        borderBottom: sticky ? "1px solid var(--color-border)" : "none",
        borderRadius: 3,
        boxShadow: sticky ? "var(--lm-shadow-1)" : "none",
        px: { xs: 1.5, sm: 2 },
        py: compact ? { xs: 0.75, sm: 1 } : { xs: 1.25, sm: 1.75 },
        mb: 2,
      }}
    >

      {/* Grid: [levá šipka] [středový titul] [pravá šipka] */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 1,
        }}
      >
        {/* Levá šipka */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
          {onPrev && (
            <Tooltip title={prevTooltip}>
              <span>
                <IconButton
                  aria-label="Předchozí"
                  onClick={onPrev}
                  disabled={disablePrev}
                  size="medium"
                  sx={{
                    borderRadius: 2,
                    color: "var(--color-text-muted)",
                    "&.Mui-disabled": { opacity: 0.5 }
                  }}
                >
                  <ChevronLeftRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>

        {/* Střed – titul a podtitul, centrované */}
        <Box sx={{ textAlign: "center", minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: 0.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={title}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={subtitle}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Pravá šipka */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          {onNext && (
            <Tooltip title={nextTooltip}>
              <span>
                <IconButton
                  aria-label="Další"
                  onClick={onNext}
                  disabled={disableNext}
                  size="medium"
                  sx={{
                    borderRadius: 2,
                    color: "var(--color-text-muted)",
                    "&.Mui-disabled": { opacity: 0.5 }
                  }}
                >
                  <ChevronRightRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
}
