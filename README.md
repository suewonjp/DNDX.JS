### DESCRIPTION
DNDX.JS is a Web Front End Javascript library enhancing jQuery UI's [Draggable](http://api.jqueryui.com/draggable/ "")/[Droppable](http://api.jqueryui.com/droppable/ "") Widget libraries. jQuery UI's Draggable and Droppable Widgets are doing a good job in providing us most of fundamental Drag & Drop functionalities. However, from my experience of having written some Drag & Drop UI code, we still need to take care of some higher level functionalities where jQuery UI's Draggable/Droppable Widgets don't cover for us.

Main concern of DNDX.JS is providing you higher level Drag & Drop features while delegating most of its lower level D&D functions to jQuery UI's Draggable and Droppable Widgets.

A few key benefits of DNDX.JS are as follows:

1. Ready-made visual effects for Drag & Drop interactions
    - D&D interactions need visual cues to give the user a hint about which object can be a drop target and which object is ready for the drop, etc.
    - DNDX.JS provides several CSS styles and animations to be used for out-of-box visual cues.
    - Also you can easily customize the visual cue or plug in your own visual cues.
1. Friendly API
    - DNDX.JS has adopted [Method Call Chaining idiom ](https://en.wikipedia.org/wiki/Method_chaining) like jQuery, thus it is easy to use.
    - DNDX.JS has been designed having real use cases in mind, and will make your code less messy and more manageable.
1. Resolving conflicts caused by multiple simultaneous D&D interactions
    - D&D interactions may easily become buggy in a highly dynamic and complicated view especially when multiple interactions occur simultaneously.
    - DNDX.JS provides a solution for this kind of issue.

Try the demo and find out what DNDX.JS can do!

It also provides API documentation.

### HOW TO USE
Import _css/dndx.css_ and _js/dndx.js_ file into your HTML file like so:

    <link rel="stylesheet" href="css/dndx.css">

    <script src="js/dndx.js"></script>

### COPYRIGHT/LICENSE/DISCLAIMER

    Copyright (c) 2016 Suewon Bahng, suewonjp@gmail.com
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

* * *
Written by Suewon Bahng   ( Last Updated 03 May, 2016 )

### CONTRIBUTORS
Suewon Bahng  

Other contributors are welcome!
