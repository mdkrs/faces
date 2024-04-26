import React, {Component, useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Home from "./Home";
import Viewer from "./Viewer";
import NotFoundPage from "./NotFoundPage";

export default function App(props) {
    const prefersDarkMode = true;
    const theme = React.useMemo(
        () =>
            createTheme({
            palette: {
                mode: prefersDarkMode ? 'dark' : 'light',
            },
            }),
        [prefersDarkMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
                <Route path="/view/:id" element={<Viewer></Viewer>}/>
                <Route exact path="" element={<Home></Home>}/>
                <Route path="*" element={<NotFoundPage/>}/>
            </Routes>
        </ThemeProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
    <React.StrictMode>
        <Router>
            <App />
        </Router>
    </React.StrictMode>
  );