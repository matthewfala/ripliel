# Ripliel Browser Extension

#### Design Copyright Information

Copyright Matthew Fala, All Rights Reserved  
Email: matthewfala@gmail.com

#### Repository Information

Name: ripliel  
Type: Firefox, Chrome cross browser extension

#### Goal

Create an extension that helps people that struggle to keep track of which line they are reading by changing to a serif font, and creating anchors for the eye to know which line they have read and are looking at.

The problem for readers with this issue is that when they get to the end of a line, they struggle to find the start of that same line that they just finished reading so that they can move on to the next line of text. With the anchors placed on the page (in a consistent manner so it stays the same each time they visit the text), the reader can easily move from line to line.

The anchors also provide visual indexing queues for the material allowing the reader to remember which part of the text talked about what, based on remembering the anchor and color.

#### Description

This is an extension for Firefox and Chrome. When you activate it, it modifies the webcode of whatever site it’s looking at, to have lines of text annotated with anchors which have a specific shape and color, below the line of text.

Per each anchored line, there are three anchors, one at the start of the line under the first section of text. One at the end of the line under the last section of text, and one at the middle of the line under the middle section of text.

#### Anchor Frequency

Anchors are placed every X sentences of text. This can be configured by clicking the web extension and changing the settings in the extensions pop up configuration.

When the X\*n’th sentence is reached, the entire line is annotated with an anchor. If a line contains too many sentences, then only the first anchor type is annotated for that whole line.

#### Anchor Types

Anchor type is generated in a consistent manner by the hash of the content which comes in the sentence that the anchor is on. This means that if the web page is re-visited, or resized, the anchors should roughly remain consistent on the page, allowing for the visual queues to remain useful to the reader.

A random color that is notably visible (different enough from the background), is selected. For the anchor, there are are various types of squiggles, dots, and triangles, a wave shape, which always form some sort of underline. The anchor is made up of some pattern that looks consistent throughout (like a series of dashes, or a series of the same triangle, or a series of similar dots), and also recognizable. Something that the reader could remember alongside the content that they read and become useful to the reader to find the content they are remembering in the future.

Each anchor is roughly the size of a 1 by 5 rectangle which is horizontally long, and can be placed between lines of text under the anchored line, without blocking the view of the text above or below the anchor. For an anchored line, this 1 by 5 rectangle is placed 3 times, once at the start of the line, once at the end, and once at the middle.

#### Requirements

The extension needs to make the anchors follow the above description even when the page is resized. The responsivity should be consistent meaning that the anchors shouldn’t change type, unless two anchors are merged together, though they may become less frequent as the number of lines per sentence increases.

The extension should automatically modify the visual appearance of the text on each web page when the page is visited. 

The extension should not slow down the load time of the web page. If it does, then the anchoring annotations should asynchronous occur, and have some non distracting animation to appear on the screen (a fade in) so the content of the web page can load quicker.

The extension should only modify the visual appearance of text and not cause textboxs or other user entered site content to become corrupt.

#### Credits

Please annotate the web extension with the following credits:  
Designed by Matthew Fala