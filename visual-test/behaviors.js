/*global $ */
/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

//$.fn.extend({
    //animateCss: function (animationName) {
        //var animationEnd = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
        //$(this).addClass("animated " + animationName).one(animationEnd, function() {
            //$(this).removeClass("animated " + animationName);
        //});
    //},
//});

function onActivate(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {
}

function onDeactivate(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {
}

function onOver(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {
} 

function onOut(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {
} 

function onDrop(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {
    var srcId = $srcObj.attr("id"), tgtText = $tgtObj.text();
    //$tgtObj.animateCss("bounce");
    $tgtObj.effect("bounce", "slow");
}

function onConflict($srcObj, $tgtObj0, $tgtObj1) {
    if ($tgtObj1.is("#dialog p")) {
        return $tgtObj1;
    }
    else {
        return $tgtObj0;
    }
}

var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",], s, t;

dndx()
    .visualcue("Overlay")
    .onconflict(onConflict)
    .onactivate(onActivate)
    .ondeactivate(onDeactivate)
    .onover(onOver)
    .onout(onOut)
    .ondrop(onDrop);

for (s=0; s<src.length; ++s) {
    for (t=0; t<tgt.length; ++t) {
        dndx(src[s], tgt[t]);
    }
}

$("#add-new-src-btn").button().on("click", function() {
    var draggables = $(".draggable"), newId = draggables.length;
    draggables.last().after("<div id='draggable"+newId+"' class='draggable'><span>"+newId+"</span></div>");
    dndx("#draggable0", ".row1").newPair("#draggable"+newId, ".droppable");
    return false;
});

$("#dialog").dialog({
    autoOpen: false,
    width: 400,
    buttons: [
        {
            text: "Ok",
            click: function() {
                $(this).dialog("close");
            },
        },
        {
            text: "Cancel",
            click: function() {
                $(this).dialog("close");
            },
        },
    ],
});

$("#dialog-link").click(function(event) {
    $("#dialog").dialog("open");
    event.preventDefault();
    dndx("#draggable0", ".row1").newPair("#draggable0", "#dialog p").newPair("#draggable1", "#dialog p");
});

$("#visualcue-menu").selectmenu()
    .on("selectmenuselect", function(e, ui) {
        dndx().visualcue(ui.item.value);
    })
    ;

