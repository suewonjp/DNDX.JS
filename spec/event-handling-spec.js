/*global $ */
/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

describe("EVENT-HANDLING-M0CKING", function() {
    var srcDataKey = dndx().sourceDataKeyName(), dataStore = null;

    function grabPair(e, ui) {
        var $src = ui.draggable, $tgt = $(e.target), srcSelector = $src.data(srcDataKey), pair;
        if (srcSelector in dataStore.pairs === false || !$src.is(srcSelector))
            return null;
        for (var tgtSelector in dataStore.pairs[srcSelector]) {
            if (!$tgt.is(tgtSelector))
                continue;
            pair = dataStore.pairs[srcSelector][tgtSelector];
            return pair.disabled ? null : pair;
        }
    }

    function createUniqueSequence() {
        return dndx().uniqueSequence();
    }

    var eventContext = null;

    var dropActivateHandler = function(e, ui) {
        var pair = grabPair(e, ui);
        if (pair) {
            eventContext = eventContext || { pairs:[], };
            if (eventContext.pairs.indexOf(pair) === -1) {
                eventContext.pairs.push(pair);
                var $tgtObj = $(pair.tgtSelector).not(".ui-draggable-dragging");
                pair.visualcue(e.type, ui.draggable, $tgtObj, pair.srcSelector, pair.tgtSelector, e);
                pair.cbActivate(e.type, ui.draggable, $tgtObj, pair.srcSelector, pair.tgtSelector, e);
            }
        }
        return false;
    };

    var dropDeactivateHandler = function(e, ui) {
        if (!eventContext) {
            return false;
        }
        var pair = grabPair(e, ui);
        if (pair && pair !== eventContext.focusedPair) {
            var iii = eventContext.pairs.indexOf(pair);
            if (iii > -1) {
                eventContext.pairs.splice(iii, 1);
                var $tgtObj = $(pair.tgtSelector);
                pair.visualcue(e.type, ui.draggable, $tgtObj, pair.srcSelector, pair.tgtSelector);
                pair.cbDeactivate(e.type, ui.draggable, $tgtObj, pair.srcSelector, pair.tgtSelector);
                if (eventContext.pairs.length === 0) {
                    eventContext = null;
                }
            }
        }
        return false;
    };

    var dropOverHandler = function(e, ui) {
        var pair = grabPair(e, ui);
        if (pair) {
            var hitTargets = eventContext.hitTargets || (eventContext.hitTargets = createUniqueSequence()),
                head = hitTargets.front(), $head = $(head), $tgt = $(e.target);

            eventContext.$src = ui.draggable;
            eventContext.focusedPair = pair;

            if (head && head !== e.target) {
                // Resolve conflicts between multiple hits
                var selected = pair.cbConflict(ui.draggable, $head, $tgt);
                if (selected[0] === head) {
                    hitTargets.push(e.target);
                    return false;
                }
                pair.visualcue("dropout", eventContext.$src, $head, pair.srcSelector, pair.tgtSelector);
                pair.cbOut("dropout", eventContext.$src, $head, pair.srcSelector, pair.tgtSelector);
            }

            pair.visualcue(e.type, eventContext.$src, $tgt, pair.srcSelector, pair.tgtSelector, e);
            pair.cbOver(e.type, eventContext.$src, $tgt, pair.srcSelector, pair.tgtSelector, e);

            hitTargets.pushFront(e.target);
        }
        return false;
    };

    var dropOutHandler = function(e, ui) {
        if (!eventContext) {
            return false;
        }
        var pair = eventContext.focusedPair, hitTargets = eventContext.hitTargets,
            head = hitTargets ? hitTargets.front() : null, $head = $(head);
        if (pair) {
            hitTargets.remove(e.target);
            if (head === e.target) {
                pair.visualcue(e.type, eventContext.$src, $head, pair.srcSelector, pair.tgtSelector);
                pair.cbOut(e.type, eventContext.$src, $head, pair.srcSelector, pair.tgtSelector);

                if (hitTargets.length > 1) {
                    var i, c, selected = $(hitTargets[0]);
                    for (i=1,c=hitTargets.length; i<c; ++i) {
                        selected = pair.cbConflict(eventContext.$src, selected, $(hitTargets[i]));
                    }
                    hitTargets.pushFront(selected[0]);
                }
                else if (hitTargets.length === 0) {
                    eventContext.focusedPair = eventContext.$src = eventContext.hitTargets = null;
                    return false;
                }

                head = hitTargets.front(), $head = $(head);
                pair.visualcue("dropover", eventContext.$src, $head, pair.srcSelector, pair.tgtSelector, e);
                pair.cbOver("dropover", eventContext.$src, $head, pair.srcSelector, pair.tgtSelector, e);
            }
        }
        return false;
    };

    var dropHandler = function(e, ui) {
        var pair = grabPair(e, ui);
        if (pair) {
            var hitTargets = eventContext.hitTargets, head = hitTargets.front(), $head = $(head);
            if (head === e.target) {
                pair.visualcue(e.type, ui.draggable, $head, pair.srcSelector, pair.tgtSelector, e);
                pair.cbDrop(e.type, ui.draggable, $head, pair.srcSelector, pair.tgtSelector, e);
                eventContext.focusedPair = eventContext.$src = eventContext.hitTargets = null;
            }
        }
        return false;
    };

    beforeEach(function() {
        jasmine.getFixtures().load("basic.html");

        this.visualcue = function(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {};
        this.onactivate = function(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {};
        this.ondeactivate = function(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {};
        this.onover = function(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {};
        this.onout = function(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {};
        this.ondrop = function(eventType, $srcObj, $tgtObj, srcSelector, tgtSelector, e) {};
        this.onconflict0 = function($srcObj, $hitObj0, $hitObj1) { 
            expect($hitObj0).toEqual(jasmine.anything());
            expect($hitObj1).toEqual(jasmine.anything());
            if ($hitObj0.hasClass("row1")) return $hitObj0;
            if ($hitObj1.hasClass("row1")) return $hitObj1;
            return $hitObj0; 
        };
        this.onconflict1 = function($srcObj, $hitObj0, $hitObj1) { 
            expect($hitObj0).toEqual(jasmine.anything());
            expect($hitObj1).toEqual(jasmine.anything());
            return $hitObj1; 
        };

        spyOn(this, "visualcue").and.callThrough();
        spyOn(this, "onactivate").and.callThrough();
        spyOn(this, "ondeactivate").and.callThrough();
        spyOn(this, "onover").and.callThrough();
        spyOn(this, "onout").and.callThrough();
        spyOn(this, "ondrop").and.callThrough();
        spyOn(this, "onconflict0").and.callThrough();
        spyOn(this, "onconflict1").and.callThrough();

        var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",], s, t;
        for (s=0; s<src.length; ++s) {
            for (t=0; t<tgt.length; ++t) {
                dndx(src[s], tgt[t])
                    .onconflict(this.onconflict0)
                    .visualcue(this.visualcue)
                    .onactivate(this.onactivate)
                    .ondeactivate(this.ondeactivate)
                    .onover(this.onover)
                    .onout(this.onout)
                    .ondrop(this.ondrop)
                    ;
            }
        }

        this.tgtObjs = [];
        for (t=0; t<tgt.length; ++t) {
            var tmp = $(tgt[t]);
            for (s=0; s<tmp.length; ++s) {
                this.tgtObjs.push(tmp[s]);
            }
        }

        dataStore = dndx().dataStore();

        this.simulateDropActivateCalls = function(srcSelector) {
            this.curDraggable = $(srcSelector);
            var e = { type:"dropactivate", }, ui = { draggable: this.curDraggable, },
                s, t;
            for (t=0; t<this.tgtObjs.length;++t) {
                e.target = this.tgtObjs[t];
                dropActivateHandler(e, ui);
            }
        };

        this.simulateDropDeactivateCalls = function() {
            expect(this.curDraggable).toEqual(jasmine.anything());
            var e = { type:"dropdeactivate", }, ui = { draggable: this.curDraggable, }, t;
            for (t=0; t<this.tgtObjs.length;++t) {
                e.target = this.tgtObjs[t];
                dropDeactivateHandler(e, ui);
            }
            this.curDraggable = null;
        };

        this.simulateDropOverCall = function(tgtObj) {
            expect(this.curDraggable).toEqual(jasmine.anything());
            var e = { type:"dropover", target:tgtObj, }, ui = { draggable: this.curDraggable, };
            dropOverHandler(e, ui);
        };

        this.simulateDropOutCall = function(tgtObj) {
            var e = { type:"dropout", target:tgtObj, }, ui = [];
            dropOutHandler(e, ui);
        };

        this.simulateDropCall = function(tgtObj) {
            expect(this.curDraggable).toEqual(jasmine.anything());
            var e = { type:"drop", target:tgtObj, }, ui = { draggable: this.curDraggable, };
            dropHandler(e, ui);
        };
    });

    describe("Dropover/Dropout ---", function() {
        beforeEach(function() {
            expect(eventContext).toBe(null);

            this.simulateDropActivateCalls("#draggable0");

            expect(eventContext.pairs.length).toBe(3);
            expect(this.visualcue).toHaveBeenCalledTimes(3);
            expect(this.onactivate).toHaveBeenCalledTimes(3);
        });

        it("works for simple dropover/dropout", function() {
            this.simulateDropOverCall(this.tgtObjs[0]);
            expect(eventContext.hitTargets instanceof Array).toBe(true);
            expect(eventContext.hitTargets.length).toBe(1);

            this.simulateDropOutCall(this.tgtObjs[0]);
            expect(eventContext.hitTargets).not.toEqual(jasmine.anything());
            expect(eventContext.focusedPair).not.toEqual(jasmine.anything());
            expect(eventContext.$src).not.toEqual(jasmine.anything());
        });

        it("works for multiple of dropover/dropout", function() {
            this.simulateDropOverCall(this.tgtObjs[0]);
            expect(eventContext.hitTargets.length).toBe(1);
            expect(this.onconflict0).not.toHaveBeenCalled();
            expect(this.onover).toHaveBeenCalled();

            this.onconflict0.calls.reset();
            this.onover.calls.reset();
            this.simulateDropOverCall(this.tgtObjs[3]);
            expect(eventContext.hitTargets.length).toBe(2);
            expect(this.onconflict0).toHaveBeenCalledTimes(1);
            expect(this.onover).not.toHaveBeenCalled();
            expect(this.onout).not.toHaveBeenCalled();
            expect(eventContext.hitTargets.front()).toBe(this.tgtObjs[0]);

            this.onconflict0.calls.reset();
            this.simulateDropOutCall(this.tgtObjs[3]);
            expect(eventContext.hitTargets.length).toBe(1);
            expect(eventContext.hitTargets.front()).toBe(this.tgtObjs[0]);
            expect(this.onconflict0).not.toHaveBeenCalled();

            this.onconflict0.calls.reset();
            this.simulateDropOutCall(this.tgtObjs[0]);
            expect(this.onconflict0).not.toHaveBeenCalled();
        });

        it("works for multiple of dropover/dropout (overwrite)", function() {
            dndx("#draggable0", ".row1").onconflict(this.onconflict1);
            this.simulateDropOverCall(this.tgtObjs[0]);
            expect(this.onover).toHaveBeenCalled();

            this.onconflict1.calls.reset();
            this.onover.calls.reset();
            this.onout.calls.reset();
            this.simulateDropOverCall(this.tgtObjs[1]);
            expect(eventContext.hitTargets.length).toBe(2);
            expect(this.onconflict1).toHaveBeenCalledTimes(1);
            expect(this.onover).toHaveBeenCalledTimes(1);
            expect(this.onout).toHaveBeenCalledTimes(1);
            expect(eventContext.hitTargets.front()).toBe(this.tgtObjs[1]);

            this.onconflict1.calls.reset();
            this.onover.calls.reset();
            this.onout.calls.reset();
            this.simulateDropOutCall(this.tgtObjs[0]);
            expect(eventContext.hitTargets.length).toBe(1);
            expect(eventContext.hitTargets.front()).toBe(this.tgtObjs[1]);
            expect(this.onconflict1).not.toHaveBeenCalled();
            expect(this.onover).not.toHaveBeenCalled();
            expect(this.onout).not.toHaveBeenCalled();

            this.onconflict1.calls.reset();
            this.onover.calls.reset();
            this.onout.calls.reset();
            this.simulateDropOutCall(this.tgtObjs[1]);
            expect(this.onconflict1).not.toHaveBeenCalled();
            expect(this.onover).not.toHaveBeenCalled();
            expect(this.onout).toHaveBeenCalled();

            dndx("#draggable0", ".row1").onconflict(this.onconflict0); // Reset to default
        });

        it("works for multiple of dropover/dropout (3 overlaps)", function() {
            this.simulateDropOverCall(this.tgtObjs[0]);

            this.onconflict0.calls.reset();
            this.simulateDropOverCall(this.tgtObjs[1]);
            expect(eventContext.hitTargets.front()).toBe(this.tgtObjs[0]);
            expect(this.onconflict0).toHaveBeenCalledTimes(1);

            this.onconflict0.calls.reset();
            this.simulateDropOverCall(this.tgtObjs[3]);
            expect(eventContext.hitTargets.front()).toBe(this.tgtObjs[0]);
            expect(this.onconflict0).toHaveBeenCalledTimes(1);
            expect(eventContext.hitTargets.length).toBe(3);

            this.onconflict0.calls.reset();
            this.onout.calls.reset();
            this.simulateDropOutCall(this.tgtObjs[0]);
            expect(this.onout).toHaveBeenCalledTimes(1);
            expect(this.onconflict0).toHaveBeenCalledTimes(1);
            expect(eventContext.hitTargets.front()).toBe(this.tgtObjs[1]);

            this.onconflict0.calls.reset();
            this.onout.calls.reset();
            this.simulateDropOutCall(this.tgtObjs[3]);
            expect(this.onout).not.toHaveBeenCalled();
            expect(this.onconflict0).not.toHaveBeenCalled();
            expect(eventContext.hitTargets.front()).toBe(this.tgtObjs[1]);
            expect(eventContext.hitTargets.length).toBe(1);

            this.onconflict0.calls.reset();
            this.onout.calls.reset();
            this.simulateDropOutCall(this.tgtObjs[1]);
            expect(this.onconflict0).not.toHaveBeenCalled();
            expect(this.onout).toHaveBeenCalledTimes(1);
        });

        afterEach(function() {
            expect(eventContext).not.toBe(null);

            this.simulateDropDeactivateCalls();

            expect(this.ondeactivate).toHaveBeenCalledTimes(3);
            expect(eventContext).toBe(null);
        });
    });

    describe("Dropover/Drop ---", function() {
        beforeEach(function() {
            this.simulateDropActivateCalls("#draggable0");
        });

        it("works for simple dropover/drop", function() {
            var tgtObj = this.tgtObjs[0];
            this.simulateDropOverCall(tgtObj);

            this.simulateDropCall(tgtObj);
            expect(this.ondrop).toHaveBeenCalledTimes(1);
            expect(eventContext.hitTargets).not.toEqual(jasmine.anything());
            expect(eventContext.focusedPair).not.toEqual(jasmine.anything());
            expect(eventContext.$src).not.toEqual(jasmine.anything());
        });

        it("works for multiple dropovers and drop", function() {
            this.simulateDropOverCall(this.tgtObjs[4]);

            this.simulateDropOverCall(this.tgtObjs[1]);
            expect(eventContext.hitTargets.length).toBe(2);
            expect(eventContext.hitTargets.front()).toBe(this.tgtObjs[1]);
            expect(this.onover).toHaveBeenCalledTimes(2);
            expect(this.onconflict0).toHaveBeenCalledTimes(1);

            this.simulateDropCall(this.tgtObjs[1]);
            expect(this.ondrop).toHaveBeenCalledTimes(1);
        });

        it("works with interleaved calls of dropdeactivate", function() {
            // In real situations, dropdeactivate event for other pairs may be triggered
            // before the drop event is triggered.
            // We simulate that here 
            var tgtObjIndex = TEST_UTILS.getRandomInt() % this.tgtObjs.length, 
                tgtObj = this.tgtObjs[tgtObjIndex],
                e = {}, ui = { draggable: this.curDraggable, }, t;

            this.simulateDropOverCall(tgtObj);
            expect(eventContext.focusedPair).toEqual(jasmine.anything());

            e.type = "dropdeactivate";
            for (t=0; t<this.tgtObjs.length;++t) {
                if (t === tgtObjIndex)
                    continue;
                e.target = this.tgtObjs[t];
                dropDeactivateHandler(e, ui);
            }
            expect(this.ondeactivate).toHaveBeenCalledTimes(2);

            this.simulateDropCall(tgtObj);
            expect(this.ondrop).toHaveBeenCalledTimes(1);
            expect(eventContext.focusedPair).not.toEqual(jasmine.anything());

            e.type = "dropdeactivate"; e.target = tgtObj; 
            dropDeactivateHandler(e, ui);
            expect(this.ondeactivate).toHaveBeenCalledTimes(3);
            expect(eventContext).toBe(null);

            this.skipDropDeactivateCalls = true;
        });

        afterEach(function() {
            if (!this.skipDropDeactivateCalls)
                this.simulateDropDeactivateCalls();
        });
    });

    describe("Disabling/Enabling Pairs ---", function() {
        it("won't call any of callbacks for disabled pairs", function() {
            var srcSelector = "#draggable0", tgtSelector = ".row1";

            dndx(srcSelector, tgtSelector).disable(); // Disable a specific pair

            // Simuate dropactivate events
            this.simulateDropActivateCalls(srcSelector);
            expect(eventContext.pairs.length).toBe(2);
            expect(this.visualcue).toHaveBeenCalledTimes(2);
            expect(this.onactivate).toHaveBeenCalledTimes(2);

            // Simuate dropover events
            this.visualcue.calls.reset();
            this.simulateDropOverCall(this.tgtObjs[0]);
            expect(this.visualcue).not.toHaveBeenCalled();
            expect(this.onover).not.toHaveBeenCalled();

            // Simuate drop events
            this.simulateDropCall(this.tgtObjs[0]);
            expect(this.visualcue).not.toHaveBeenCalled();
            expect(this.ondrop).not.toHaveBeenCalled();

            // Simuate dropdeactivate events
            this.simulateDropDeactivateCalls();
            expect(this.visualcue).toHaveBeenCalledTimes(2);
            expect(this.ondeactivate).toHaveBeenCalledTimes(2);
            expect(eventContext).toBe(null);
        });

        it("won't call any of callbacks for disabled source group", function() {
            dndx("#draggable1").disable(); // Disable a source group

            //***** Won't call any of callbacks for the disabled source group
            this.simulateDropActivateCalls("#draggable1");
            expect(eventContext).not.toEqual(jasmine.anything());
            expect(this.visualcue).not.toHaveBeenCalled();
            expect(this.onactivate).not.toHaveBeenCalled();

            this.simulateDropOverCall(this.tgtObjs[0]);
            this.simulateDropOutCall(this.tgtObjs[0]);
            expect(this.visualcue).not.toHaveBeenCalled();
            expect(this.onover).not.toHaveBeenCalled();
            expect(this.onout).not.toHaveBeenCalled();
            //*****/

            this.simulateDropDeactivateCalls();
            expect(this.visualcue).not.toHaveBeenCalled();

            //***** Should call callbacks of other pairs
            this.simulateDropActivateCalls("#draggable0");
            expect(eventContext).toEqual(jasmine.anything());
            expect(this.visualcue).toHaveBeenCalledTimes(3);

            this.visualcue.calls.reset();
            this.simulateDropDeactivateCalls();
            expect(this.visualcue).toHaveBeenCalledTimes(3);
            //*****/
        });

        it("won't call any of callbacks if all pairs are disabled", function() {
            dndx().disable(); // Disable all pairs

            ["#draggable0", "#draggable1",].forEach(function(srcSelector) {
                this.simulateDropActivateCalls(srcSelector);
                expect(eventContext).not.toEqual(jasmine.anything());
                expect(this.visualcue).not.toHaveBeenCalled();
                expect(this.onactivate).not.toHaveBeenCalled();

                this.simulateDropOverCall(this.tgtObjs[0]);
                this.simulateDropOutCall(this.tgtObjs[0]);
                expect(this.visualcue).not.toHaveBeenCalled();
                expect(this.onover).not.toHaveBeenCalled();
                expect(this.onout).not.toHaveBeenCalled();

                this.simulateDropDeactivateCalls();
                expect(this.visualcue).not.toHaveBeenCalled();
            }, this);
        });

        it("can enable pairs that have been disabled", function() {
            dndx().disable(); // Disable all pairs
            dndx("#draggable1").enable(); // Enable a source group

            //***** Should not call any of callbacks for the source group
            this.simulateDropActivateCalls("#draggable0");
            expect(this.visualcue).not.toHaveBeenCalled();

            this.simulateDropOverCall(this.tgtObjs[0]);
            this.simulateDropOutCall(this.tgtObjs[0]);
            expect(this.visualcue).not.toHaveBeenCalled();

            this.simulateDropDeactivateCalls();
            expect(this.visualcue).not.toHaveBeenCalled();
            //*****/

            //***** Should call callbacks for the source group
            this.simulateDropActivateCalls("#draggable1");
            expect(this.visualcue).toHaveBeenCalledTimes(3);

            this.simulateDropOverCall(this.tgtObjs[0]);
            this.simulateDropOutCall(this.tgtObjs[0]);
            expect(this.visualcue).toHaveBeenCalledTimes(5);

            this.simulateDropDeactivateCalls();
            expect(this.visualcue).toHaveBeenCalledTimes(8);
            //*****/

            dndx("#draggable0", ".row3").enable(); // Enable a specific pair

            //***** Should not call all callbacks except the callback of the enabled pair
            this.visualcue.calls.reset();
            this.simulateDropActivateCalls("#draggable0");
            expect(this.visualcue).toHaveBeenCalledTimes(1);

            this.simulateDropOverCall(this.tgtObjs[0]);
            this.simulateDropOutCall(this.tgtObjs[0]);
            expect(this.visualcue).toHaveBeenCalledTimes(1);

            expect($(this.tgtObjs[6]).is(".row3")).toBe(true);
            this.simulateDropOverCall(this.tgtObjs[6]);
            this.simulateDropOutCall(this.tgtObjs[6]);
            expect(this.visualcue).toHaveBeenCalledTimes(3);

            this.simulateDropDeactivateCalls();
            expect(this.visualcue).toHaveBeenCalledTimes(4);
            //*****/
        });
    });

    afterEach(function() {
        dndx().destroy();
    });

});

