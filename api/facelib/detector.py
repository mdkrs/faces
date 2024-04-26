# pip install torch-mtcnn
# pip install deepface

import numpy as np
import matplotlib
from matplotlib import pyplot as plt
from torch_mtcnn import detect_faces
from PIL import Image
from deepface import DeepFace
import matplotlib.patches as patches


def get_embed(face):
    return np.array(DeepFace.represent(face, enforce_detection=False, detector_backend='skip')[0]['embedding'])


def show_faces_on_image(path):
    matplotlib.pyplot.switch_backend('Agg') 
    dpi = 80
    image = Image.open(path)
    bounding_boxes, _ = detect_faces(image)
    fig = plt.figure(frameon=False, figsize=(image.width / dpi, image.height / dpi))
    ax = plt.Axes(fig, [0., 0., 1., 1.])
    ax.set_axis_off()
    fig.add_axes(ax)
    ax.imshow(image, aspect='auto', cmap='gray')
    cropped = []
    for box in bounding_boxes:
        min_x, min_y, max_x, max_y, _ = box
        rect = patches.Rectangle((min_x, min_y), max_x - min_x, max_y - min_y, linewidth=3, edgecolor='r', facecolor='none')
        ax.add_patch(rect)
        cropped.append(image.crop(box=(min_x, min_y, max_x, max_y)))

    save_path = 'media/labeled/' + path.split('/')[-1]
    fig.savefig(save_path)
    return save_path, bounding_boxes


def get_image_faces(path, bounding_boxes):
    image = Image.open(path)
    cropped = []
    for box in bounding_boxes:
        min_x, min_y, max_x, max_y, _ = box
        cropped.append(np.array(image.crop(box=(min_x, min_y, max_x, max_y))))
    return cropped


def get_embeded_faces(faces):
    return list(map(get_embed, faces))

