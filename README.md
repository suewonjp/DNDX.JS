### DESCRIPTION
[DNDX.JS](http://suewonjp.github.io/DNDX.JS/) is a Web Front End Javascript library enhancing jQuery UI's [Draggable](http://api.jqueryui.com/draggable/ "")/[Droppable](http://api.jqueryui.com/droppable/ "") Widget libraries. jQuery UI's Draggable and Droppable Widgets are doing a good job in providing us most of fundamental Drag & Drop functionalities. However, from my experience of having written some Drag & Drop UI code, we still need to take care of some higher level functionalities where jQuery UI's Draggable/Droppable Widgets don't cover for us.

Main concern of DNDX.JS is providing you **HIGHER LEVEL** [Drag & Drop](https://en.wikipedia.org/wiki/Drag_and_drop) features while delegating most of its lower level D&D functions to jQuery UI's Draggable and Droppable Widgets.

A few key benefits of DNDX.JS are as follows:

1. _Ready-made visual effects_ for Drag & Drop interactions
    - D&D interactions need visual cues to give the user a hint about which object can be a drop target and which object is ready for the drop, etc.
    - DNDX.JS provides several CSS styles and animations to be used for out-of-box visual cues.
    - Also you can easily customize the visual cue or plug in your own visual cues.
    - Refer to this [discussion](https://github.com/suewonjp/DNDX.JS/wiki/Visual-Cues) for more detail.
1. _Friendly API_
    - DNDX.JS has adopted [Method Call Chaining idiom ](https://en.wikipedia.org/wiki/Method_chaining) like jQuery, thus it is easy to use.
    - DNDX.JS has been designed having real use cases in mind, and will make your code less messy and more manageable.
1. _Resolving conflicts_ caused by multiple simultaneous D&D interactions
    - D&D interactions may easily become buggy in a highly dynamic and complicated view especially when multiple interactions occur simultaneously.
    - DNDX.JS provides a solution for this kind of issue.
    - See more discussion about [Conflict Resolution](https://github.com/suewonjp/DNDX.JS/wiki/DNDX.JS-Topic---Drag-&-Drop-Conflict-Resolution)

Try [the demo](http://suewonjp.github.io/DNDX.JS/) and find out what DNDX.JS can do!

It also provides [API documentation](https://github.com/suewonjp/DNDX.JS/blob/master/api-docs.md) and [Wiki Topics](https://github.com/suewonjp/DNDX.JS/wiki) for a few key subjects.

### HOW TO USE
Import _css/dndx.css_ and _js/dndx.js_ file into your HTML file like so:

    <link rel="stylesheet" href="css/dndx.css">

    <script src="js/dndx.js"></script>

    dndx(".draggable", ".droppable")
        .visualcue("Exterior")
        .onstart(onStartCallback)
        .onconflict(onConflictCallback)
        .onover(onOverCallback)
        .ondrop(onDropCallback);

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
Written by Suewon Bahng   ( Last Updated 25 May, 2016 )

### CONTRIBUTORS
Suewon Bahng  

Other contributors are welcome!
