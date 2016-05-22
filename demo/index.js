/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

(function($) {

    //$.fn.extend({
        //animateCss: function (animationName) {
            //var animationEnd = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
            //$(this).addClass("animated " + animationName).one(animationEnd, function() {
                //$(this).removeClass("animated " + animationName);
            //});
        //},
    //});

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

    $("#tabs").tabs({
        active: 1,
        create: function(e, ui) {
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

