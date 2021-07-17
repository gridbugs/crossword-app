import argparse
import cv2 as cv


def main(args):
    image = cv.imread(args.image)

    # convert to greyscale
    grey = cv.cvtColor(image, cv.COLOR_BGR2GRAY)

    # apply a blur filter
    blurred = cv.GaussianBlur(grey, (7, 7), 3)

    cv.imshow("debug", blurred)
    cv.waitKey(0)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('image', type=str)
    main(parser.parse_args())
