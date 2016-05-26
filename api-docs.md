#### Convention or Style of APIs
###### Method Call Chaining
DNDX.JS has adopted [Method Call Chaining idiom ](https://en.wikipedia.org/wiki/Method_chaining) with which you might be familiar if you are a jQuery user. Basically, what you do is calling a series of methods connected from tail to head like so:

        dndx(".pl-list-container li")
            .draggableOptions({ revert: true, })
            .onstart(listHelper.onStart)
            .targets(".pl-list-container ul, .pl-list-container ol")
                .visualcue(listHelper.visualcue)
                .ondrop(listHelper.onDrop)
            .targets(".trashcan-container .fa")
                .visualcue("Exterior")
                .ondrop(trashListItem) ;

To make this kind of call chaining happen, DNDX.JS APIs return some sort of objects, but they are meant to be hidden or internal. You don't need to retain any of them.

* * *

#### Concepts
###### Sources & Targets
Most Drag & Drop (D&D) UI interactions involve SOURCE objects to drag and TARGET objects to accept them. In DNDX.JS, sources use jQuery UI Draggable Widget, and targets use jQuery UI Droppable Widget for their underlying functionalities.
###### Pairs  
Basically, D&D interactions have paring nature (source and target). DNDX.JS has been designed having this in mind so that code can fit better real use cases and be more manageable. Pairs are basic units of data in DNDX.JS. Every pair is represented by CSS selector strings for its source and target, respectively.
###### Levels  
Just tuning pair by pair for every setting is tedious and time-consuming. DNDX.JS has three levels of configuration range.  
- Global Level
   - Any of settings configured in this level will be effective for all pairs.
- Source Group Level
   - Any of settings configured in this level will be effective for a certain group of pairs sharing the same kind of source
- Pair Level
   - Settings for this level will be effective only for a certain pair.   

For example, you can assign a default visual effect to trigger (whenever D&D events happen) for all pairs by setting it at the Global Level. But if you want a certain pair to use a different visual cue, you can assign one for that pair (set at the Pair Level). From then on, the pair will start to trigger its own visual effect instead of the visual cue set globally.

See the API References for more details

###### Events
- dropactivate
 - Triggered when a source object starts dragging. If you want to give target objects some attractive visual effect to indicate that they can accept the source, this event is the right place to do that.
- dropdeactivate
 - Triggered when a source object stops dragging. This is the place to remove any visual cue or behavior you have previously installed.
- dropover
 - Triggered when a source object is dragged over one of target objects. Often, you need to give your users another visual cue to indicate that the source is touching the target and ready to drop on it finally. After this event, either of dropout or drop event is supposed to happen.
- dropout
 - Triggered when a source object is dragged out of the target.
- drop
 - Triggered when a source object is dropped on the target.
- dragstart
 - Triggered when dragging starts. Unlike the dropactivate event, this event involves no target object. If you want to give the source object some special effect (e.g., making it transparent), this is the place to do that.
- dragstop
 - Triggered when dragging stops. Unlike dropdeactivate event, this event involves no target object.

**Callback function arguments for events except dragstart, dragstop:**
- eventType
 - One of "dropactivate", "dropdeactivate", "dropover", "dropout", "drop"
 - When you reuse a single callback for all events, you can refer to this parameter to identify the current event type.
 - Don't bother if you use a separate callback for each event.
- $srcObj : A jQuery object for the source
- $tgtObj : A jQuery object for the target
- etc : An object keeping other non-essential parameters
 - srcSelector : source selector string for the pair
 - tgtSelector : target selector string for the pair

**Callback function arguments for dragstart, dragstop events:**
- eventType
 - One of "dragstart", "dragstop"
 - When you reuse a single callback for all events, you can refer to this parameter to identify the current event type.
 - Don't bother if you use a separate callback for each event.
- $srcObj : A jQuery object for the source
- $tgtObj : This is an empty array. but included for consistency with other events.
- etc : An object keeping other non-essential parameters
 - srcSelector : source selector string for the pair
 - position : Current CSS position of the source as { top, left } object.
 - originalPosition : [ for only "dragstop" ] Original CSS position (before starting dragging) of the source as { top, left } object. 
 - offset : Current CSS offset position (relative to the document) of the source as { top, left } object. 
 - event : The event object.

* * *

#### API References
###### dndx(srcSelector, tgtSelector)
This is the most important API and every method chaining will start from this API. When this function is invoked for the 1st time, it will construct all infrastructure to manage pairs, and then construct pairs specified by the user, if any.

_srcSelector_ and _tgtSelector_ are supposed to be valid CSS selector strings or omitted.

As stated above, DNDX.JS has three levels of configuration range, and the level will be determined by how you pass parameters in to this function.
- When srcSelector and tgtSelector are all omitted.
  - This indicates the **Global Level** mode.

          dndx()
              .visualcue("Exterior")
              .ondrop(onDrop);

          // Now, all pairs will trigger "Exterior" visual cue whenver you drag a source object,
          // and they will call the onDrop callback whenever a source object is dropped to a target object.  
          // This will force default settings for whichever pair you create.  
          // But, global settings like this can be easily overridable.
- When srcSelector is a valid CSS selector and tgtSelector is omitted.
  - This indicates the **Source Group Level** mode.

            dndx(".pl-list-container li")
                .draggableOptions({ revert: true, }u>)
                .onstart(onStart)
                .ondrop(onDrop);

            // The settings will be applied to all pairs 
            // having source objects represented by ".pl-list-container li" selector 
            // except any of pairs that have their own settings.
- When srcSelector and tgtSelector are all valid CSS selectors.
  - This indicates the **Pair Level** mode.

            dndx(".pl-list-container li", ".droppable-container")
                .ondrop(specialCallback);

            // The particular pair represented by ".pl-list-container li" (a source selector), ".droppable-container" (a target selector) 
            // will call specialCallback when the drop event occurs for the corresponding pair.


###### .targets(tgtSelector)
Switches the call chain to a different pair. tgtSelector should be a valid CSS selector string.

Notice that this method is meant to be called at Source Group Level or Pair Level. See the following example code.

        dndx(".draggable")
            .visualcue("Exterior") // --- 1
            .targets(".droppable") // --- 2
                .ondrop(onDrop1)
            .targets(".trash")     // --- 3
                .ondrop(onTrash);

1. The source group represented by the selector ".draggable" will use the visual cue "Exterior."  
1. The level mode is switched to Pair Level from Source Group Level. Settings from then on will be applied for that particular pair (".draggable, .droppable") It's the same as the following call.
    - dndx(".draggable", ".droppable").ondrop(onDrop1);
1. Another switch to a different pair (".draggable, .trash"). It's the same as the following call.
    - dndx(".draggable", ".trash").ondrop(onTrash);

###### .draggableOptions(options)
Sets jQuery UI Draggable options. Refer to [this page](http://api.jqueryui.com/draggable/) about which option you can specify.
###### .droppableOptions(options)
Sets jQuery UI Droppable options. Refer to [this page](http://api.jqueryui.com/droppable/) about which option you can specify.

Notice that calling this method for Source Group Level will have no effect. 
###### .visualcue(param)
Specifies visual effect. param can be a string or callback.

- To use one of the builtin visual cues, param should be one of the following strings
 - "Overlay"
 - "Swing"
 - "Exterior"
 - "Underline"
 - "Arrow"
- Following strings have special behaviors
 - "Nothing"
    - Specifies no visual cue.
 - "fallback"
    - Fallbacks to the visual cue of the previous level.
    - Refer to the below example code for what this option is all about.
- If you need a custom visual effect, implement a callback for that and pass it in as param. See the example code below.  
 - See [events](#events) for callback signature.

An example callback of custom visual cue behavior:

            function visualcue(eventType, $srcObj, $tgtObj) {
                switch (eventType) {
                case "dropactivate": 
                    $tgtObj.addClass("dndx-visualcue-exterior-aqua");
                    break;
                case "dropdeactivate": 
                    $tgtObj.removeClass("dndx-visualcue-exterior-aqua");
                    break;
                case "dropover": 
                    $tgtObj.addClass("dndx-visualcue-interior-red");
                    break;
                case "dropout":
                case "drop":
                    $tgtObj.removeClass("dndx-visualcue-interior-red");
                    break;
            }

How to use the _"fallback"_ option:

        // No visual cue for the Global Level
        dndx().visualcue("Nothing"). 

        // "Exterior" builtin visual cue for the Source Group Level
        dndx(".draggable").visualcue("Exterior"). 

        // "Swing" builtin visual cue for Pair Level
        dndx(".draggable", ".droppable").visualcue("Swing").

        dndx(".draggable", ".droppable").visualcue("fallback").
        // Now the visual cue for the pair has become "Exterior" (fallen back to the Source Group Level)

        dndx(".draggable").visualcue("fallback");
        // Now the visual cue for the Source Group has become "Nothing" (fallen back to the Global Level)

###### .oncheckpair(cb)
Specifies a callback to check a source/target object pair. The callback needs to return true to allow the object pair to be processed thereafter, and return false to reject the pair for further process.

The callback accepts following arguments:
- $srcObj : A jQuery object for the source
- $tgtObj : A jQuery object for the target
- srcSelector : source selector string for the pair
- tgtSelector : target selector string for the pair

e.g.:

        // To reject every object with a class ".blocked", assign a callback like so:
        function onCheckPair($srcObj, $tgtObj, srcSelector, tgtSelector) {
            return ! $tgtObj.hasClass("blocked");
        }

        dndx().oncheckpair(onCheckPair);


###### .onconflict(cb)
Specifies a conflict resolution callback. A _Conflict Resolution_ means resolving which target will get priority whan the dropover event involves multiple target objects.

See more discussion about Conflict Resolution. [TO EDIT]

The callback accepts following arguments:
- $srcObj : A jQuery object for the source
- $tgtObj0 : A jQuery object for the 1st target
- $tgtObj1 : A jQuery object for the 2nd target

You need to return either of the two targets and the returned target would be accepted and the other will be rejected. But remember that the callback may be invoked more than one time because there may be more than two targets in conflict.

        dndx(".draggable").onconflict(onConflict);

        // The source group of ".draggable" will use the following conflict resolution behavior. 
        function onConflict($srcObj, $tgtObj0, $tgtObj1) {
            // Targets corresponding to "#basic-dialog p" will have the highest priority.
            if ($tgtObj0.is("#basic-dialog p")) return $tgtObj0;
            if ($tgtObj1.is("#basic-dialog p")) return $tgtObj1;

            // ".ui-dialog" will have less but higher priority than others.
            if ($tgtObj0.is(".ui-dialog")) return $tgtObj0;
            if ($tgtObj1.is(".ui-dialog")) return $tgtObj1;

            // And you don't care about other targets. (Just first come, first served)
            return $tgtObj0;
        }


###### .onactivate(cb)
Specifies a callback for _dropactivate_ event. See [events](#events) for dropactivate event and its callback signature.

###### .ondeactivate(cb)
Specifies a callback for _dropdeactivate_ event. See [events](#events) for dropdeactivate event and its callback signature.

###### .onover(cb)
Specifies a callback for _dropover_ event. See [events](#events) for dropover event and its callback signature.

###### .onout(cb)
Specifies a callback for _dropout_ event. See [events](#events) for dropout event and its callback signature.

###### .ondrop(cb)
Specifies a callback for _drop_ event. See [events](#events) for drop event and its callback signature.

###### .onstart(cb)
Specifies a callback for _dragstart_ event. See [events](#events) for dragstart event and its callback signature.

Notice that the dragstart/dragstop events have nothing to do with target objects. See the following code;

        dndx(".draggable", "#trashcan").onstart(onStart);

The code works, but might be misleading. .onstart() applies only to SOURCES, thus, the callback onStart will be called whenever any of source objects with "draggable" class start dragging; even for other pairs involved with the source. So do not assume the above code will only apply to the specific pair ( ".draggable", "#trashcan" )
###### .onstop(cb)
Specifies a callback for _dragstop_ event. See [events](#events) for dragstop event and its callback signature.

###### .nullify()
Makes the pair not respond to any event and produce no visual cue. This is useful when you want some empty space to block further interactions in case that there are other objects behind it.

See related discussion for detail. [TO EDIT]
###### .refresh()
Refreshes the pairs and their data. This is necessary especially when you introduce new objects into the DOM structure.

###### .newPair(srcSelector, tgtSelector)
Creates a new pair represented by the CSS selector strings. This is similar to .targets() method, but unlike it, the newly created pair will inherit all previously configured settings from the call chain. This will let you avoid redundant configurations.

        dndx(".draggable", ".droppable")
            .visualcue("Exterior")
            .onover(onOverL)
            // The above settings will also apply to the new pair ("#icon0", ".droppable")
            newPair("#icon0, ".droppable);


###### .configure(configOptions)
Specifies settings to control library-wide behaviors of DNDX.JS.

configOptions has following properties.
- strictValidation : If set true, DNDX.JS will check if objects actually exist in the DOM tree.

        dndx().configure({ strictValidation: true });

        // Throws an exception when the objects denoted by the selectors don't exist in the DOM tree.
        dndx(".dragging", ".droppable");


###### .disable()
Disables pairs.

###### .enable()
Enables pairs.

###### .cursor(dragType, hoverType)
Sets cursor types for the source objects.

- dragType 
 - A cursor type for dragging. The default is "move"
- hoverType [optional]  
 - A cursor type for hovering on the source object before dragging. The default is "auto"

Use of this method to a specific pair might be misleading like [.onstart()](#onstartcb) or .onstop()

###### .remove()
Removes pairs.

Notice that this method returns nothing, which means another method can't be chained to the tail. ( Doing more work for removed objects doesn't make sense. ) Thus, you need to place this method at the end of the call chain.

###### .destroy()
Destroys every pair and infrastructure of the library.

Like .remove(), this method returns nothing, which means another method can't be chained to the tail.

###### dndx.destroy()
Does the same thing as .destroy(), but it doesn't nned to be chained to dndx() call.

