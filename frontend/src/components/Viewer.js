import { Button, Container, Grid, Paper } from "@mui/material";
import React, {Component, useContext, useEffect, useState} from "react";
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ImageViewer from "./ImageViewer";
import { useParams } from "react-router-dom";
import { buildGraph, buildNodes, groupFaces } from "../utils";
import PersonFolder from "./PersonFolder";


export default function Viewer() {
    const {id} = useParams();
    const [images, setImages] = useState([]);
    const [accuracy, setAccuracy] = useState(1.36);
    const [gr_info, setGrInfo] = useState({});
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        fetch('/api/check/' + id + '/all/').then((resp) => {
            if (resp.ok) {
                return resp.json();
            }
            alert("Что-то пошло не так..");
            return {};
        }).then((data) => {
            setImages([...data]);
        }).catch((err) => {
            console.log(err);
        });
    }, []);

    const getReady = () => {
        return images.reduce((acc, img) => acc + (img.is_ready ? 1 : 0), 0);
    }

    const getProgress = () => {
        if (images.length === 0) {
            return 0;
        }
        return getReady() / images.length * 100;
    };

    const prepareGraph = () => {
        const nodes = buildNodes(images);
        const graph = buildGraph(images);
        setGrInfo({'nodes': nodes, 'graph': graph});
    };

    const runSearch = () => {
        console.log("SEARCHING");
        console.log(gr_info);
        setGroups([]);
        var grs = groupFaces(images, accuracy, gr_info.nodes, gr_info.graph);
        console.log(grs);
        setGroups(grs.map((gr) => gr.map((x) => gr_info.nodes[x])));
    };

    const checkUpdates = () => {
        fetch('/api/check/' + id + '/').then((resp) => {
            if (resp.ok) {
                return resp.json();
            }
            return [];
        }).then((data) => {
            if (data.length > 0) {
                console.log("UPD", data, images);
                const upd_imgs = images.map((img) => {
                    var upd = data.find((el) => el.id === img.id);
                    if (upd) {
                        return upd;
                    }
                    return img;
                });
                console.log(upd_imgs);
                setImages(upd_imgs);
            }
        }).catch((err) => {
            console.log(err);
        });
    };

    useEffect(() => {
        var interval = setInterval(() => {
            if (images.length > 0 && images.reduce((acc, img) => acc && img.is_ready, true)) {
                console.log("LOAD READY");
                prepareGraph();
                clearInterval(interval);
            }
            checkUpdates();
        }, 2500);
        return () => clearInterval(interval);
    }, [images])

    return (
    <React.Fragment>
        <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center">
                    Отчет о найденных лицах
                </Typography>
                <Divider></Divider>
                <Grid container spacing={2} sx={{mt: 1}}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Лиц найдено: {images.reduce((acc, img) => acc + img.faces.length, 0)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>

                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Прогресс</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1}}>
                            <LinearProgress sx={{height: 8, mt: 1, borderRadius: 10}} variant="determinate" value={getProgress()}/>
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                            <Typography sx={{mt: 0.4}} variant="body2" color="text.secondary">{`${Math.round(
                            getProgress()
                            )}%`}</Typography>
                        </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Порог схожести лиц</Typography>
                        <Slider value={accuracy}
                            onChange={(event, value) => {setAccuracy(value)}}
                            aria-label="Default"
                            valueLabelDisplay="auto"
                            min={1}
                            max={2}
                            step={0.02}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Button disabled={gr_info.nodes == null} onClick={runSearch}>Искать похожие лица</Button>
                    </Grid>
                    <Box sx={{mt: 2}}>
                        {groups.length > 0 && groups.map((person, idx) => {
                            return (<PersonFolder key={idx} faces={person} num={idx}></PersonFolder>)
                        })}
                    </Box>
                </Grid>
            </Paper>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center">
                    Изображения
                </Typography>
            </Paper>
            {images.map((img) => {
                return (<ImageViewer
                        key={img.id} name={img.name} face_num={img.faces.length}
                        img={img.labeled_url == "" ? img.raw_url : img.labeled_url}
                        is_ready={img.is_ready}/>);
            })}
        </Container>
    </React.Fragment>
    )
}