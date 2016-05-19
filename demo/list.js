/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

function createListDemoScene($) {
    //
    // CONFLICT EVENT HANDLER
    //
    function onConflict($srcObj, $tgtObj0, $tgtObj1) {
        if ($tgtObj0.is("li")) return $tgtObj0;
        if ($tgtObj1.is("li")) return $tgtObj1;
        if ($tgtObj0.is("ul, ol")) return $tgtObj0;
        if ($tgtObj1.is("ul, ol")) return $tgtObj1;
        return $tgtObj0;
    }

    var listHelper = {
        showInsertBar : function(dimensions) {
            var w = dimensions.width + 20, left = dimensions.left - 10, top = dimensions.top - 2,
                bar = $(".dndx-insertbar");
            if (! bar.length) {
                bar = $("<span class='dndx-insertbar ui-front'>")
                    .appendTo($("body"));
            }
            bar.width(w).offset({ top:top, left:left, }).css("visibility", "visible");
        },
        hideInsertBar : function() {
            $(".dndx-insertbar").css("visibility", "hidden");
        },
        getInsertablePositionInfo : function($srcObj, $listContainer) {
            var srcRc = $srcObj[0].getBoundingClientRect(), hh = srcRc.height*0.5, srcY = srcRc.top + hh, 
                items = $listContainer.children(), h = items.outerHeight(true), result = {};
            if (items.length) { // When <ul> <ol> has <li> items
                var itemRc = items[0].getBoundingClientRect(), c = items.length + 1, i,
                    x = itemRc.left, y = itemRc.top + hh;
                $srcObj.data("dndx-list-insert-idx", c);
                if (items[0] === $srcObj[0]) {
                    var orgnRc = $srcObj.data("dndx-list-original-src-rect");
                    x = orgnRc.left;
                    y = orgnRc.top + hh;
                }
                for (i=0; i<c; ++i) {
                    if (srcY < y) {
                        $srcObj.data("dndx-list-insert-idx", i);
                        //result.index = i;
                        result.top = y - h*0.5;
                        result.left = x;
                        result.width = itemRc.width;
                        break;
                    }
                    y += h;
                }
            }
            else { // When <ul> or <ol> has no <li> items
                $srcObj.data("dndx-list-insert-idx", 0);
                var containerRc = $listContainer[0].getBoundingClientRect();
                result.top = containerRc.top + containerRc.height*0.5;
                result.left = containerRc.left + containerRc.width*0.5 - srcRc.width*0.5;
                result.width = srcRc.width;
            }
            return result;
        },
        onStart : function (eventType, $srcObj, $tgtObj, etc) {
            $srcObj
                .css("opacity", 0.5)
                .data("dndx-list-original-src-rect", $srcObj[0].getBoundingClientRect());
        },
        onStop : function (eventType, $srcObj, $tgtObj, etc) {
            $srcObj.css("opacity", 1);
        },
        onDrop : function (eventType, $srcObj, $tgtObj) {
            var idx = $srcObj.data("dndx-list-insert-idx"), items = $tgtObj.children();
            if (idx === items.length) {
                $tgtObj.append($srcObj);
            }
            else {
                $(items[idx]).before($srcObj);
            }
            $srcObj.css({ top:"", left:"", }).effect("shake", "slow");
        },
        visualcue : function (eventType, $srcObj, $tgtObj) {
            switch (eventType) {
            case "dropactivate": 
                if ($tgtObj.is("ul, ol"))
                    $tgtObj.addClass("dndx-visualcue-interior-red");
                break;
            case "dropdeactivate": 
                if ($tgtObj.is("ul, ol"))
                    $tgtObj.removeClass("dndx-visualcue-interior-red");
                break;
            case "dropover": 
                var $listContainer = $tgtObj.is("ul, ol") ? $tgtObj : $tgtObj.parent(),
                    dimensions = listHelper.getInsertablePositionInfo($srcObj, $listContainer);
                listHelper.showInsertBar(dimensions);
                break;
            case "dropout":
            case "drop":
                listHelper.hideInsertBar();
                break;
            }
        },
    }; 

    function trashListItem(eventType, $srcObj, $tgtObj) {
        $srcObj.data("dndx-list-item-removed", true);
        $srcObj.draggable("option", "revert", false);
        $srcObj.toggle("fade", "slow", function() {
            $srcObj.remove();
        });
    }

    dndx(".pl-list-container li")
        .draggableOptions({ revert: true, })
        .onconflict(onConflict)
        .onstart(listHelper.onStart)
        .onstop(listHelper.onStop)
        .targets(".pl-list-container ul, .pl-list-container ol")
            .visualcue(listHelper.visualcue)
            .ondrop(listHelper.onDrop)
        .targets(".pl-list-container li")
            .visualcue(listHelper.visualcue)
        .targets(".trashcan-container .fa")
            .visualcue("Exterior")
            .ondrop(trashListItem)
        ;
}

function enterListDemoScene($, $panel) {
}

function leaveListDemoScene($, $panel) {
}

