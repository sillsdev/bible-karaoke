# Bible Karaoke - Releases

## Legend

* :star: New feature
* :thumbsup: Improvement
* :boom: Bug fix

## v0.3.3

This is a minor feature and bugfix release:

* :star: New color selector that still includes the preset colors
* :star: Indicates how long it will take to finish rendering the video
* :star: Logs errors to logs folder
  * on Windows: %USERPROFILE%\AppData\Roaming\bible-karaoke\logs\\{date_time}.log
  * on MacOS: ~/Library/Logs/bible-karaoke/{date_time}.log
  * on Linux: ~/.config/bible-karaoke/logs/{date_time}.log
* :thumbsup: Chapter labels are just numbers so the Chapter label doesn't need to be localized
* :thumbsup: Section headings are wider so they are easier to click
* :thumbsup: If there is only have one project, book, or chapter, it is automatically selected

## v0.3.2

:thumbsup: change animation to karaoke style

## v0.3.1

This is a minor bugfix release:

* Section headings are now bold
* :boom: Fixed an internet-dependent crash/bug on some computers
    * Chrome must be installed for Bible Karaoke to work

## v0.3.0

(Under the hood, the CLI code is now integrated into this repo, rather than being a npm dependency)

* :star: Lots of new display configuration options:
    * Use a solid background color as an alternative to an image
    * Set the font size and color as well as font family
    * Set the highlight color
    * Set the 'speech bubble' color and opacity
* :thumbsup: Extra 'Make another video...' button to reset the UI after a video finishes.
* :thumbsup: Added a refresh button next to the HearThis project selection
* :boom: Fixed background color - fills window when window is resized

## v0.2.2

* :boom: Corrected chapter numbering. Chapter '0' is now labeled as 'Intro'.

## v0.2.1

* :thumbsup: Removed application menu (unused)
* :thumbsup: Display application version number

## v0.2.0

* :boom: Miscellaneous files in the HearThis project directory are now (correctly) ignored
* :boom: Removed hard-coded 10 second limit on rendering frames
* :thumbsup: New icons

## v0.1.0

* :star: Initial release

