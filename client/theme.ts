"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    cssVariables: true, // support Dark Mode dễ hơn
    palette: {
        primary: {
            main: "#1976d2",
        },
    },
});

export default theme;
