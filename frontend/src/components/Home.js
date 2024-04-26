import React, {Component, useContext, useEffect, useState} from "react";
import { Box, Button, CircularProgress, Container, Paper, Typography } from "@mui/material";
import FileUploadButton from "./FileUploadButton";
import { getCSRF } from "../utils";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    const [isLoadingFile, setLoadingFile] = useState(false);

    const handleFileChange = (event) => {
        console.log(event.target.files[0]);
        if (event.target.files[0]) {
            setLoadingFile(true);
            const data = new FormData();
            data.append(
                'file', 
                event.target.files[0],
                event.target.files[0].name
            );
            fetch('/api/upload/', {
                method: 'POST',
                headers: {"X-CSRFToken": getCSRF()},
                body: data
            })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                alert("Ошибка при загрузке на сервер.");
                return {};
            })
            .then((data) => {
                console.log("FILE LOADED", data);
                setLoadingFile(false);
                if (data.hash_id) {
                    navigate("/view/" + data.hash_id + "/");
                }
            })
            .catch((err) => {
                console.log("err:");
                console.log(err);
            });
        }
      }

    return (
        <React.Fragment>
            <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography variant="h2" align="center">
                        Найти лица
                    </Typography>
                    <Box>
                        { !isLoadingFile && (
                            <Box sx={{mt: 4}}>
                                <FileUploadButton
                                label="Выбрать архив" accept=".zip"
                                handleFileChange={handleFileChange}
                                
                                />
                            </Box>
                        )}
                        
                        { isLoadingFile && (
                            <CircularProgress />
                        )}
                    </Box>
                </Paper>
            </Container>
        </React.Fragment>
    );
}