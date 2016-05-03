/*global jQuery */
/*eslint no-undef:0*/

jasmine.getFixtures().fixturesPath = "spec/fixtures";

// Declare that wa are under inspection mode in system wide
jQuery.data(document.body, "dndx-under-inspection", true);

dndx().configure({
    //strictValidation : true,
});

