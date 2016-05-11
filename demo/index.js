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

    function enterDemoScene(id) {
        switch (id) {
        case "basic":
            enterBasicDemoScene($);
            break;
        case "list":
            enterListDemoScene($);
            break;
        case "pictures":
            enterPicturesDemoScene($);
            break;
        }
    }

    function leaveDemoScene(id) {
        switch (id) {
        case "basic":
            leaveBasicDemoScene($);
            break;
        case "list":
            leaveListDemoScene($);
            break;
        case "pictures":
            leavePicturesDemoScene($);
            break;
        }
    }

    $("#tabs").tabs({
        create: function(e, ui) {
            createBasicDemoScene($);
            createListDemoScene($);
            createPicturesDemoScene($);

            enterDemoScene(ui.panel.attr("id"));
        },
        activate: function(e, ui) {
            leaveDemoScene(ui.oldPanel.attr("id"));
            enterDemoScene(ui.newPanel.attr("id"));
        },
    });

    $("#tabs").tabs("option", "active", 1);

}(jQuery));

