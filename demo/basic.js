/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

function createBasicDemoScene($) {
    $("#basic-new-src-btn").button().on("click", function() {
        var draggables = $(".draggable"), newId = draggables.length;
        draggables.last().after("<div id='draggable"+newId+"' class='draggable'><span>"+newId+"</span></div>");

        // This demonstrates what you should do when a new element which takes part in drag & drop interactions is inserted to the DOM tree
        dndx("#draggable0", ".row1").newPair("#draggable"+newId, ".droppable");

        return false;
    });

    $("#basic-dialog")
        .dialog({
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
        })
        .find("input").on("click", function(e) {
            if ($(e.target).prop("checked")) {
                // Fallback to the default (NOT SMART, RANDOM) behavior of conflict resolution
                dndx().onconflict();
            }
            else {
                // Restore the DESIRABLE conflict resolution
                dndx().onconflict(onConflict);
            }
        })
        ;

    $("#basic-dialog-link").on("click", function(event) {
        $("#basic-dialog").dialog("open");

        event.preventDefault();

        // .newPair() API lets you make a new pair which copies settings of an existing pair
        dndx("#draggable0", ".row1").newPair("#draggable0", "#basic-dialog p").newPair("#draggable1", "#basic-dialog p");

        // We need to let the entire frame of the dialog interact with source objects even though the frame doesn't need to accept them.
        // Without this invisible interaction, some hidden target objects behind the dialog may accept a source object where the users cannot notice it, and most of time, this behavior will surprise the users!
        // .nullify() API is for dealing with this kind of issue
        // But notice that just calling .nullify() is not enough. See the CONFLICT EVENT HANDLER above
        dndx("#draggable0", ".ui-dialog").nullify().newPair("#draggable1", ".ui-dialog");
    });

    $("#basic-visualcue-menu")
        .selectmenu()
        .on("selectmenuselect", function(e, ui) {
            // Switch the current effective visual cue
            dndx().visualcue(ui.item.value);
        });

    $(".check-to-reject-row")
        .on("click", function(e) {
            // these checkboxes are to make some targets enable or disable temporally.
            // See PAIR CHECKING EVENT HANDLER above
            var $btn = $(e.target);
            if ($btn.prop("checked")) {
                $btn.closest("tr").find("div.droppable").addClass("blocked");
            }
            else {
                $btn.closest("tr").find("div.droppable").removeClass("blocked");
            }
        });

    var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",], s, t;

    //
    // GENERATION OF EACH PAIR
    // 
    for (s=0; s<src.length; ++s) {
        for (t=0; t<tgt.length; ++t) {
            dndx(src[s], tgt[t]);
        }
    }
}

function enterBasicDemoScene($, $panel) {
    //function onOver(eventType, $srcObj, $tgtObj) {}
    //function onOut(eventType, $srcObj, $tgtObj) {}

    //
    // DROP EVENT HANDLER
    //
    // -- This will be called as soon as a source object is dropped on a target object
    function onDrop(eventType, $srcObj, $tgtObj) {
        //$tgtObj.animateCss("bounce");
        if ($tgtObj.is(".ui-dialog") === false)
            $tgtObj.effect("bounce", "slow");
    }

    //
    // CONFLICT EVENT HANDLER
    //
    function onConflict($srcObj, $tgtObj0, $tgtObj1) {
        var arr = [ $tgtObj0, $tgtObj1, ], i;
        for (i=0; i<2; ++i) {
            if (arr[i].is("#basic-dialog p"))
                return arr[i];
        }
        for (i=0; i<2; ++i) {
            if (arr[i].is(".ui-dialog"))
                return arr[i];
        }
        return $tgtObj0;
    }

    //
    // PAIR CHECKING EVENT HANDLER
    //
    function onCheckPair($srcObj, $tgtObj, srcSelector, tgtSelector) {
        // Ignore any of elements having the following class name.
        return ! $tgtObj.hasClass("blocked");
    }

    //
    // SETTINGS FOR THE GLOBAL LEVEL
    //
    // -- These settings will affect every pair
    dndx()
        //.draggableOptions({ helper: "clone", })
        .visualcue($("#basic-visualcue-menu")[0].selectedOptions[0].text)
        .oncheckpair(onCheckPair)
        .onconflict(onConflict)
        //.onover(onOver)
        //.onout(onOut)
        .ondrop(onDrop);

    var dlg = $("#basic-dialog");
    if ($panel.data("restoreDialog")) {
        // Restore the dialog when we come back to this demo scene
        dlg.dialog("open");
    }

    dlg.find("input").prop("checked", false);
}

function leaveBasicDemoScene($, $panel) {
    dndx()
        .visualcue(null)
        .oncheckpair(null)
        .onconflict(null)
        //.onover(null)
        //.onout(null)
        .ondrop(null);

    var dlg = $("#basic-dialog"), opened = dlg.dialog("isOpen");
    dlg.dialog("close");
    $panel.data("restoreDialog", opened);
}

