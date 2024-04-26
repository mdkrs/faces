import React, {Component, useContext, useEffect} from "react";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { LinearProgress } from "@mui/material";

export default function ImageViewer(props) {
    return (
    <Card sx={{ display: 'flex' , mt: 2}}>
        <CardMedia
            component="img"
            sx={{ maxWidth: 500 }}
            image={props.img}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column'}}>
            <CardContent sx={{ }}>
            <Typography component="div" variant="h5" flexWrap>
                {props.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
                Лиц найдено: {props.face_num}
            </Typography>
            {!props.is_ready && (
                <LinearProgress sx={{mt: 2}}/>
            )}
            </CardContent>
        </Box>
    </Card>
    )
}