#!/bin/bash

Folder="$(cd "$(dirname "$1")"; pwd)/$(basename "$1")"
Output=$2
BGImage=$3
Font=$4
if [ -z "$Folder" -o -z "$Output" -o -z "$BGImage" -o -z "$Font" ]
then
	echo "missing parameters:"
	echo ""
	echo " $ convert.sh [path/to/hearthis/folder] [output_file.mp4] [backgroundImage] [font]"
	echo ""
	echo "     [path/to/hearthis/folder] : enter the path to the input folder."
	echo "     [output_file.mp4]         : enter the final file name."
	echo "     [bakcgroundImgage]        : path to a background image or 'none' "
	echo "     [font]                    : name of the font family to use"
	echo ""
	echo " ex: ./convert.sh genesis/01 genesis_01.mp4 none 'Kayan Unicode'"
	echo ""
else

# echo "Folder:  $Folder"
# echo "Output:  $Output"
# echo "BGImage: $BGImage"
# echo "Font:    $Font"

	BGMount="--mount type=bind,source=\"$BGImage\",target=/app/bgimage.png "
	BGCommand="--bgImage=bgimage.png"
	if [ "$BGImage" == "none" ]; 
	then
		BGMount=""
		BGCommand="--noBGImage"
	fi

	docker run -it \
        	--mount type=bind,source="$Folder",target=/app/source \
			--mount type=bind,source="$(pwd)",target=/app/output \
			$BGMount \
			skipdaddy/bbkcli:develop \
			bbk convert source --output="output/$Output" $BGCommand --fontFamily="$Font"
fi

