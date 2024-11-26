#!/usr/bin/env python3

# import modules
import numpy as np
import urllib.request
import cv2

# read the image url
url = "https://media.geeksforgeeks.org/wp-content/uploads/20211003151646/geeks14.png"


with urllib.request.urlopen(url) as resp:
    # read image as an numpy array
    image = np.asarray(bytearray(resp.read()), dtype="uint8")
    print(image.shape)

    # use imdecode function
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)

    # display image
    cv2.imwrite("result.jpg", image)
