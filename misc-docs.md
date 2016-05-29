#### References for Utility Methods
Most of time, you won't ever need these utility methods. However, they might be useful for some rare use cases, for example, that you implement your own visual cues.

###### dndx.openCanvas(id, styleClasses, width, height, onCreated)
Creates an HTML5 Canvas object.

- id : An ID for a DOM element for the canvas.
 - Used later for a clean-up by dndx.closeCanvas()
- styleClasses ( optional ) : Additional class names to style the canvas.
- width, height ( optional ) : width/height of the canvas. The default is the viewport size.
- onCreated ( optional ) : A callback invoked only once when the canvas is created.

###### dndx.closeCanvas(id, delay)
Removes the canvas object created by dndx.openCanvas() method.

- id : An ID for a DOM element for the canvas.
- delay : Time delay during which the canvas will gradually and smoothly disappear.

###### dndx.showOverlay($srcObj, $tgtObj)
Creates overlay that covers the entire viewport but areas of given objects. 

The area covered with the overlay (having a shadow color) can't accept any UI interaction from mouse, keyboard, etc. However, the corresponding areas for the source and targets are not covered with overlay, so they can still respond to interactions and they will stick out because of the shadowy tint of the overlay around them.

- $srcObj : A jQuery object for the source
- $tgtObj : A jQuery object for the targets

###### dndx.hideOverlay()
Removes the overlay created by dndx.showOverlay() method. 

###### dndx.hideObjectsById(id)
Removes objects created by dndx.showUnderline() or dndx.showCurvedArrow() methods. 

- id : An ID to identify the DOM element for the objects to remove.

###### dndx.showUnderline($tgtObj, id, styleClasses, paddingWidth, marginBottom)
Creates an underline bar right below each of targets.

- $tgtObj : A jQuery object for the targets
- id : An ID for a container to wrap all the underline bars. 
 - Used later for a clean-up by dndx.hideObjectsById()
- styleClasses ( optional ) : Additional class names to style the underline bars.
- paddingWidth ( optional ) : Additional width for each of the underline bars.
- marginBottom ( optional ) : Margin between each of the targets and its underline bar.

###### dndx.showCurvedArrow($tgtObj, id, styleClasses$) 
Creates a curved arrow for each of the targets.

- $tgtObj : A jQuery object for the targets
- id : An ID for a container to wrap all the arrows.
 - Used later for a clean-up by dndx.hideObjectsById()
- styleClasses ( optional ) : Additional class names to style the arrows.

###### dndx.forEachPair(cb)
Iterates every pair and invokes a callback on it.

- cb : A user-defined callback. The following parameters will be given to the callback.
 - srcSelector : A CSS selector string for the sources.
 - tgtSelector : A CSS selector string for the targets

###### dndx.forEachSelector(cbForSrc, cbForTgt)
Iterates every CSS selector for the sources and targets.

- cbForSrc : A user-defined callback to be invoked for a source selector. The CSS selector string for the source will be passed in.
- cbForTgt : A user-defined callback to be invoked for a target selector. The CSS selector string for the target will be passed in.

