/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

(function($) {

    //
    // This demo uses Animate.css, the collection of excellent CSS animations
    // https://daneden.github.io/animate.css/
    //
    $.fn.extend({
        animateCss: function (animationName, cb) {
            var animationEnd = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
            $(this).addClass("animated " + animationName).one(animationEnd, function() {
                $(this).removeClass("animated " + animationName);
                if (cb instanceof Function) {
                    cb.call(this, animationName);
                }
            });
        },
    });

    function enterDemoScene($panel) {
        switch ($panel.attr("id")) {
        case "basic":
            enterBasicDemoScene($, $panel);
            break;
        case "list":
            enterListDemoScene($, $panel);
            break;
        }
    }

    function leaveDemoScene($panel) {
        switch ($panel.attr("id")) {
        case "basic":
            leaveBasicDemoScene($, $panel);
            break;
        case "list":
            leaveListDemoScene($, $panel);
            break;
        }
    }

    function createIntroScene($) {
        $("#intro .fa-trash").tooltip().tooltip("disable");

        dndx("#intro .fa-envelope", "#intro .fa-trash")
            .visualcue("Arrow")
            .onstart(function (eventType, $srcObj, $tgtObj, etc) {
                $srcObj.data("originalOffset", etc.offset);
            })
            .ondrop(function (eventType, $srcObj, $tgtObj) {
                $srcObj.animateCss("fadeOutDown", function() {
                    var $this = $(this);
                    $this.offset($this.data("originalOffset"));
                });
                $tgtObj.animateCss("tada", function() {
                    $("#intro .fa-trash").tooltip("enable").tooltip("open");
                    setTimeout(function() {
                        $("#intro .fa-trash").tooltip("close").tooltip("disable");
                    }, 2000);
                });
            })
            .cursor("move", "pointer");
    }
    function enterIntroScene($, $panel) {}
    function leaveIntroScene($, $panel) {}

    $("#tabs").tabs({
        active: 0,
        create: function(e, ui) {
            createIntroScene($);
            createBasicDemoScene($);
            createListDemoScene($);

            enterDemoScene(ui.panel);
        },
        activate: function(e, ui) {
            leaveDemoScene(ui.oldPanel);
            enterDemoScene(ui.newPanel);
        },
    });

}(jQuery));

