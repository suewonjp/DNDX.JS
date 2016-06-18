/*eslint no-undef:0*/

var TEST_UTILS = {};

TEST_UTILS.swap = function(item0, item1) {
    var tmp = item0;
    item0 = item1;
    item1 = tmp;
    return [ item0, item1, ];
};

TEST_UTILS.getRandomFloat = function(lowerBound, upperBound) {
    console.assert(typeof lowerBound === "number" && typeof upperBound === "number" && lowerBound <= upperBound);
    return Math.random() * (upperBound - lowerBound) + lowerBound;
};

TEST_UTILS.getRandomInt = function(lowerBound, upperBound) {
    if (lowerBound !== 0) lowerBound = lowerBound || 0;
    if (upperBound !== 0) upperBound = upperBound || 0xffff;
    console.assert(typeof lowerBound === "number" && typeof upperBound === "number");
    if (lowerBound > upperBound) {
        var tmp = TEST_UTILS.swap(lowerBound, upperBound);
        lowerBound = tmp[0]; upperBound = tmp[1];
    }
    return Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
};

TEST_UTILS.getRandomBool = function() {
    return Math.random() < 0.5;
};

TEST_UTILS.getRandomFloatArray = function(size, lowerBound, upperBound) {
    if (size <= 0)
        return [];
    if (lowerBound !== 0) lowerBound = lowerBound || -10;
    if (upperBound !== 0) upperBound = upperBound || 10;
    console.assert(typeof lowerBound === "number" && typeof upperBound === "number");
    if (lowerBound > upperBound) {
        var tmp = TEST_UTILS.swap(lowerBound, upperBound);
        lowerBound = tmp[0]; upperBound = tmp[1];
    }
    var arr = new Array(size), i;
    for (i=0; i<size; ++i) {
        arr[i] = TEST_UTILS.getRandomFloat(lowerBound, upperBound);
    }
    return arr;
};

