import React, {Component, useContext, useEffect} from "react";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Grid, LinearProgress } from "@mui/material";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Tooltip from '@mui/material/Tooltip';

export default function PersonFolder(props) {
    const getImageLocalIndex = (id) => {
        for (var i = 0; i < props.images.length; ++i) {
            if (props.images[i].id === id) {
                return i;
            }
        }
        return 0;
    };

    return (
        <Box>
            <Typography variant="h6">
                Человек {props.num + 1}
            </Typography>

            <ImageList sx={{ width: 500, height: 120}} cols={5} rowHeight={100}>
                {props.faces.map((face, ind) => (
                    <Tooltip key={ind} title={props.images[getImageLocalIndex(face.img)].name}>
                        <ImageListItem>
                            <img
                                src={face.face_url}
                            />
                        </ImageListItem>
                    </Tooltip>
                ))}
            </ImageList>
        </Box>
    )
}