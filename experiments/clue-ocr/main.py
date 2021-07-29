import argparse
import cv2 as cv
import pytesseract


def main(args):
    image = cv.imread(args.image)

    debug_image = image.copy()

    d = pytesseract.image_to_data(debug_image, output_type=pytesseract.Output.DICT)
    print(d['level'])
    for i in range(len(d['level'])):
        (x, y, w, h) = (d['left'][i], d['top'][i], d['width'][i], d['height'][i])
        print("level: %d" % d['level'][i])
        print("text: %s" % d['text'][i])
        cv.rectangle(debug_image, (x, y), (x + w, y + h), (255, 0, 0), 2)

    cv.imshow("debug", debug_image)
    while (cv.waitKey(0) != 27):
        pass


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('image', type=str)
    main(parser.parse_args())
