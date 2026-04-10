"use client";

import { useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Autocomplete, Box, Chip, InputAdornment, TextField } from "@mui/material";
import { statusLabel } from "@/lib/status";
import type { SearchOption } from "@/types/twin";

interface SearchBoxProps {
  options: SearchOption[];
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (option: SearchOption | null) => void;
}

export default function SearchBox({ options, query, onQueryChange, onSelect }: SearchBoxProps) {
  const sorted = useMemo(
    () => [...options].sort((a, b) => a.label.localeCompare(b.label)).slice(0, 80),
    [options]
  );

  return (
    <Autocomplete
      size="small"
      options={sorted}
      getOptionLabel={(option) => option.label}
      onChange={(_, value) => onSelect(value)}
      inputValue={query}
      onInputChange={(_, value) => onQueryChange(value)}
      sx={{ width: { xs: "100%", sm: 320 } }}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <span>{option.label}</span>
          <Chip label={statusLabel(option.status)} size="small" color={option.status === "ok" ? "primary" : "warning"} />
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search site / device / component"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
                {params.InputProps.startAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
}
