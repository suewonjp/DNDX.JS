/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

function createListDemoScene($, $panel) {
    //
    // CONFLICT EVENT HANDLER
    //
    function onConflict($srcObj, $tgtObj0, $tgtObj1) {
        if ($tgtObj0.is("li")) return $tgtObj0;
        if ($tgtObj1.is("li")) return $tgtObj1;
        if ($tgtObj0.is("ul")) return $tgtObj0;
        if ($tgtObj1.is("ul")) return $tgtObj1;
        return $tgtObj0;
    }

    function showInsertBar(tgtObj) {
        var rc = tgtObj.getBoundingClientRect(), 
            top = rc.top + rc.height + 1, left = rc.left - 10, w = rc.width + 20, h = 5,
            bar = $(".dndx-insertbar");
        if (! bar.length) {
            bar = $("<div class='dndx-insertbar ui-front' style='position:fixed;display:inline'>")
                .appendTo($("body"));
        }
        bar.width(w).height(h).offset({ top:top, left:left, }).css("visibility", "visible");
    }

    function hideInsertBar() {
        $(".dndx-insertbar").css("visibility", "hidden");
    }

    var listHelper = {
        showInsertBar : function(dimensions) {
            var w = dimensions.width + 20, h = 4,
                left = dimensions.left - 10, top = dimensions.top - 2,
                bar = $(".dndx-insertbar");
            if (! bar.length) {
                bar = $("<div class='dndx-insertbar ui-front' style='position:fixed;display:inline'>")
                    .appendTo($("body"));
            }
            bar.width(w).height(h).offset({ top:top, left:left, }).css("visibility", "visible");
        },
        hideInsertBar : function() {
            $(".dndx-insertbar").css("visibility", "hidden");
        },
        getInsertablePositionInfo : function($srcObj, $listContainer) {
            var srcRc = $srcObj[0].getBoundingClientRect(), hh = srcRc.height*0.5, srcY = srcRc.top + hh, 
                items = $listContainer.children(), h = items.outerHeight(true), result = {};
            if (items.length) { // When <ul> has <li> items
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
            else { // When <ul> has no <li> items
                $srcObj.data("dndx-list-insert-idx", 0);
                var containerRc = $listContainer[0].getBoundingClientRect();
                result.top = containerRc.top + containerRc.height*0.5;
                result.left = containerRc.left + containerRc.width*0.5 - srcRc.width*0.5;
                result.width = srcRc.width;
            }
            return result;
        },
        onStart : function (eventType, $srcObj, $tgtObj, etc) {
            $srcObj.data("dndx-list-original-src-rect", $srcObj[0].getBoundingClientRect());
        },
        onStop : function (eventType, $srcObj, $tgtObj, etc) {
            if ($srcObj.data("dndx-list-item-removed")) {
                $srcObj.remove();
            }
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
                if ($tgtObj.is("ul"))
                    $tgtObj.addClass("dndx-visualcue-exterior-over");
                break;
            case "dropdeactivate": 
                if ($tgtObj.is("ul"))
                    $tgtObj.removeClass("dndx-visualcue-exterior-over");
                break;
            case "dropover": 
                var $listContainer = $tgtObj.is("ul") ? $tgtObj : $tgtObj.parent(),
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

    //$(".pl-list-container ul").sortable({ 
        //helper: "clone", 
        //out: function() {},
    //});

    dndx(".pl-list-container li")
        .draggableOptions({ revert: true, })
        .onconflict(onConflict)
        .onstart(listHelper.onStart)
        //.onstop(listHelper.onStop)
        .targets(".pl-list-container ul")
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

