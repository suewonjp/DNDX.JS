/*global $ */
/*eslint no-undef:0*/
/*eslint no-unused-vars:0*/

describe("EVENT-HANDLING-M0CKING", function() {
    var srcDataKey = dndx().sourceDataKeyName(), dataStore = null;

    function grabPair($src, $tgt) {
        var srcSelector = $src.data(srcDataKey), pair;
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

    function rejectTarget(tgt, ec) {
        if (!ec)
            return true;
        var c = (ec.blacklist && ec.blacklist.length) || 0, i;
        for (i=0; i<c; ++i) {
            if (tgt === ec.blacklist[i])
                return true;
        }
        return false;
    }

    var dropActivateHandler = function(e, ui) {
        var pair = grabPair(ui.draggable, $(e.target));
        if (pair) {
            eventContext = eventContext || { pairs:[], };
            if (eventContext.pairs.indexOf(pair) === -1) {
                eventContext.pairs.push(pair);
                var $tgtObj = $(pair.tgtSelector).not(".ui-draggable-dragging");
                if (pair.cbCheckPair instanceof Function) {
                    eventContext.blacklist = eventContext.blacklist || createUniqueSequence();
                    $tgtObj = $tgtObj.not(function (idx, elem) {
                        if (!pair.cbCheckPair(ui.draggable, $(elem), pair.srcSelector, pair.tgtSelector)) {
                            eventContext.blacklist.pushFront(elem);
                            return true;
                        }
                    });
                }
                var etc = { srcSelector: pair.srcSelector, tgtSelector:pair.tgtSelector, };
                pair.visualcue(e.type, ui.draggable, $tgtObj, etc);
                pair.cbActivate(e.type, ui.draggable, $tgtObj, etc);
            }
        }
        return false;
    };

    var dropDeactivateHandler = function(e, ui) {
        if (!eventContext) {
            return false;
        }
        var pair = grabPair(ui.draggable, $(e.target));
        if (pair && pair !== eventContext.focusedPair) {
            var iii = eventContext.pairs.indexOf(pair);
            if (iii > -1) {
                eventContext.pairs.splice(iii, 1);
                var $tgtObj = $(pair.tgtSelector).filter(function() {
                    return ! rejectTarget(this, eventContext);
                });
                var etc = { srcSelector: pair.srcSelector, tgtSelector:pair.tgtSelector, };
                pair.visualcue(e.type, ui.draggable, $tgtObj, etc);
                pair.cbDeactivate(e.type, ui.draggable, $tgtObj, etc);
                if (eventContext.pairs.length === 0) {
                    eventContext = null;
                }
            }
        }
        return false;
    };

    var dropOverHandler = function(e, ui) {
        if (rejectTarget(e.target, eventContext)) {
            return false;
        }
        var pair = grabPair(ui.draggable, $(e.target));
        if (pair) {
            var hitTargets = eventContext.hitTargets || (eventContext.hitTargets = createUniqueSequence()),
                head = hitTargets.front(), $head = $(head), $tgt = $(e.target),
                prevPair = eventContext.focusedPair, etc;

            eventContext.$src = ui.draggable;
            eventContext.focusedPair = pair;

            if (head && head !== e.target) {
                // Resolve conflicts between multiple hits
                var selected = pair.cbConflict(ui.draggable, $head, $tgt) || $head;
                if (selected[0] === head) {
                    hitTargets.push(e.target);
                    eventContext.focusedPair = prevPair;
                    return false;
                }
                etc = { srcSelector:prevPair.srcSelector, tgtSelector:prevPair.tgtSelector, };
                prevPair.visualcue("dropout", eventContext.$src, $head, etc);
                prevPair.cbOut("dropout", eventContext.$src, $head, etc);
            }

            etc = { srcSelector:pair.srcSelector, tgtSelector:pair.tgtSelector, };
            pair.visualcue(e.type, eventContext.$src, $tgt, etc);
            pair.cbOver(e.type, eventContext.$src, $tgt, etc);

            hitTargets.pushFront(e.target);
        }
        return false;
    };

    var dropOutHandler = function(e, ui) {
        if (rejectTarget(e.target, eventContext)) {
            return false;
        }
        if (!eventContext) {
            return false;
        }
        var pair = eventContext.focusedPair, hitTargets = eventContext.hitTargets,
            head = hitTargets ? hitTargets.front() : null, $head = $(head), etc;
        if (pair) {
            hitTargets.remove(e.target);
            if (head === e.target) {
                etc = { srcSelector:pair.srcSelector, tgtSelector:pair.tgtSelector, };
                pair.visualcue(e.type, eventContext.$src, $head, etc);
                pair.cbOut(e.type, eventContext.$src, $head, etc);

                if (hitTargets.length > 1) {
                    var i, c, selected = $(hitTargets[0]);
                    for (i=1,c=hitTargets.length; i<c; ++i) {
                        selected = pair.cbConflict(eventContext.$src, selected, $(hitTargets[i])) || selected;
                    }
                    hitTargets.pushFront(selected[0]);
                }
                else if (hitTargets.length === 0) {
                    eventContext.focusedPair = eventContext.$src = eventContext.hitTargets = null;
                    return false;
                }

                head = hitTargets.front(), $head = $(head);
                eventContext.focusedPair = pair = grabPair(eventContext.$src, $head);
                etc = { srcSelector:pair.srcSelector, tgtSelector:pair.tgtSelector, };
                pair.visualcue("dropover", eventContext.$src, $head, etc);
                pair.cbOver("dropover", eventContext.$src, $head, etc);
            }
        }
        return false;
    };

    var dropHandler = function(e, ui) {
        if (rejectTarget(e.target, eventContext)) {
            return false;
        }
        if (!eventContext.focusedPair) {
            return false;
        }
        var pair = grabPair(ui.draggable, $(e.target));
        if (pair) {
            var hitTargets = eventContext.hitTargets, head = hitTargets.front(), $head = $(head);
            if (head === e.target) {
                var etc = { srcSelector:pair.srcSelector, tgtSelector:pair.tgtSelector, };
                pair.visualcue(e.type, ui.draggable, $head, etc);
                pair.cbDrop(e.type, ui.draggable, $head, etc);
                eventContext.focusedPair = eventContext.$src = eventContext.hitTargets = null;
            }
        }
        return false;
    };

    beforeEach(function() {
        jasmine.getFixtures().load("basic.html");

        this.visualcue = function(eventType, $srcObj, $tgtObj) {};
        this.onactivate = function(eventType, $srcObj, $tgtObj) {};
        this.ondeactivate = function(eventType, $srcObj, $tgtObj) {};
        this.onover = function(eventType, $srcObj, $tgtObj) {};
        this.onout = function(eventType, $srcObj, $tgtObj) {};
        this.ondrop = function(eventType, $srcObj, $tgtObj) {};
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

            // Simulate dropactivate events
            this.simulateDropActivateCalls(srcSelector);
            expect(eventContext.pairs.length).toBe(2);
            expect(this.visualcue).toHaveBeenCalledTimes(2);
            expect(this.onactivate).toHaveBeenCalledTimes(2);

            // Simulate dropover events
            this.visualcue.calls.reset();
            this.simulateDropOverCall(this.tgtObjs[0]);
            expect(this.visualcue).not.toHaveBeenCalled();
            expect(this.onover).not.toHaveBeenCalled();

            // Simulate drop events
            this.simulateDropCall(this.tgtObjs[0]);
            expect(this.visualcue).not.toHaveBeenCalled();
            expect(this.ondrop).not.toHaveBeenCalled();

            // Simulate dropdeactivate events
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

    describe("Checking Pair Objects", function() {
        beforeEach(function() {
            this.rejectRow1 = function($src, $tgt) {
                return !$tgt.is(".row1");
            };

            spyOn(this, "rejectRow1").and.callThrough();
        });

        it("doesn't define a default callback for checking pair objects", function() {
            var ds = dndx().dataStore();
            expect(ds.protoPair.cbCheckPair).not.toEqual(jasmine.anything());

            function cb() {}
            dndx().oncheckpair(cb);
            expect(ds.protoPair.cbCheckPair).toBe(cb);
        });

        it("calls the callback and maintains the blacklist", function() {
            var srcSelector = "#draggable0";

            dndx(srcSelector)
                .targets(".row1").ondeactivate("fallback")
                .targets(".row2").ondeactivate("fallback")
                .targets(".row3").ondeactivate("fallback");

            dndx(srcSelector)
                .ondeactivate(function(eventType, $srcObj, $tgtObj) {
                    expect($tgtObj.is(".row1")).toBe(false);
                })
                .oncheckpair(this.rejectRow1);

            this.simulateDropActivateCalls(srcSelector);
            expect(eventContext.pairs.length).toBe(3);
            // The callback should be called for all target objects
            expect(this.rejectRow1).toHaveBeenCalledTimes(9);
            // The blacklist contains 3 objects because we reject objects with the class ".row1" only
            expect(eventContext.blacklist.length).toBe(3);

            this.simulateDropDeactivateCalls();

            dndx(srcSelector)
                .targets(".row1").ondeactivate(this.ondeactivate)
                .targets(".row2").ondeactivate(this.ondeactivate)
                .targets(".row3").ondeactivate(this.ondeactivate);
        });

        it("calls the callback for over/out/drop events and rejects objects in the blacklist", function() {
            var srcSelector = "#draggable0", tgt;

            dndx(srcSelector)
                .oncheckpair(this.rejectRow1);

            this.simulateDropActivateCalls(srcSelector);

            //***** Confirm that an object in the blacklist is rejected
            tgt = $(".row1.col1")[0];
            expect(eventContext.blacklist.indexOf(tgt)).not.toEqual(-1);

            this.simulateDropOverCall(tgt);
            expect(this.onover).not.toHaveBeenCalled();
            this.simulateDropOutCall(tgt);
            expect(this.onout).not.toHaveBeenCalled();

            this.simulateDropOverCall(tgt);
            this.simulateDropCall(tgt);
            expect(this.ondrop).not.toHaveBeenCalled();
            //*****/

            //***** Confirm that an object NOT in the blacklist is accepted
            tgt = $(".row2.col1")[0];
            expect(eventContext.blacklist.indexOf(tgt)).toEqual(-1);

            this.simulateDropOverCall(tgt);
            expect(this.onover).toHaveBeenCalledTimes(1);
            this.simulateDropOutCall(tgt);
            expect(this.onout).toHaveBeenCalledTimes(1);

            this.simulateDropOverCall(tgt);
            this.simulateDropCall(tgt);
            expect(this.ondrop).toHaveBeenCalledTimes(1);
            //*****/

            this.simulateDropDeactivateCalls();
        });
    });

    describe("Checking .nullify() API", function() {
        it("nullifies all visualcues and callbacks", function() {
            var srcSelector = "#draggable1", tgtSelector = ".row2",
                tgt = $(".row2.col1")[0], pair;
            pair = dndx(srcSelector, tgtSelector).pair;
            expect(pair.visualcue).toBe(this.visualcue);
            expect(pair.cbDrop).toBe(this.ondrop);

            dndx(srcSelector, tgtSelector).nullify();

            this.simulateDropActivateCalls(srcSelector);
            expect(this.visualcue).toHaveBeenCalledTimes(2);
            expect(this.onactivate).toHaveBeenCalledTimes(2);

            this.simulateDropOverCall(tgt);
            expect(this.onover).not.toHaveBeenCalled();

            this.simulateDropCall(tgt);
            expect(this.ondrop).not.toHaveBeenCalled();

            this.simulateDropDeactivateCalls();
        });
    });

    afterEach(function() {
        dndx().destroy();
    });

});

