# Ripliel v1.0.2 Feedback

#### Critical Feedback

Please read again the [Ripliel.md](http://Ripliel.md) file. Unfortunately the current implementation has a few divergences from the spec:

#### Divergences

1. Links/spans tend to be counted as their own line. To the reader, these are all in the same line with the surrounding text. This means that often times there are multiple types of anchors in the same line.  
2. We want for each line to only have 3 anchors one at the start one at the middle and one at the end and for all three to be the SAME anchor. Each anchored line, should have 3 same pattern/color anchors.  
3. Another problem is that there are times when there are many lines of text and no anchor. Please make the anchoring assessment logic more robust  
4. Most of the time the anchors are placed in portions of the line that are not the beginning middle or end. The start, middle and end should be visual start middle and ends.  
5. Please create more anchor patterns. (at least 50\)  
6. Change the text “Place anchors every X sentences” to not use X since that is just from the specs and not user friendly ui.  
7. The title of the browser tab is getting corrupted please do not modify the browser tab titles.

#### New Features

1. The Serif font works well, however please provide an option to select which serif font to use and have a fall back font option as well for if the character is not supported with the selected font.  
2. Please include Petit Medieval Clarendon 1159 font as the default font. The v1.0.2 default font to be the fallback font.

#### New Structure

Please put issues that could not be fixed in a folder called “machine/issues.md”. If there are none, please do not create any such file or folder.