"use client";

import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { AppBar, Box, Button, MenuItem, Select, Toolbar, Typography } from "@mui/material";
import SearchBox from "@/components/ui/SearchBox";
import type { SearchOption, StatusFilter } from "@/types/twin";

interface HeaderBarProps {
  options: SearchOption[];
  searchQuery: string;
  statusFilter: StatusFilter;
  onSearchQueryChange: (query: string) => void;
  onSearchSelect: (option: SearchOption | null) => void;
  onStatusFilterChange: (filter: StatusFilter) => void;
}

export default function HeaderBar({
  options,
  searchQuery,
  statusFilter,
  onSearchQueryChange,
  onSearchSelect,
  onStatusFilterChange
}: HeaderBarProps) {
  const architecturePdfHref =
    "/architecture-concept-and-roadmap-for-a-digital-twinning-solution.pdf";

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        sx={{
          minHeight: { xs: "auto !important", md: "72px !important" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: { xs: 1.2, md: 2 },
          py: { xs: 1.2, md: 0 }
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              lineHeight: 1.2,
              fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.2rem" },
              pr: { md: 2 }
            }}
          >
            Digital Twinning Solution Architecture
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: 0.2, display: "block", mt: 0.2 }}
          >
            <Box
              component="a"
              href="https://www.linkedin.com/in/thomas-roche/"
              target="_blank"
              rel="noreferrer"
              sx={{
                color: "inherit",
                textDecoration: "none",
                borderBottom: "1px solid transparent",
                transition: "border-color 0.2s ease, color 0.2s ease",
                "&:hover": {
                  color: "text.primary",
                  borderColor: "currentColor"
                }
              }}
            >
              Thomas Roche
            </Box>{" "}
            | Interactive architecture concept
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: { xs: "100%", md: "auto" },
            flexWrap: "wrap"
          }}
        >
          <SearchBox
            options={options}
            query={searchQuery}
            onQueryChange={onSearchQueryChange}
            onSelect={onSearchSelect}
          />
          <Select
            size="small"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as StatusFilter)}
            sx={{ minWidth: { xs: "100%", sm: 130 } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="warnings">Warnings</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </Select>
          <Button
            component="a"
            href={architecturePdfHref}
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            startIcon={<PictureAsPdfRoundedIcon />}
            endIcon={<OpenInNewRoundedIcon />}
            sx={{
              minWidth: { xs: "100%", sm: "auto" },
              borderColor: "divider",
              color: "text.primary",
              bgcolor: "rgba(255, 255, 255, 0.02)",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "rgba(0, 153, 153, 0.08)"
              }
            }}
          >
            View concept PDF
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
