/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

function createListDemoScene($) {
    // jQuery object representing the trash can
    var $trashcan = $(".trashcan-container .fa").tooltip().tooltip("disable");

    //
    // Various helper function for the sortable list.
    //
    var listHelper = {
        //
        // Figure out the index at which the source list item is supposed to be inserted.
        // It is computed by the current position of the source relative to the list container
        //
        getInsertablePosition : function($srcObj, $listContainer) {
            var items = $listContainer.children(), result = items.length;
            if (items.length) { // When <ul> or <ol> has <li> items
                var srcRc = $srcObj[0].getBoundingClientRect(),
                    hh = srcRc.height*0.5, srcY = srcRc.top + hh, h = items.outerHeight(true),
                    itemRc = items[0].getBoundingClientRect(),
                    c = items.length + 1, i, x = itemRc.left, y = itemRc.top + hh;
                if (items[0] === $srcObj[0]) {
                    var orgnRc = $srcObj.data("dndx-list-original-src-rect");
                    x = orgnRc.left;
                    y = orgnRc.top + hh;
                }
                for (i=0; i<c; ++i) {
                    if (srcY < y) {
                        result = i;
                        break;
                    }
                    y += h;
                }
            }
            return result;
        },
        //
        // Make the list items look thiner so that they fit gaps between the items
        //
        elongateSize : function($srcObj, elongate) {
            var orgnRc = $srcObj.data("dndx-list-original-src-rect");
            if (elongate) {
                $srcObj.animate({
                    width: orgnRc.w * 1.4,
                    height: orgnRc.h * 0.3,
                });
            }
            else {
                $srcObj.animate({
                    width: orgnRc.w,
                    height: orgnRc.h,
                });
            }
        },
        //
        // A handler called when the source starts dragging ( "dragstart" event )
        //
        onStart : function (eventType, $srcObj, $tgtObj, etc) {
            var w = $srcObj.width(), h = $srcObj.height(),
                rc = $srcObj[0].getBoundingClientRect(), left = rc.left, top = rc.top;
            $srcObj.data("dndx-list-original-src-rect", { left:left, top:top, w:w, h:h, });
        },
        //
        // A handler called when the source stops dragging ( "dragstop" event )
        //
        onDrop : function (eventType, $srcObj, $tgtObj) {
            var idx = listHelper.getInsertablePosition($srcObj, $tgtObj), items = $tgtObj.children();
            if (idx === items.length) {
                $tgtObj.append($srcObj);
            }
            else {
                $(items[idx]).before($srcObj);
            }
            $srcObj.css({ top:"", left:"", });
        },
        //
        // A custom visucal cue callback for the list items.
        //
        visualcue : function (eventType, $srcObj, $tgtObj) {
            switch (eventType) {
            case "dropactivate": 
                $tgtObj.addClass("dndx-visualcue-exterior-aqua");
                break;
            case "dropdeactivate": 
                $tgtObj.removeClass("dndx-visualcue-exterior-aqua");
                break;
            case "dropover": 
                // Make list items look thiner whenever they interact with the list container.
                // Also, give some visual cue to the container, too.
                $tgtObj.addClass("dndx-visualcue-interior-red").css("min-height", $tgtObj.height());
                listHelper.elongateSize($srcObj, true);
                break;
            case "dropout":
            case "drop":
                // Make back list items to the original size when they get dragged out of the list container
                // or they finally get dropped to the container.
                // Also, remove the visual cue from the container
                listHelper.elongateSize($srcObj, false);
                $tgtObj.removeClass("dndx-visualcue-interior-red").css("min-height", null);
                break;
            }
        },
    }; 

    //
    // Drop event handler for the trash can.
    //
    function trashListItem(eventType, $srcObj, $tgtObj) {
        $srcObj
            .draggable("option", "revert", false)
            .animateCss("zoomOutDown", function() {
                // Enable the tooltip message
                $trashcan.tooltip("enable")
                    .tooltip("option", "content", "You really hate "+$(this).text() + " so much...")
                    .tooltip("open")
                    .animateCss("rubberBand")
                    ;

                // Disable the tooltip a little later
                setTimeout(function() {
                    $trashcan.tooltip("close").tooltip("disable");
                }, 2000);

                $(this).remove();
            });
    }

    //
    // Settings for the list items.
    // 
    dndx(".pl-list-container li")
        .draggableOptions({ revert: true, })
        .onstart(listHelper.onStart)
        .targets(".pl-list-container ul, .pl-list-container ol")
            // Configurations for the case that the target is one of list containers
            .visualcue(listHelper.visualcue)
            .ondrop(listHelper.onDrop)
        .targets(".trashcan-container .fa")
            // Configurations for the case that the target is the trash can icon
            .visualcue("Arrow")
            .ondrop(trashListItem)
        ;
}

function enterListDemoScene($, $panel) {}

function leaveListDemoScene($, $panel) {}

