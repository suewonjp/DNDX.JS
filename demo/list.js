/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

function createListDemoScene($) {
    var $trashcan = $(".trashcan-container .fa").tooltip().tooltip("disable");

    var listHelper = {
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
        onStart : function (eventType, $srcObj, $tgtObj, etc) {
            var w = $srcObj.width(), h = $srcObj.height(),
                rc = $srcObj[0].getBoundingClientRect(), left = rc.left, top = rc.top;
            $srcObj.data("dndx-list-original-src-rect", { left:left, top:top, w:w, h:h, });
        },
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
        visualcue : function (eventType, $srcObj, $tgtObj) {
            switch (eventType) {
            case "dropactivate": 
                $tgtObj.addClass("dndx-visualcue-exterior-aqua");
                break;
            case "dropdeactivate": 
                $tgtObj.removeClass("dndx-visualcue-exterior-aqua");
                break;
            case "dropover": 
                $tgtObj.addClass("dndx-visualcue-interior-red").css("min-height", $tgtObj.height());
                listHelper.elongateSize($srcObj, true);
                break;
            case "dropout":
            case "drop":
                listHelper.elongateSize($srcObj, false);
                $tgtObj.removeClass("dndx-visualcue-interior-red").css("min-height", null);
                break;
            }
        },
    }; 

    function trashListItem(eventType, $srcObj, $tgtObj) {
        $srcObj
            .draggable("option", "revert", false)
            .animateCss("zoomOutDown", function() {
                $trashcan.tooltip("enable")
                    .tooltip("option", "content", "You really hate "+$(this).text() + " so much...")
                    .tooltip("open")
                    .animateCss("rubberBand")
                    ;

                setTimeout(function() {
                    $trashcan.tooltip("close").tooltip("disable");
                }, 2000);

                $(this).remove();
            });
    }

    dndx(".pl-list-container li")
        .draggableOptions({ revert: true, })
        .onstart(listHelper.onStart)
        .targets(".pl-list-container ul, .pl-list-container ol")
            .visualcue(listHelper.visualcue)
            .ondrop(listHelper.onDrop)
        .targets(".trashcan-container .fa")
            .visualcue("Arrow")
            .ondrop(trashListItem)
        ;
}

function enterListDemoScene($, $panel) {}

function leaveListDemoScene($, $panel) {}