TEST_UTILS.shuffleArray = function(arr) {
    console.assert(arr && arr.length && arr[0]); 
    var i = 0, j = 0, temp = null;

    for (i = arr.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
};

TEST_UTILS.getUniqueRandomIntArray = function(arr, lowerBound, upperBound, sorted) {
    console.assert(arr instanceof Array && arr.length > 0 && upperBound-lowerBound >= arr.length);
    var i, c = arr.length, step = (upperBound - lowerBound) / c;
    arr[0] = TEST_UTILS.getRandomInt(lowerBound, lowerBound+step);
    for (i=1; i<c; ++i) {
        arr[i] = TEST_UTILS.getRandomInt(arr[i-1], lowerBound+step*(i+1));
        if (arr[i-1] === arr[i]) {
            arr[i] = arr[i-1] + TEST_UTILS.getRandomInt(1, step);
        }
    }
    if (!sorted) {
        TEST_UTILS.shuffleArray(arr);
    }
};

TEST_UTILS.getRandomIntArray = function(size, lowerBound, upperBound, uniqueSequence) {
    if (size <= 0)
        return [];
    if (lowerBound !== 0) lowerBound = lowerBound || 0;
    if (upperBound !== 0) upperBound = upperBound || 0xffff;
    console.assert(typeof lowerBound === "number" && typeof upperBound === "number");
    if (lowerBound > upperBound) {
        var tmp = TEST_UTILS.swap(lowerBound, upperBound);
        lowerBound = tmp[0]; upperBound = tmp[1];
    }
    var arr = new Array(size), i;
    if (uniqueSequence) {
        TEST_UTILS.getUniqueRandomIntArray(arr, lowerBound, upperBound);
    }
    else {
        for (i=0; i<size; ++i) {
            arr[i] = TEST_UTILS.getRandomInt(lowerBound, upperBound);
        }
    }
    return arr;
};

TEST_UTILS.sorted = function(arr, descending, comparator) { 
    var t = descending ? 1 : -1; 
    comparator = comparator || function(a,b){ return a-b; };
    console.assert(comparator instanceof Function);
    for (var i=0,c=arr.length-1; i<c; ++i) {
        if (comparator(arr[i], arr[i+1]) * t < 0) 
            return false;
    }
    return true;
};

TEST_UTILS.unique = function(arr) {
    if (!arr || arr instanceof Set)
        return true;
    var len = arr.length;
    for (var i=1; i<len; ++i) {
        if (arr[i - 1] == arr[i])
            return false;
    }
    return true;
};

TEST_UTILS.objectsEqual = function(obj0, obj1, strict) {
    expect(obj0).toEqual(jasmine.objectContaining(obj1));
    expect(obj1).toEqual(jasmine.objectContaining(obj0));
    if (strict === true) {
        var i, k, keys = Object.keys(obj0), c = keys.length;
        expect(c).toBe(Object.keys(obj1).length);
        for (i=0; i<c; ++i) {
            k = keys[i];
            expect(obj0[k]).toEqual(obj1[k]);
        }
    }
};

describe("TEST_UTILS", function() {

    describe("TEST_UTILS.swap", function() {
        it("swaps parameters", function() {
            var item0 = "a", item1 = "b";
            var tmp = TEST_UTILS.swap(item0, item1);
            item0 = tmp[0]; item1 = tmp[1];
            expect(item0).toBe("b");
            expect(item1).toBe("a");
        });
    });

    describe("TEST_UTILS.getRandomFloatArray", function() {
        it("works on an empty array", function() { 
            expect(TEST_UTILS.getRandomFloatArray(0, 0, 1)).toEqual([]);
        });

        it("respects size", function() { 
            var size = TEST_UTILS.getRandomInt(1, 99);

            expect(TEST_UTILS.getRandomFloatArray(size, 0, 1).length).toBe(size);
        });

        it("respects bounds", function() { 
            var size = TEST_UTILS.getRandomInt(1, 99),
                lb = TEST_UTILS.getRandomFloat(-100, 0),
                ub = TEST_UTILS.getRandomFloat(0, 100),
                arr = TEST_UTILS.getRandomFloatArray(size, lb, ub);

            expect(Math.min.apply(null, arr)).not.toBeLessThan(lb);
            expect(Math.max.apply(null, arr)).toBeLessThan(ub);
        });

        it("is random", function() { 
            var size = TEST_UTILS.getRandomInt(1, 99),
                arr0 = TEST_UTILS.getRandomFloatArray(size),
                arr1 = TEST_UTILS.getRandomFloatArray(size);

            expect(arr0).not.toEqual(arr1);
        });
    });

    describe("TEST_UTILS.getUniqueRandomIntArray", function() {
        it("produces arrays of unique elements", function() {
            var c = 30, arr = new Array(c), lb = -0xff, ub = 0xff, i;
            TEST_UTILS.getUniqueRandomIntArray(arr, lb, ub, true);
            expect(typeof arr[0] === "number").toBe(true);
            for (i=1; i<c; ++i) {
                expect(typeof arr[i] === "number").toBe(true);
                expect(arr[i-1]).toBeLessThan(arr[i]);
            }

            lb = 0, ub = 30;
            TEST_UTILS.getUniqueRandomIntArray(arr, lb, ub, true);
            for (i=1; i<c; ++i) {
                expect(arr[i] - arr[i-1]).toBe(1);
            }
        });
    });

    describe("TEST_UTILS.getRandomIntArray", function() {
        it("works on an empty array", function() { 
            expect(TEST_UTILS.getRandomIntArray(0, 0, 1)).toEqual([]);
        });

        it("respects size", function() { 
            var size = TEST_UTILS.getRandomInt(1, 99);

            expect(TEST_UTILS.getRandomIntArray(size, 0, 1).length).toBe(size);
        });

        it("respects bounds", function() { 
            var size = TEST_UTILS.getRandomInt(1, 99),
                lb = TEST_UTILS.getRandomInt(-100, 0),
                ub = TEST_UTILS.getRandomInt(0, 100),
                arr = TEST_UTILS.getRandomIntArray(size, lb, ub);

            expect(Math.min.apply(null, arr)).not.toBeLessThan(lb);
            expect(Math.max.apply(null, arr)).toBeLessThan(ub);
        });

        it("is random", function() { 
            var size = TEST_UTILS.getRandomInt(1, 99),
                arr0 = TEST_UTILS.getRandomIntArray(size),
                arr1 = TEST_UTILS.getRandomIntArray(size);

            expect(arr0).not.toEqual(arr1);
        });

        it("can build an unique array", function() {
            var size = TEST_UTILS.getRandomInt(1, 20),
                lb = TEST_UTILS.getRandomInt(-100, 0),
                ub = TEST_UTILS.getRandomInt(0, 100),
                arr = TEST_UTILS.getRandomIntArray(size, lb, ub, true);

            expect(TEST_UTILS.unique(arr)).toBe(true);
        });
    });

    describe("TEST_UTILS.sorted", function() {
        it("works on ascending arrays", function() {
            var arr = [ -3, -2, 0, 0, 3, 5, 5, 10, ];
            expect(TEST_UTILS.sorted(arr)).toBe(true);
        });

        it("works on descending arrays", function() {
            var arr = [ -3, -2, 0, 0, 3, 5, 5, 10, ];
            arr.reverse();
            expect(TEST_UTILS.sorted(arr, true)).toBe(true);
        });

        it("works on random sorted arrays", function() {
            var size = TEST_UTILS.getRandomInt(1, 99),
                lb = TEST_UTILS.getRandomFloat(-100, 0),
                ub = TEST_UTILS.getRandomFloat(0, 100),
                arr = TEST_UTILS.getRandomFloatArray(size, lb, ub);

            arr.sort(function(a, b) { return a - b; });
            expect(TEST_UTILS.sorted(arr)).toBe(true);
            arr.reverse();
            expect(TEST_UTILS.sorted(arr, true)).toBe(true);
        });
    });

    describe("TEST_UTILS.unique", function() {
        it("is tolerable with empty inputs", function() {
            expect(TEST_UTILS.unique()).toBe(true);
            expect(TEST_UTILS.unique(null)).toBe(true);
            expect(TEST_UTILS.unique([])).toBe(true);
            //expect(TEST_UTILS.unique(new Set())).toBe(true);
        });

        //it("works on Sets", function() {
            //expect(TEST_UTILS.unique(new Set([0, 1, 2, 2,]))).toBe(true);
        //});

        it("works on Arrays", function() {
            expect(TEST_UTILS.unique([0,])).toBe(true);
            expect(TEST_UTILS.unique([0, 1, 2,])).toBe(true);
            expect(TEST_UTILS.unique([0, 1, 2, 2,])).toBe(false);
            expect(TEST_UTILS.unique(["","",])).toBe(false);
        });
    });

}); // describe("TEST_UTILS", function() {

