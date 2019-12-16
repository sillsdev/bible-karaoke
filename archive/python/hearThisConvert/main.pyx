#!/usr/bin/env python3
"""
Process HearThis folder
"""

__author__ = "Chris Hirt"
__version__ = "0.1.0"
__license__ = "MIT"

import argparse, subprocess
import os, re, csv, datetime
import xml.etree.ElementTree as ET
from itertools import groupby

try:
    from webvtt import WebVTT, Caption
    noWebVTT = False
except ImportError:
    noWebVTT = True

def main(args):
    hearThisProjectFolder = args.projectFolder
    output = args.output

    if not os.path.isdir(hearThisProjectFolder):
        raise Exception('Could not find project folder %s' % hearThisProjectFolder)
    xmlroot = ET.parse(os.path.join(hearThisProjectFolder, 'info.xml')).getroot()
    lines = xmlroot.findall('.//ScriptLine')
    outputFilename = args.outputFile
    startTime = '00:00:00.000'
    endTime = '00:00:00.000'
    data = []
    for i in range(len(lines)):
        text = getText(lines[i])
        wavFilename = os.path.join(hearThisProjectFolder, str(i) + '.wav')
        duration = getDuration(os.path.join(wavFilename), args.ffmpegPath)
        endTime = addDuration(startTime, duration)
        if args.wordbreak:
            breaks = breakWords(text, duration, startTime)
        else:
            breaks = []
        data.append([wavFilename, text, duration, startTime, endTime, breaks])
        startTime = endTime
    print ("parsed %d lines of data" % len(data))

    if args.combine:
      print('combine wav file here')
      pass # combine wav files into one wav file here 'combined.wav'


    if output == 'csv':
      outputCsv(outputFilename + '.csv', data)

    elif output == 'vtt' and not noWebVTT:
      outputVtt(outputFilename + '.vtt', data)

    elif output == 'lrc':
        outputLrc(outputFilename + '.lrc', data)

    elif output == 'json':
        outputFilename = outputFilename + '.json'
        print('output json')
        pass

def getText(node):
    return node.find('./Text').text

def outputCsv(filename, data):
  with open(filename, mode='w', encoding='utf-8') as outputCsv:
    writer = csv.writer(outputCsv, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in data:
        writer.writerow(row)
    print ("wrote CSV to %s file" % filename)

def outputVtt(filename, data):
  vtt = WebVTT()
  for row in data:
    vtt.captions.append(Caption(row[3], row[4], row[1]))
  with open(filename, mode='w', encoding='utf-8') as outputFile:
    vtt.write(outputFile)
    print ("wrote VTT to %s file" % filename)

def outputLrc(filename, data):
    res = []
    for d in data:
        if len(d[5]):
            s = "[{}] ".format(d[3]) + " ".join("<{}> {}".format(x[1], x[0]) for x in d[5]) + " <{}>".format(d[4])
        else:
            s = "[{}]{}".format(d[3], d[1])
        res.append(s)
    with open(filename, "w") as outf:
        outf.write("\n".join(res))

def getDuration(filename, ffmpeg):
    ffmpegOutput = subprocess.run([ffmpeg, '-i', filename], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE).stderr.decode('utf-8')
    return re.compile(r'Duration: (?P<duration>[^,]+),').findall(ffmpegOutput).pop()

def addDuration(currentTime, duration):
    time1 = datetime.datetime.strptime(currentTime, "%H:%M:%S.%f")
    time2 = datetime.datetime.strptime(duration, "%H:%M:%S.%f")
    time2delta = datetime.timedelta(minutes=time2.minute, seconds=time2.second, microseconds=time2.microsecond)
    newtime = time1 + time2delta
    return '{:02}:{:02}:{:02}.{:03}'.format(newtime.hour, newtime.minute, newtime.second, newtime.microsecond)

def dur2float(duration):
    vs = [float(x) for x in duration.split(':')]
    res = 0.
    for v in vs:
        res = res * 60 + v
    return res

def float2dur(dur):
    return "{:02}:{:02}:{:02}.{:03}".format(int(dur/3600), int((dur % 3600) / 60), int(dur % 60), int((dur - int(dur)) * 1000))
        
def breakWords(text, duration, start):
    res = []
    breaks = list(groupby(text, key=lambda c: c in 'aeiou'))
    vals = int(dur2float(duration) * 1000 / len(breaks) * 2.) / 1000.
    for w in text.split(' '):
        numv = len([x for x in groupby(w, key=lambda c: c in 'aeiou') if x[0]])
        res.append([w, start])
        start = addDuration(start, float2dur(vals * numv))
    return res

if __name__ == "__main__":
    """ This is executed when run from the command line """
    parser = argparse.ArgumentParser()

    # Required positional argument
    parser.add_argument("projectFolder", help="HearThis Project Folder e.g. sampledata")
    parser.add_argument("outputFile", help="Output file without extension")

    # Book argument
    parser.add_argument("-o", "--output", action="store", dest="output", choices=['csv', 'json', 'vtt', 'lrc'], default='csv')
    parser.add_argument("-f", "--ffmpegPath", action="store", dest="ffmpegPath", default='ffmpeg')

    # Chapter argument
    parser.add_argument("-c", "--combine", action="store_true", dest="combine", default=False) # true or false; default to false - combine wav files into one file

    parser.add_argument("-w", "--wordbreak", action="store_true", dest="wordbreak", default=False, help="Simple word breaking")

    # Optional verbosity counter (eg. -v, -vv, -vvv, etc.)
    parser.add_argument(
        "-v",
        "--verbose",
        action="count",
        default=0,
        help="Verbosity (-v, -vv, etc)")

    # Specify output of "--version"
    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s (version {version})".format(version=__version__))

    args = parser.parse_args()
    main(args)
