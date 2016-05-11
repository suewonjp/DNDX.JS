/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

function createListDemoScene($) {
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

    //
    // DROP EVENT HANDLER
    //
    // -- This will be called as soon as a source object is dropped on a target object
    function onDrop(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {
        $tgtObj.effect("bounce", "slow");
    }

    dndx(".prglng-list-container li")
        .ondrop(onDrop)
        .onconflict(onConflict)
        .targets(".prglng-list-container ul")
            .visualcue("Exterior")
        .targets(".prglng-list-container li")
        .targets(".trashcan-container .fa")
        ;
}

function enterListDemoScene($) {
}

function leaveListDemoScene($) {
}

