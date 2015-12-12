var stdin = process.openStdin();
var patches;
var bug;
var step = 0;
var bugString = "";
var completeResult = "";
var patchArray = [];
var patchCount = 0;
var completeObject = {};
var solvingPath = 1;
var timimg = 0;

stdin.addListener ("data", function (d) {
    var input = d.toString().trim();
    if (step == 0) {
        recieveBug(input);
    }
    else if (step == 1) {
        recievePatch(input)
    }
    else if (step == 2) {
        recievePatchPattern(input)
    }
    else if (step == 3) {
        console.log('on progress...');
    }
});

function appStasrt () {
    inputBugMessage()
}

function inputBugMessage () {
    console.log('Input number of bug: ');
}

function inputPatchMessage () {
    console.log('Input number of patch: ');
}

function inputPatchPatternMessage () {
    console.log('input patch ' + (patchCount + 1) + ' pattern (time condition effect, example: 2 00- 0+- ):');
}

function recieveBug (input) {
    if (isNaN(parseInt(input))) {
        console.log('Invalid input....');
        inputBugMessage();
    }
    else {
        bug = parseInt(input);
        step = 1;
        inputPatchMessage();
    }
}

function recievePatch (input) {
    if (isNaN(parseInt(input))) {
        console.log('Invalid input....');
        inputPatchMessage();
    }
    else {
        patches = parseInt(input);
        createVariable();
    }
}

function createVariable () {
	bugString = "";
	for(var i = 0; i < bug; i++) {
		bugString+="+";
		completeResult+="-";
	}
	inputPatch();
}

function inputPatch () {
	step = 2;
	patchCount = 0;
	inputPatchPatternMessage();
}

function recievePatchPattern (input) {
    if (!validatePatchPattern(input)) {
        inputPatchPatternMessage();
    }
    else {
        var str = input.split(' ');
        var pathObj = {
            n: 'p' + (patchCount + 1),
            t: parseInt(str[0]),
            c: str[1],
            e: str[2]
        };
        patchArray.push(pathObj);
        patchCount++;
        if (patchCount < patches) {
            inputPatchPatternMessage()
        }
        else {
            step = 3;
            solve();
        }
    }
}

function solve () {
    console.log('Solving...');
	for(var i = 0 ; i < patchArray.length; i++) {
		console.log('Patch ' + (i + 1) + ' pattern: ' + patchArray[i].t + ' ' + patchArray[i].c + ' ' + patchArray[i].e);
	}
	var model = new Model(0, bugString, [], []);
	timimg = 0;
	solving(model);
}

function solving (model) {
    if (model.result == completeResult) {
        if (completeObject.time) {
            if (completeObject.time > model.time) {
                completeObject = model;
            }
        }
        else {
            completeObject = model;
        }
        endSolvingPath();
    }
    else {
        var conditionMatchCount = 0;
        for (var i = 0; i < patchArray.length; i++) {
            if (isCondition(patchArray[i].c, model.result)) {
                conditionMatchCount++;
            }
        }
        solvingPath += (conditionMatchCount - 1);
        for (var i = 0; i < patchArray.length; i++) {
            timimg++
            if (isCondition(patchArray[i].c, model.result)) {
                asynPatch(i, JSON.parse(JSON.stringify(model)), 1 * timimg);
            }
        }
        if (conditionMatchCount == 0) {
            endSolvingPath();
        }
    }
    
}

function asynPatch (index, model, time) {
    setTimeout(function () {
        model.result = patchResult(patchArray[index].e, model.result);
        model.time += patchArray[index].t;
        model.applyPatch.push(index);
        if (model.historyResult.indexOf(model.result) == -1) {
            model.historyResult.push(model.result);
            solving(JSON.parse(JSON.stringify(model)));
        }
        else {
            endSolvingPath();
        }
    }, time);
}

function isCondition (condition, result) {
	for(var i = 0; i <condition.length; i++) {
		if(condition[i] =='-' && result[i] != '-') {
			return false;
		}
		if (condition[i] == '+' && result[i] != '+') {
		    return false;
		}
	}
	return true;
}

function patchResult (effect, result) {
    for (var i = 0; i < effect.length; i++) {
        if (effect.charAt(i) == '-' || effect.charAt(i) == '+') {
            result = result.replaceAt(i, effect.charAt(i));
		}
	}
	return result;
}

function validatePatchPattern (pattern) {
    var isValid = true;
    var str = pattern.split(' ');
    if (str.length != 3) {
        console.log('Invalid patch pattern....');
        isValid = false;
    }
    else {
        if (isNaN(parseInt(str[0]))) {
            isValid = false;
            console.log('Patch time is invalid');
        }
        else if (str[1].length != bug) {
            console.log('Patch condition does not match bug length');
            isValid = false;
        }
        else if (str[2].length != bug) {
            console.log('Patch effect does not match bug length');
            isValid = false;
        }
        else {
            for (var i = 0 ; i < bug; i++) {
                if (str[1].charAt(i) != '0' && str[1].charAt(i) != '+' && str[1].charAt(i) != '-') {
                    console.log('Patch condition has invalid character');
                    isValid = false;
                    break;
                }
            }
            for (var i = 0 ; i < bug; i++) {
                if (str[2].charAt(i) != '0' && str[2].charAt(i) != '+' && str[2].charAt(i) != '-') {
                    console.log('Patch effect has invalid character');
                    isValid = false;
                    break;
                }
            }
        }
    }
    return isValid;
}

function Model (time, result, apply, history) {
    this.time = time;
    this.result = result;
    this.applyPatch = apply;
    this.historyResult = history;
}

function showResult () {
    console.log('');
    console.log('--------------- RESULT --------------------');
    if (completeObject.time) {
        var patchString = 'Patch step: ';
        var pathcsResult = 'Result of each step: ';
        for (var i = 0; i < completeObject.applyPatch.length; i++) {
            patchString += (completeObject.applyPatch[i] + 1) + ' ';
        }
        for (var i = 0; i < completeObject.historyResult.length; i++) {
            pathcsResult += (completeObject.historyResult[i]) + ' ';
        }
        console.log(patchString);
        console.log(pathcsResult);
        console.log('Time usage: ' + completeObject.time);
    }
    else {
        console.log('Can not solve this bug!');
    }
    console.log('--------------- END RESULT --------------------');
}

function exit () {
    console.log('exit....');
    process.exit(0);
}

function endSolvingPath () {
    solvingPath--;
    if (solvingPath == 0) {
        console.log('All path is end....');
        showResult();
        exit();
    }
}

String.prototype.replaceAt = function (index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
}

appStasrt();
