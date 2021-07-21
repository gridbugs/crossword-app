import argparse
import cv2 as cv


def contour_is_quad(contour):
    APPROX_POLYGON_EPS_RATIO_OF_PERIMETER = 0.02
    perimeter = cv.arcLength(contour, True)
    approx_polygon = cv.approxPolyDP(contour, APPROX_POLYGON_EPS_RATIO_OF_PERIMETER * perimeter, True)
    return len(approx_polygon) == 4


def main(args):
    image = cv.imread(args.image)

    grey = cv.cvtColor(image, cv.COLOR_BGR2GRAY)

    inverted = cv.bitwise_not(grey)

    (contours, [hierarchy]) = cv.findContours(inverted, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)

    (boundary_idx, boundary) = max(
            filter(lambda c: contour_is_quad(c[1]), enumerate(contours)),
            key=lambda c: cv.contourArea(c[1]),
    )

    for (contour_index, contour) in enumerate(contours):
        if hierarchy[contour_index][3] == boundary_idx:
            if contour_is_quad(contour):
                cv.drawContours(image, [contour], 0, (0, 255, 0), 2)

    cv.drawContours(image, [boundary], 0, (0, 0, 255), 2)

    cv.imshow("debug", image)
    while (cv.waitKey(0) != 27):
        pass


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('image', type=str)
    main(parser.parse_args())
