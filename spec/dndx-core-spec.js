/*global $ */
/*eslint no-undef:0*/

if (jasmine.createSamplePairs instanceof Function === false) {
    jasmine.createSamplePairs = function(sources, targets) {
        sources = sources || [ "#draggable0", "#draggable1", ];
        targets = targets || [ ".row1", ".row2", ".row3", ];
        var s, t;
        for (s=0; s<sources.length; ++s) {
            for (t=0; t<targets.length; ++t) {
                dndx(sources[s], targets[t]);
            }
        }
    };
}

describe("DNDX-CORE", function() {
    describe("Basic Constraints ---", function() {
        it("each call of dndx() returns a separate object", function() {
            var instances = [ dndx(), dndx(), ];
            expect(instances[0]).not.toBe(instances[1]);

            instances = [ dndx(".foo", ".bar"), dndx(".foo", ".bar"), ];
            expect(instances[0]).not.toBe(instances[1]);
        });

        it("dndx throws against unacceptable parameter combinations", function() {
            var f;

            f = function() {
                dndx(null, ".bar");
            }; 
            expect(f).toThrowError();

            f = function() {
                dndx(".foo");
                dndx(".foo", null);
            };
            expect(f).not.toThrowError();

            f = function() {
                dndx(null, null);
            };
            expect(f).toThrowError();

            f = function() {
                dndx(".foo", ".bar");
            };
            expect(f).not.toThrowError();
        });
    });
    
    describe("Managing Pairs ---", function() {
        beforeEach(function() {
            jasmine.getFixtures().load("basic.html");
        });

        it("loads fixture", function() {
            expect($(".draggable")[0]).toBeInDOM();
            expect($(".droppable")[0]).toBeInDOM();
        });

        it("should not create any pair when called without any parameter", function() {
            var ctx = dndx();
            expect(ctx).toEqual(jasmine.anything());
            expect(ctx.pair).not.toEqual(jasmine.anything());
            
            var ds = dndx().dataStore();
            expect(ds).toEqual(jasmine.anything());
            expect($.isEmptyObject(ds.pairs)).toBe(true);
        });

        function countPairs(pairs) {
            var count = 0;
            for (var src in pairs) {
                count += Object.keys(pairs[src]).length;
            }
            return count;
        }

        describe("Object Construction", function() {
            it("creates source groups", function() {
                var src = ["#draggable0",], tgt = [".row1", ".row2", ".row3",],
                    ds = dndx().dataStore(), ctx,
                    f = function() { console.assert(false); };

                ctx = dndx(src[0]).visualcue(f); // Create a source group
                // No pair should be created at this moment
                expect(ctx.pair).not.toEqual(jasmine.anything());
                expect(countPairs(ds.pairs)).toBe(0);

                // Create pairs with successive calls of dndx(srcSelector).targets()
                ctx = dndx(src[0]).targets(tgt[0]).targets(tgt[1]).targets(tgt[2]);
                expect(countPairs(ds.pairs)).toBe(3);
                expect(ctx.pair.visualcue).toBe(f); // Each pair need to inherit source group properties

                // dndx(srcSelector).targets(tgtSelector) and dndx(srcSelector, tgtSelector)
                // should return identical objects
                TEST_UTILS.objectsEqual(ctx, dndx(src[0], tgt[2]));

                f = function() {
                    dndx().targets(tgt[0]);
                };
                expect(f).toThrowError();
            });

            it("creates pairs", function() {
                var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                    pairCount = src.length*tgt.length,
                    ds = dndx().dataStore(), s, t, p; 

                jasmine.createSamplePairs(src, tgt);
                expect(countPairs(ds.pairs)).toEqual(pairCount);

                for (s=0; s<src.length; ++s) {
                    expect(ds.pairs[src[s]]).toEqual(jasmine.anything());
                    for (t=0; t<tgt.length; ++t) {
                        p = ds.pairs[src[s]][tgt[t]];
                        expect($.isEmptyObject(p)).toBe(false);
                    }
                }

                // jQuery UI's draggable & droppable objects should be created
                expect($("#draggable0.ui-draggable")).toBeInDOM();
                expect($("#draggable1.ui-draggable")).toBeInDOM();
                expect($(".row1.ui-droppable")).toBeInDOM();
                expect($(".row2.ui-droppable")).toBeInDOM();
                expect($(".row3.ui-droppable")).toBeInDOM();
            });

            it("can create a new pair from an existing settings", function() {
                var srcPair, newPair, draggables, newId;

                jasmine.createSamplePairs();

                draggables = $(".draggable"); 
                newId = draggables.length;
                draggables.last().after("<div id='draggable"+newId+"' class='draggable'><span>"+newId+"</span></div>");
                expect($("#draggable2")).toBeInDOM();

                dndx("#draggable0", ".row1").newPair("#draggable2", ".row1");
                srcPair = dndx("#draggable0", ".row1").pair, newPair = dndx("#draggable2", ".row1").pair;
                TEST_UTILS.objectsEqual(srcPair, newPair, true);

                dndx("#draggable0", ".row1").newPair("#draggable3", ".row1").ondrop(function() {});
                srcPair = dndx("#draggable0", ".row1").pair, newPair = dndx("#draggable3", ".row1").pair;
                expect(srcPair).not.toEqual(newPair);

                // Following invocation doesn't make sense, but let's confirm nothing happens anyway
                TEST_UTILS.objectsEqual(newPair, dndx("#draggable3", ".row1").newPair("#draggable3", ".row1").pair);

                newPair = dndx("#draggable0", ".row1").newPair(null, ".row4").pair;// same as .newPair("#draggable0", ".row4")
                TEST_UTILS.objectsEqual(newPair, dndx("#draggable0", ".row4").pair);
            });
        });

        describe("Object Removal", function() {
            it("removes all pairs at once", function() {
                var ds = dndx().dataStore(), removeUnderlingObjects = TEST_UTILS.getRandomBool(); 

                jasmine.createSamplePairs();

                dndx().remove(removeUnderlingObjects);
                expect(countPairs(ds.pairs)).toBe(0);

                if (removeUnderlingObjects)
                    expect($(".ui-draggable, .ui-droppable")).not.toBeInDOM();
                else
                    expect($(".ui-draggable, .ui-droppable")).toBeInDOM();
            });

            it("removes pairs associated with a specific source", function() {
                var ds = dndx().dataStore(), removeUnderlingObjects = TEST_UTILS.getRandomBool(); 

                jasmine.createSamplePairs();

                dndx("#draggable1").remove(removeUnderlingObjects);
                expect(countPairs(ds.pairs)).toEqual(3);
                expect(ds.pairs["#draggable1"]).toEqual(undefined);

                if (removeUnderlingObjects)
                    expect($("#draggable1.ui-draggable")).not.toBeInDOM();
                else
                    expect($("#draggable1.ui-draggable")).toBeInDOM();

                expect($("#draggable0.ui-draggable")).toBeInDOM();
                expect($(".row1.ui-droppable")).toBeInDOM();
                expect($(".row2.ui-droppable")).toBeInDOM();
                expect($(".row3.ui-droppable")).toBeInDOM();
            });

            it("removes individual pairs", function() {
                var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                    pairCount = src.length*tgt.length,
                    ds = dndx().dataStore(), removeUnderlingObjects = TEST_UTILS.getRandomBool(); 

                jasmine.createSamplePairs(src, tgt);

                dndx("#draggable0", ".row1").remove(removeUnderlingObjects);
                expect(countPairs(ds.pairs)).toEqual(--pairCount);
                expect(ds.pairs["#draggable0"]).toEqual(jasmine.anything());
                expect(ds.pairs["#draggable0"][".row1"]).toEqual(undefined);

                dndx("#draggable0", ".row2").remove(removeUnderlingObjects);
                expect(countPairs(ds.pairs)).toEqual(--pairCount);
                expect(ds.pairs["#draggable0"][".row2"]).toEqual(undefined);

                dndx("#draggable0", ".row3").remove(removeUnderlingObjects);
                expect(countPairs(ds.pairs)).toEqual(--pairCount);
                expect(ds.pairs["#draggable0"]).toEqual(undefined);
                expect(ds.pairs["#draggable1"]).toEqual(jasmine.anything());

                if (removeUnderlingObjects)
                    expect($("#draggable0.ui-draggable")).not.toBeInDOM();
                else
                    expect($("#draggable0.ui-draggable")).toBeInDOM();

                expect($(".row1.ui-droppable")).toBeInDOM();
                expect($(".row2.ui-droppable")).toBeInDOM();
                expect($(".row3.ui-droppable")).toBeInDOM();
            });

        });

        describe("Cursor Type Management", function() {
            it("sets cursor types at the time of calling .cursor()", function() {
                var ds = dndx().dataStore();
                jasmine.createSamplePairs();

                dndx().cursor("auto", "alias");
                expect(ds.protoPair.cursorForDrag).toBe("auto");
                expect($("#draggable0").css("cursor")).toBe("alias");

                var src = dndx("#draggable0").cursor("default", "help").sourceGroup();
                expect(src.cursorForDrag).toBe("default");
                expect(ds.protoPair.cursorForDrag).toBe("auto");
                expect($("#draggable0").css("cursor")).toBe("help");
            });

            it("sets cursor types when refreshing objects", function() {
                dndx(".draggable", ".droppable");
                dndx().cursor("alias", "crosshair");
                var obj = $("<div class='draggable'>").appendTo($("body"));
                expect(obj).toBeInDOM();
                var src = dndx(".draggable").refresh().sourceGroup();
                expect(src.cursorForDrag).toBe("alias");
                expect(obj.css("cursor")).toBe("crosshair");
                expect($(".draggable").css("cursor")).toBe("crosshair");
            });

            it("inherits global cursor types when creating new objects", function() {
                dndx().cursor("alias", "context-menu");
                dndx(".draggable", ".droppable");
                expect($(".draggable").css("cursor")).toBe("context-menu");
            });
        });

        it("disables or enables pairs", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                s, t, pair; 

            jasmine.createSamplePairs(src, tgt);

            // Disable in the global level
            dndx().disable(); 
            for (s=0; s<src.length; ++s) {
                for (t=0; t<tgt.length; ++t) {
                    pair = dndx(src[s], tgt[t]).pair;
                    expect(pair.disabled).toBe(true);
                }
            }

            // Enable in a source group level
            dndx(src[1]).enable();
            for (t=0; t<tgt.length; ++t) {
                pair = dndx(src[1], tgt[t]).pair;
                expect(pair.disabled).toBe(false);
            }
            for (t=0; t<tgt.length; ++t) {
                pair = dndx(src[0], tgt[t]).pair;
                expect(pair.disabled).toBe(true);
            }

            // Disable/enable in a pair level
            pair = dndx(src[1], tgt[0]).enable().pair;
            expect(pair.disabled).toBe(false);
            pair = dndx(src[1], tgt[1]).pair;
            expect(pair.disabled).toBe(false);
            pair = dndx(src[1], tgt[2]).disable().pair;
            expect(pair.disabled).toBe(true);
        });

        it("can iterate over each pair", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                s, t, pairs = []; 

            for (s=0; s<src.length; ++s) {
                for (t=0; t<tgt.length; ++t) {
                    pairs.push([src[s], tgt[t], ]);
                }
            }
            expect(pairs.length).toBe(6);

            jasmine.createSamplePairs(src, tgt);

            dndx.forEachPair(function(srcSelector, tgtSelector) {
                var idx = -1, i, c, el;
                for (i=0, c=pairs.length; i<c; ++i) {
                    el = pairs[i];
                    if (el[0] === srcSelector && el[1] === tgtSelector) {
                        idx = i;
                        break;
                    }
                }
                expect(idx).toBeGreaterThan(-1);
                pairs.splice(idx, 1);
            });
            expect(pairs.length).toBe(0);
        });

        it("can iterate over each selector", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",];

            jasmine.createSamplePairs(src, tgt);

            dndx.forEachSelector(function(srcSelector) {
                var idx = src.indexOf(srcSelector);
                expect(idx).toBeGreaterThan(-1);
                src.splice(idx, 1);
            }, function(tgtSelector) {
                var idx = tgt.indexOf(tgtSelector);
                expect(idx).toBeGreaterThan(-1);
                tgt.splice(idx, 1);
            });
            expect(src.length).toBe(0);
            expect(tgt.length).toBe(0);
        });

        afterEach(function() {
            dndx.destroy();
        });
    });

    describe("Setting jQuery UI Draggables & Droppables ---", function() {
        beforeEach(function() {
            jasmine.getFixtures().load("basic.html");
        });

        it("creates jQuery UI Draggables & Droppables properly", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                instance, s, t;

            jasmine.createSamplePairs(src, tgt);

            for (s=0; s<src.length; ++s) {
                instance = $(src[s]).draggable("instance");
                expect(instance.options).toEqual(jasmine.objectContaining({
                    appendTo:"body",
                    containment:"document",
                }));
            }

            for (t=0; t<tgt.length; ++t) {
                instance = $(tgt[t]).droppable("instance");
                expect(instance.options).toEqual(jasmine.objectContaining({
                    greedy:false,
                }));
            }
        });

        it("intercepts draggable helper construction", function() {
            var chainable, helper, clone;

            // No helper specified
            chainable = TEST_UTILS.getRandomBool() ? dndx("#draggable0", ".row0") : dndx("#draggable0");
            helper = $("#draggable0").draggable("option", "helper");
            expect(helper).toBe("original");

            // Set the helper as "clone"
            chainable.draggableOptions({ helper: "clone", });
            helper = $("#draggable0").draggable("option", "helper");
            expect(helper).toEqual(jasmine.any(Function));
            clone = helper.apply($("#draggable0")[0]);
            expect($(clone).data(dndx().sourceDataKeyName())).toBe("#draggable0");

            // Set the helper as callback
            function cloneIt() {
                return $(this).clone().removeAttr("id");
            }
            chainable.draggableOptions({ helper: cloneIt, });
            helper = $("#draggable0").draggable("option", "helper");
            expect(helper).toEqual(jasmine.any(Function));
            clone = helper.apply($("#draggable0")[0]);
            expect($(clone).data(dndx().sourceDataKeyName())).toBe("#draggable0");

            // The bottom line for this test:
            // Source selector string should be embedded into the cloned objects
            // whenever jQueryUI's Draggables create their 'helper' objects
        });

        it("intercepts draggable helper construction in the global level", function() {
            var ds, helper, clone;

            // No helper specified
            ds = dndx().dataStore();
            expect(ds.protoDraggableOptions.helper).not.toEqual(jasmine.anything());

            // Set the helper as "clone"
            ds = dndx().draggableOptions({ helper: "clone", }).dataStore();
            helper = ds.protoDraggableOptions.helper;
            expect(helper).toEqual(jasmine.any(Function));
            dndx("#draggable0");
            clone = helper.apply($("#draggable0")[0]);
            expect($(clone).data(dndx().sourceDataKeyName())).toBe("#draggable0");

            // Set the helper as callback
            function cloneIt() {
                return $(this).clone().removeAttr("id");
            }
            ds = dndx().draggableOptions({ helper: cloneIt, }).dataStore();
            helper = ds.protoDraggableOptions.helper;
            expect(helper).toEqual(jasmine.any(Function));
            clone = helper.apply($("#draggable0")[0]);
            expect($(clone).data(dndx().sourceDataKeyName())).toBe("#draggable0");
        });

        it("can extend options for draggables", function() {
            var instance;
            
            dndx("#draggable0", ".row1");
            instance = $("#draggable0").draggable("instance");

            dndx().draggableOptions({ appendTo:"parent", });
            expect(instance.options).toEqual(jasmine.objectContaining({ appendTo:"parent", }));

            dndx("#draggable1", ".row1").draggableOptions({ cursor:"auto", });
            expect(instance.options).toEqual(jasmine.objectContaining({ appendTo:"parent", cursor:"auto", }));
        });

        it("can extend options for droppables", function() {
            var instance;
            
            dndx("#draggable0", ".row1");
            instance = $(".row1").droppable("instance");

            dndx().droppableOptions({ greedy:true, });
            expect(instance.options).toEqual(jasmine.objectContaining({ greedy:true, }));

            dndx("#draggable1", ".row1").droppableOptions({ scope:"tasks", });
            expect(instance.options).toEqual(jasmine.objectContaining({ greedy:true, scope:"tasks", }));
        });

        it("embeds keys into DOM objects when created", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                s, t, $s, keyName = dndx().sourceDataKeyName();

            jasmine.createSamplePairs(src, tgt);

            for (s=0; s<src.length; ++s) {
                $s = $(src[s]);
                for (t=0; t<tgt.length; ++t) {
                    expect($s.data(keyName)).toBe(src[s]);
                }
            }
        });

        afterEach(function() {
            dndx.destroy();
        });
    });

    describe("Managing Callbacks ---", function() {
        beforeEach(function() {
            //jasmine.getFixtures().load("basic.html");
        });

        it("can invoke the default callbacks", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                s, t, pair;

            for (s=0; s<src.length; ++s) {
                for (t=0; t<tgt.length; ++t) {
                    pair = dndx(src[s], tgt[t]).pair;
                    expect(pair.cbConflict instanceof Function).toBe(true);
                    expect(pair.cbStart instanceof Function).toBe(true);
                    expect(pair.cbStop instanceof Function).toBe(true);
                    expect(pair.cbActivate instanceof Function).toBe(true);
                    expect(pair.cbDeactivate instanceof Function).toBe(true);
                    expect(pair.cbOver instanceof Function).toBe(true);
                    expect(pair.cbOut instanceof Function).toBe(true);
                    expect(pair.cbDrop instanceof Function).toBe(true);
                }
            }

            // Callbacks should be invocable after set with null or undefined
            pair = dndx(src[0], tgt[2]).ondrop(null).pair;
            expect(pair.cbDrop instanceof Function).toBe(true);
            pair = dndx(src[0], tgt[2]).onover().pair;
            expect(pair.cbOver instanceof Function).toBe(true);
        });

        function cbGlobal() { console.log("for all pairs"); }
        function cbSrcGrp() { console.log("for a source group"); }
        function cbPair() { console.log("for a pair"); }

        it("can override callbacks in the global level", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                s, t, pair;

            // Override each callback in the global level
            dndx().onconflict(cbGlobal);
            dndx().onstart(cbGlobal);
            dndx().onstop(cbGlobal);
            dndx().onactivate(cbGlobal);
            dndx().ondeactivate(cbGlobal);
            dndx().onover(cbGlobal);
            dndx().onout(cbGlobal);
            dndx().ondrop(cbGlobal);

            // Now each pair should inherit callbacks overridden globally
            for (s=0; s<src.length; ++s) {
                for (t=0; t<tgt.length; ++t) {
                    pair = dndx(src[s], tgt[t]).pair;
                    expect(pair.cbConflict).toBe(cbGlobal);
                    expect(pair.cbStart).toBe(cbGlobal);
                    expect(pair.cbStop).toBe(cbGlobal);
                    expect(pair.cbActivate).toBe(cbGlobal);
                    expect(pair.cbDeactivate).toBe(cbGlobal);
                    expect(pair.cbOver).toBe(cbGlobal);
                    expect(pair.cbOut).toBe(cbGlobal);
                    expect(pair.cbDrop).toBe(cbGlobal);
                }
            }
        });

        it("can override callbacks in a source group level", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                s, t, pair;

            dndx().onout(cbGlobal); // Override in a global level
            dndx().onover(cbGlobal); // This callback will be overwritten by the next statement

            for (s=0; s<src.length; ++s) {
                dndx(src[s]).onover(cbSrcGrp); // Override in a source group level
            }

            for (s=0; s<src.length; ++s) {
                for (t=0; t<tgt.length; ++t) {
                    pair = dndx(src[s], tgt[t]).pair;
                    expect(pair.cbOver).toBe(cbSrcGrp); // Inherits a callback from the source level
                    expect(pair.cbOut).toBe(cbGlobal); // Inherits a callback from the global level
                }
            }
        });

        it("can override callbacks in a pair level", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                s, t, pair;

            // Override in a global level
            dndx().onactivate(cbGlobal);
            dndx().onover(cbGlobal);
            dndx().ondrop(cbGlobal);

            for (s=0; s<src.length; ++s) {
                dndx(src[s]).onover(cbSrcGrp); // Override in the source group level
            }

            for (s=0; s<src.length; ++s) {
                for (t=0; t<tgt.length; ++t) {
                    pair = dndx(src[s], tgt[t]).pair;
                    expect(pair.cbActivate).toBe(cbGlobal);
                    expect(pair.cbOver).toBe(cbSrcGrp);
                    expect(pair.cbDrop).toBe(cbGlobal);
                }
            }

            pair = dndx(src[0], tgt[2]).ondrop(cbPair).pair; // Override in a pair level

            expect(pair.cbDrop).toBe(cbPair);
            expect(pair.cbOver).toBe(cbSrcGrp);
            expect(pair.cbActivate).toBe(cbGlobal);
            expect(dndx(src[1], tgt[2]).pair.cbDrop).toBe(cbGlobal);
            expect(dndx(src[1], tgt[2]).pair.cbOver).toBe(cbSrcGrp);
        });

        it("can fallback to a callback in an upper lavel", function() {
            var src = ["#draggable0",], tgt = [".row1", ".row2",],
                t, pair;

            function f() { console.error(false); }

            // Override in the global level
            dndx().onactivate(cbGlobal);
            dndx().onover(cbGlobal);
            dndx().ondrop(cbGlobal);

            dndx(src[0]).onover(cbSrcGrp); // Override in a source group level
            dndx(src[0]).ondrop(cbSrcGrp); // Override in a source group level

            dndx(src[0], tgt[0]).ondrop(cbPair); // Override in a pair level

            for (t=0; t<tgt.length; ++t) {
                pair = dndx(src[0], tgt[t]).pair;
                expect(pair.cbActivate).toBe(cbGlobal);
                expect(pair.cbOver).toBe(cbSrcGrp);
            }
            pair = dndx(src[0], tgt[0]).pair;
            expect(pair.cbDrop).toBe(cbPair);
            pair = dndx(src[0], tgt[1]).pair;
            expect(pair.cbDrop).toBe(cbSrcGrp);

            // A callback overridden in a source group level fallbacks to the global level
            dndx(src[0]).onover("fallback");
            pair = dndx(src[0], tgt[0]).pair;
            expect(pair.cbOver).toBe(cbGlobal);

            // Now it should be affected by any of the later changes in a global level
            dndx().onover(f);
            pair = dndx(src[0], tgt[0]).pair;
            expect(pair.cbOver).toBe(f);

            // A callback overridden in a pair level fallbacks to its source group level
            pair = dndx(src[0], tgt[0]).ondrop("fallback").pair;
            expect(pair.cbDrop).toBe(cbSrcGrp);
            expect(dndx(src[0], tgt[1]).pair.cbDrop).toBe(cbSrcGrp);

            // Now it should be affected by any of the later changes in its source group level
            dndx(src[0]).ondrop(f);
            expect(dndx(src[0], tgt[0]).pair.cbDrop).toBe(f);
            expect(dndx(src[0], tgt[1]).pair.cbDrop).toBe(f);

            // Callbacks overridden in the global level fallback to themselves
            dndx().onactivate("fallback");
            expect(dndx(src[0], tgt[0]).pair.cbActivate).toBe(cbGlobal);
            expect(dndx(src[0], tgt[1]).pair.cbActivate).toBe(cbGlobal);
        });

        afterEach(function() {
            dndx.destroy();
        });
    });

    describe("Managing Visualcues ---", function() {
        it("throws against invalid builtin visualcue names", function() {
            var f = function() {
                dndx().visualcue("nonexisting-visualcue");
            }; 
            expect(f).toThrowError();
        });

        it("can invoke the default visualcue", function() {
            expect(dndx().dataStore().protoPair.visualcue instanceof Function).toBe(true);
        });

        it("can override visualcues in the global level", function() {
            var vcDefault = dndx().dataStore().protoPair.visualcue, vc;

            // Set the global visualcue
            vc = dndx().visualcue("Swing").dataStore().protoPair.visualcue;
            expect(vc instanceof Function).toBe(true);
            expect(vcDefault).not.toBe(vc);

            // Set the global visualcue to the default version
            dndx().visualcue("Nothing");
            vc = dndx("#draggable0", ".row1").pair.visualcue;
            expect(vcDefault).toBe(vc);
            dndx().visualcue(null); // A null is accepted and same as calling .visualcues("Nothing")
            expect(vcDefault).toBe(vc);
        });

        it("can override visualcues in a source group level", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                t, pair, vcGlobal, vcSrcGrp;

            vcGlobal = dndx().visualcue("Overlay").dataStore().protoPair.visualcue; // Override in the global level
            expect(vcGlobal instanceof Function).toBe(true);
            vcSrcGrp = dndx(src[1]).visualcue("Swing").sourceGroup().visualcue; // Override in a source group level
            expect(vcSrcGrp instanceof Function).toBe(true);

            for (t=0; t<tgt.length; ++t) {
                pair = dndx(src[0], tgt[t]).pair;
                expect(pair.visualcue).toBe(vcGlobal);
            }
            for (t=0; t<tgt.length; ++t) {
                pair = dndx(src[1], tgt[t]).pair;
                expect(pair.visualcue).toBe(vcSrcGrp);
            }
        });

        it("can override visualcues in a pair level", function() {
            var src = ["#draggable0", "#draggable1",], tgt = [".row1", ".row2", ".row3",],
                pair, vcGlobal, vcSrcGrp;

            // Override in a global level
            vcGlobal = dndx().visualcue("Overlay").dataStore().protoPair.visualcue;
            // Override in a source group level
            vcSrcGrp = dndx(src[0]).visualcue("Swing").sourceGroup().visualcue;

            pair = dndx(src[0], tgt[2]).visualcue("Exterior").pair; // Override in a pair level
            expect(pair.visualcue instanceof Function).toBe(true);
            expect(pair.visualcue).not.toBe(vcGlobal);
            expect(pair.visualcue).not.toBe(vcSrcGrp);

            pair = dndx(src[0], tgt[1]).pair;
            expect(pair.visualcue).toBe(vcSrcGrp);
            pair = dndx(src[0], tgt[0]).pair;
            expect(pair.visualcue).toBe(vcSrcGrp);

            pair = dndx(src[1], tgt[1]).pair;
            expect(pair.visualcue).toBe(vcGlobal);

            function f() { console.assert(false); }
            vc = dndx(src[1], tgt[0]).visualcue(f).pair.visualcue;
            expect(vc).toBe(f);
        });

        afterEach(function() {
            dndx.destroy();
        });
    });

    describe("Unique Sequence ---", function() {
        beforeEach(function() {
            this.seq = dndx().uniqueSequence();
            expect(this.seq instanceof Array).toBe(true);
            expect(this.seq.length).toBe(0);

            var arr = TEST_UTILS.getRandomIntArray(10, -50, 50, true);
            expect(TEST_UTILS.unique(arr)).toBe(true);
            for (var i=0; i<arr.length; ++i) {
                this.seq.push(arr[i]);
            }
        });

        it("swaps elements", function() {
            var index0 = TEST_UTILS.getRandomInt(), index1 = TEST_UTILS.getRandomInt(), 
                item0 = this.seq[index0], item1 = this.seq[index1];
            this.seq.swap(index0, index1);
            expect(this.seq[index0]).toBe(item1);
            expect(this.seq[index1]).toBe(item0);
        });

        it("pushes elements", function() {
            var iii = TEST_UTILS.getRandomInt() % this.seq.length, c = this.seq.length, 
                item = this.seq[iii], prev, head = this.seq.front();
            prev = this.seq.pushFront(item);
            expect(c).toBe(this.seq.length);
            expect(this.seq[0]).toBe(item);
            expect(prev).toBe(head);

            do {
                item = TEST_UTILS.getRandomInt();
            }
            while (this.seq.indexOf(item) > -1);
            head = this.seq.front();
            prev = this.seq.pushFront(item);
            expect(c).toBe(this.seq.length - 1);
            expect(this.seq[0]).toBe(item);
            expect(prev).toBe(head);

            head = this.seq.front();
            prev = this.seq.pushFront(head);
            expect(c).toBe(this.seq.length - 1);
            expect(prev).toBe(this.seq[0]);

            this.seq.splice(0);
            expect(this.seq.length).toBe(0);
            expect(this.seq.front()).toBe(null);

            prev = this.seq.pushFront(item);
            expect(this.seq.length).toBe(1);
            expect(this.seq[0]).toBe(item);
            expect(prev).toBe(null);
        });

        it("removes elements", function() {
            var iii = TEST_UTILS.getRandomInt() % this.seq.length, c = this.seq.length, item = this.seq[iii];
            var removed = this.seq.remove(item);
            expect(c).toBe(this.seq.length + 1);
            expect(this.seq.indexOf(item)).toBe(-1);
            expect(removed).toBe(item);

            item = this.seq.front();
            this.seq.splice(0);
            removed = this.seq.remove(item);
            expect(removed).toBe(null);
        });
    });

    afterAll(function() {
        dndx.destroy();
    });

});
