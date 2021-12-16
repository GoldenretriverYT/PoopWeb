class PoopScriptEnv {
    GLOBAL_VARS = {};
    #console = null;
    #strict = false;
    #timeoutTime = 2000;
    #intervals = {};
    #intervalIndex = 0;
    #mainExecStarted = 0;

    GLOBAL_OBJECTS = {
        __globalctx__: {
            "alert": (words) => {
                alert(words[1]);
            },
            "log": (words) => {
                this.#console.log(words[1]);
            },
            "print": (words) => {
                if(!("lognnl" in this.#console)) {
                    throw "Print (log without new line) is not supported by current (custom) console. It needs to support: <cc>.lognnl(str);";
                }

                this.#console.lognnl(words[1]);
            },
            "warn": (words) => {
                this.#console.warn(words[1]);
            },
            "error": (words) => {
                this.#console.error(words[1]);
            },
            "throw": (words) => {
                throw(words[1]);
            },
            "eval": (words) => {
                eval(words[1]);
            },
            "pause": (words) => {
                if(parseFloat(words[1]) > this.#timeoutTime) {
                    throw "Too long pause. This would exceed timeout time!";
                }

                this.#console.warn("Pause is only implemented incase you REALLY need it. If you don't NEED to use it, do NOT use it.");

                var pStarted = Date.now();

                while(pStarted > Date.now()-parseFloat(words[1])) {
                    // do nothing lol
                }
            }
        },
        math: {
            "sum": (words) => {
                return parseFloat(words[1]) + parseFloat(words[2]);
            },
            "sub": (words) => {
                return parseFloat(words[1]) - parseFloat(words[2]);
            },
            "div": (words) => {
                return parseFloat(words[1]) / parseFloat(words[2]);
            },
            "mul": (words) => {
                return parseFloat(words[1]) * parseFloat(words[2]);
            },
            "pow": (words) => {
                console.log(words);
                return parseFloat(words[1]) ** parseFloat(words[2]);
            },
            "sqrt": (words) => {
                return Math.sqrt(parseFloat(words[1]));
            },
            "cos": (words) => {
                return Math.cos(parseFloat(words[1]));
            },
            "sin": (words) => {
                return Math.sin(parseFloat(words[1]));
            },
            "tan": (words) => {
                return Math.tan(parseFloat(words[1]));
            },
            "cosh": (words) => {
                return Math.cosh(parseFloat(words[1]));
            },
            "sinh": (words) => {
                return Math.sinh(parseFloat(words[1]));
            },
            "tanh": (words) => {
                return Math.tanh(parseFloat(words[1]));
            }
        },
        global: {
            "set": (words) => {
                if(words[1] == undefined) { // well, we DO need a name.
                    throw(PSConst.errors.NO_VAR_PASSED);
                }

                if((words[1].match(/([^A-Za-z])+/g) || []).length > 0) { // find all matches of non-alpha chars or return empty array instead of NULL
                    throw(PSConst.errors.INV_VAR_NAME);
                }

                if(!(words[2] == "=" || words[2] == "+=" || words[2] == "-=" || words[2] == "++" || words[2] == "--")) { // This is to prevent accidentally not adding a name for the variable and then wondering why its never correctly replaced
                    throw(PSConst.getError("INV_ASSIGN", "=, +=, -=, ++, --"));
                }

                if(words[2] == "="){
                    if(isNaN(parseFloat(words[3]))) {
                        this.GLOBAL_VARS[words[1]] = words[3];
                    }else {
                        this.GLOBAL_VARS[words[1]] = parseFloat(words[3]);
                    }
                }else if(words[2] == "+=") {
                    if(isNaN(parseFloat(this.GLOBAL_VARS[words[1]]))) {
                        this.GLOBAL_VARS[words[1]] = this.GLOBAL_VARS[words[1]] + words[3];
                    }else {
                        this.GLOBAL_VARS[words[1]] = parseFloat(this.GLOBAL_VARS[words[1]]) + parseFloat(words[3]);
                    }
                }else if(words[2] == "-=") {
                    if(isNaN(parseFloat(this.GLOBAL_VARS[words[1]]))) {
                        if(this.#strict) throw("Unable to subtract from non-number.");
                        return;
                    }else {
                        this.GLOBAL_VARS[words[1]] = parseFloat(this.GLOBAL_VARS[words[1]]) - parseFloat(words[3]);
                    }
                }else if(words[2] == "++") {
                    if(isNaN(parseFloat(this.GLOBAL_VARS[words[1]]))) {
                        if(this.#strict) throw("Unable to increment non-number.");
                        return;
                    }else {
                        this.GLOBAL_VARS[words[1]] = parseFloat(this.GLOBAL_VARS[words[1]]) + 1;
                    }
                }else if(words[2] == "--") {
                    if(isNaN(parseFloat(this.GLOBAL_VARS[words[1]]))) {
                        if(this.#strict) throw("Unable to decrement non-number.");
                        return;
                    }else {
                        this.GLOBAL_VARS[words[1]] = parseFloat(this.GLOBAL_VARS[words[1]]) - 1;
                    }
                }
            },
            "assign": (words) => {
                if(words[1] == undefined) { // well, we DO need a name.
                    throw(PSConst.errors.NO_VAR_PASSED);
                }

                if((words[1].match(/([^A-Za-z])+/g) || []).length > 0) { // find all matches of non-alpha chars or return empty array instead of NULL
                    throw(PSConst.errors.INV_VAR_NAME);
                }

                if(!(words[2] == "=")) { // This is to prevent accidentally not adding a name for the variable and then wondering why its never correctly replaced
                    throw(PSConst.getError("INV_ASSIGN", "="));
                }

                this.GLOBAL_VARS[words[1]] = this.exec(words[3]);
            },
            "unset": (words) => {
                if(words[1] == undefined) { // well, we DO need a name.
                    throw(PSConst.errors.NO_VAR_PASSED);
                }

                if((words[1].match(/([^A-Za-z])+/g) || []).length > 0) { // find all matches of non-alpha chars or return empty array instead of NULL
                    throw(PSConst.errors.INV_VAR_NAME);
                }

                if(!(words[1] in this.GLOBAL_VARS)) {
                    if(this.#strict) {
                        throw("STRICT: There is no variable named " + words[1] + " to unset.");
                    }else {
                        return;
                    }
                }

                delete this.GLOBAL_VARS[words[1]];
            },
            "reset": (words) => {
                this.GLOBAL_VARS = {};
            }
        },
        array: {
            "push": (words) => {
                if(words[1] == undefined) { // well, we DO need a name.
                    throw("No variable name passed to global->set");
                }

                if((words[1].match(/([^A-Za-z])+/g) || []).length > 0) { // find all matches of non-alpha chars or return empty array instead of NULL
                    throw("Invalid variable name - only alphabetic names are allowed.");
                }

                if(!(words[1] in this.GLOBAL_VARS)) {
                    throw("There is no variable named like " + words[1] + ".");
                }

                if(!(this.GLOBAL_VARS[words[1]] instanceof Array)) {
                    throw("That variable is not an array.");
                }

                this.GLOBAL_VARS[words[1]].push(words[2]);
            },
            "pop": (words) => {
                if(words[1] == undefined) { // well, we DO need a name.
                    throw("No variable name passed to global->set");
                }

                if((words[1].match(/([^A-Za-z])+/g) || []).length > 0) { // find all matches of non-alpha chars or return empty array instead of NULL
                    throw("Invalid variable name - only alphabetic names are allowed.");
                }

                if(!(words[1] in this.GLOBAL_VARS)) {
                    throw("There is no variable named like " + words[1] + ".");
                }

                if(!(this.GLOBAL_VARS[words[1]] instanceof Array)) {
                    throw("That variable is not an array.");
                }

                return this.GLOBAL_VARS[words[1]].pop();
            },
            "set": (words) => {
                if(words[1] == undefined) { // well, we DO need a name.
                    throw("No variable name passed to global->set");
                }

                if((words[1].match(/([^A-Za-z])+/g) || []).length > 0) { // find all matches of non-alpha chars or return empty array instead of NULL
                    throw("Invalid variable name - only alphabetic names are allowed.");
                }

                if(!(words[1] in this.GLOBAL_VARS)) {
                    throw("There is no variable named like " + words[1] + ".");
                }

                if(!(this.GLOBAL_VARS[words[1]] instanceof Array)) {
                    throw("That variable is not an array.");
                }

                if(parseInt(words[2]) > this.GLOBAL_VARS[words[1]].length || parseInt(words[2]) < 0) {
                    throw("Array index out of bounds. (sel: " + words[2] + ", len: " + this.GLOBAL_VARS[words[1]].length + ")");
                }

                this.GLOBAL_VARS[words[1]][parseInt(words[2])] = words[3]; 
            }
        },
        string: {
            "joinWords": (words) => {
                if(words.length < 3 && this.#strict) throw("STRICT: Insufficient arguments passed to string->joinWords!");
                return words.splice(2).join(words[1]);
            }
        },
        json: {
            "store": (words) => {
                this.GLOBAL_VARS[words[1]] = JSON.parse(words[2]);      
            },
            "get": (words) => {
                if(typeof(this.GLOBAL_VARS[words[1]]) == "object") {
                    if(!(words[2] in this.GLOBAL_VARS[words[1]])) {
                        throw "Can not access key " + words[2] + " in JSON-object stored in var " + words[1];
                    }

                    return this.GLOBAL_VARS[words[1]][words[2]];
                } else {
                    throw "Variable is not a JSON-like object.";
                }
            },
            "set": (words) => {
                if(typeof(this.GLOBAL_VARS[words[1]]) == "object") {
                    if(!(words[3] in this.GLOBAL_VARS)) {
                        throw "Can not set key " + words[2] + " to var-value of " + words[3] + " since it does not exist.";
                    }

                    this.GLOBAL_VARS[words[1]][words[2]] = words[3];
                } else {
                    throw "Variable is not a JSON-like object.";
                }
            }
        },
        custom: {
            "run": (words, specialData) => {
                return this.exec(this.CUSTOM_FUNCTIONS[words[1]].join(";\n"), specialData.depth+1);
            },
            "runIn": (words, specialData) => {
                setTimeout(() => {
                    this.exec(this.CUSTOM_FUNCTIONS[words[1]].join(";\n"), specialData.depth+1);
                }, words[2]);
                
                return true;
            },
            "repeat": (words, specialData) => {
                var curIndex = this.#intervalIndex;
                var depth = specialData.depth;

                if(parseInt(words[2]) == 0) {
                    for(var i = 0; i < parseInt(words[1]); i++) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[3]].join(";\n"), depth+1);
                    }
                }else {
                    this.#intervals[curIndex] = {
                        jsInterval: setInterval(() => {
                            this.exec(this.CUSTOM_FUNCTIONS[words[3]].join(";\n"), depth+1);

                            this.#intervals[curIndex].done++;

                            if(this.#intervals[curIndex].done >= this.#intervals[curIndex].times) {
                                clearInterval(this.#intervals[curIndex].jsInterval);
                                delete this.#intervals[curIndex];
                            }
                        }, parseInt(words[2])),
                        type: "repeat",
                        times: parseInt(words[1]),
                        done: 0
                    }
                    
                    this.#intervalIndex++;
                }
            },
            "runEvery": (words, specialData) => {
                setInterval(() => {
                    this.exec(this.CUSTOM_FUNCTIONS[words[1]].join(";\n"), specialData.depth+1);
                }, words[2]);

                return true;
            },
            "runIf": (words, specialData) => {
                var left = words[1];
                var compType = words[2];
                var right = words[3];

                if(!(compType == "==" || compType == ">" || compType == "<" || compType == ">=" || compType == "<=")) {
                    throw("Invalid compare type, valid types are: ==, >, <, >=, <=");
                }

                if(compType == "==") {
                    if(left == right) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[4]].join(";\n"), specialData.depth+1);
                    }
                }else if(compType == ">") {
                    if(parseFloat(left) > parseFloat(right)) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[4]].join(";\n"), specialData.depth+1);
                    }
                }else if(compType == "<") {
                    if(parseFloat(left) < parseFloat(right)) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[4]].join(";\n"), specialData.depth+1);
                    }
                }else if(compType == ">=") {
                    if(parseFloat(left) >= parseFloat(right)) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[4]].join(";\n"), specialData.depth+1);
                    }
                }else if(compType == "<=") {
                    if(parseFloat(left) <= parseFloat(right)) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[4]].join(";\n"), specialData.depth+1);
                    }
                }
            },
            "runIfElse": (words, specialData) => {
                var left = words[1];
                var compType = words[2];
                var right = words[3];

                if(!(compType == "==" || compType == ">" || compType == "<" || compType == ">=" || compType == "<=")) {
                    throw("Invalid compare type, valid types are: ==, >, <, >=, <=");
                }

                if(compType == "==") {
                    if(left == right) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[4]].join(";\n"), specialData.depth+1);
                    }else {
                        this.exec(this.CUSTOM_FUNCTIONS[words[5]].join(";\n"), specialData.depth+1);
                    }
                }else if(compType == ">") {
                    if(parseFloat(left) > parseFloat(right)) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[4]].join(";\n"), specialData.depth+1);
                    }else {
                        this.exec(this.CUSTOM_FUNCTIONS[words[5]].join(";\n"), specialData.depth+1);
                    }
                }else if(compType == "<") {
                    if(parseFloat(left) < parseFloat(right)) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[4]].join(";\n"), specialData.depth+1);
                    }else {
                        this.exec(this.CUSTOM_FUNCTIONS[words[5]].join(";\n"), specialData.depth+1);
                    }
                }else if(compType == ">=") {
                    if(parseFloat(left) >= parseFloat(right)) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[4]].join(";\n"), specialData.depth+1);
                    }else {
                        this.exec(this.CUSTOM_FUNCTIONS[words[5]].join(";\n"), specialData.depth+1);
                    }
                }else if(compType == "<=") {
                    if(parseFloat(left) <= parseFloat(right)) {
                        this.exec(this.CUSTOM_FUNCTIONS[words[4]].join(";\n"), specialData.depth+1);
                    }else {
                        this.exec(this.CUSTOM_FUNCTIONS[words[5]].join(";\n"), specialData.depth+1);
                    }
                }
            },
            "returnString": (words) => {
                return words[1];
            },
            "returnNumber": (words) => {
                return parseFloat(words[1]);
            },
            "reset": (words) => {
                this.CUSTOM_FUNCTIONS = {};
            },
            "argdbg": (words) => {
                this.#console.log(words.join("\n-;- next arg -;-\n"));
            }
        }
    }

    CUSTOM_FUNCTIONS = {
        
    }

    /** Creates a new PoopScript Environment */
    constructor(removalTemplate=[]) {
        this.#console = console;

        for(var rem of removalTemplate) {
            if(rem.split("->")[0] in this.GLOBAL_OBJECTS) {
                if(rem.split("->")[1] in this.GLOBAL_OBJECTS[rem.split("->")[0]]) {
                    delete this.GLOBAL_OBJECTS[rem.split("->")[0]][rem.split("->")[1]];
                }else {
                    console.warn("Template tried to delete " + this.GLOBAL_OBJECTS[rem.split("->")[0]][rem.split("->")[1]] + ", but that function was not found.");
                }
            }else {
                console.warn("Template tried to delete " + this.GLOBAL_OBJECTS[rem.split("->")[0]][rem.split("->")[1]] + ", but that function was not found.");
            }
        }
    }

    /** Add a custom console handler. The custom console handler needs a log, warn and error function just like the good old console. */
    setCustomConsoleHandler(c) {
        this.#console = c;
    }
    
    /** Set if strict mode is enabled.
     * Strict mode throws errors at more places. (if you try to unset a undefined variable for example)
     */
    setStrict(b) {
        this.#strict = b;
    }

    /** Set the max script execution time in milliseconds */
    setMaxExecutionTime(ms){
        this.#timeoutTime = ms;
    }

    /** Execute any PoopScript code */
    exec(src, depth = 0) {
        var iAmMain = false;

        if(this.#mainExecStarted == 0) {
            iAmMain = true;
            this.#mainExecStarted = Date.now();
        }

        var scopeVariables = {
            depth: depth,
            isMain: iAmMain,
            started: Date.now(),
            maxExecTime: this.#timeoutTime,
            strict: this.#strict,
        }

        if(depth > 1000) {
            this.#console.error("Recursion limit reached! You should not go deeper than recursion depth 1000!");
            return;
        }

        var lines = src.split(/(?<!\\)(?:\\\\)*;/g);
        var lineIndex = 0;

        var latestReturn = undefined;

        var currentlyDef = {
            is: false,
            name: "",
            lines: []
        }

        var currentlyCommenting = false;

        for(var line of lines) {
            if(Date.now()-this.#mainExecStarted > this.#timeoutTime) {
                if(iAmMain) {
                    this.#console.error("Script execution timed out after " + (Date.now()-this.#mainExecStarted) + "ms, you might have recursion in your code.");
                    this.#mainExecStarted = 0;
                }

                return;
            }

            lineIndex++;

            for(var gv of Object.keys(this.GLOBAL_VARS)) {
                if(typeof(this.GLOBAL_VARS[gv]) == "object") {
                    line = line.replace(new RegExp("/(%" + gv + ")/", "g"), this.GLOBAL_VARS[gv]);
                }
            }

            var preWords = line.replace(/(\\)(\\\\)*;/g, ";").trim().split(" ");
            var words = [];

            var strStartIdx = 0;
            var inStr = false;
            var strContent = "";

            preWords.forEach((val, idx) => {
                if(val.startsWith("%{") && val.endsWith("}%")) {
                    words.push(this.quickMathEval(val.substr(2, val.length-4)));
                    return;
                }

                if((val.startsWith("\"") && !val.startsWith("\\\"")) && (val.length > 1 ? !val.endsWith("\"") : true) && !inStr) {
                    strStartIdx = idx;
                    inStr = true;
                    strContent = val.substr(1).replace(/(\\\")/g, "\"");
                }else if(inStr && val.endsWith("\"") && !val.endsWith("\\\"")) {
                    strContent += " " + val.substr(0, val.length-1);
                    inStr = false;
                    words.push(strContent.replace(/(\\\")/g, "\""));
                }else if(inStr) {
                    strContent += " " + val.replace(/(\\\")/g, "\"");
                }else if(val.startsWith("\"") && !val.startsWith("\\\"") && val.endsWith("\"") && !val.endsWith("\\\"")) {
                    words.push(val.substr(1, val.length-2).replace(/(\\\")/g, "\""))
                }else {
                    if(!isNaN(parseFloat(val))) {
                        words.push(parseFloat(val));
                    }else {
                        words.push(val.replace(/(\\\")/g, "\""));
                    }
                }
            })

            if(words[0] == "-->" && words[1] == "def") {
                if(currentlyDef.is) {
                    if(iAmMain) this.#mainExecStarted = 0;
                    throw("Already in definition mode. You cant define methods in methods.");
                }

                currentlyDef = {
                    is: true,
                    name: words[2],
                    lines: []
                }

                continue;
            }else if(words[0] == "-->" && words[1] == "end") {
                if(!currentlyDef.is) {
                    if(this.#strict && iAmMain) this.#mainExecStarted = 0;
                    if(this.#strict) throw("Can not exit definition mode, because you aren't even in definition mode!");
                }

                currentlyDef.is = false;
                this.CUSTOM_FUNCTIONS[currentlyDef.name] = currentlyDef.lines.slice();

                continue;
            }else if(words[0] == "//>") {
                continue; // this is a comment, ignore it.
            }

            /* Multi line comment */
            if(line.trim().startsWith("<<//")) {
                currentlyCommenting = true;
            }

            if(line.trim().endsWith("//>>")) {
                currentlyCommenting = "ending";
            }

            if(currentlyCommenting || currentlyCommenting == "ending") {
                if(currentlyCommenting == "ending") currentlyCommenting = false;
                continue; // in multi line comment mode, ignore it
            }

            /* Multi line comments end */

            if(currentlyDef.is) {
                currentlyDef.lines.push(line);
                continue; 
            }

            var replacementVars = {};

            Object.keys(this.GLOBAL_VARS).forEach((key, idx) => {
                var val = this.GLOBAL_VARS[key];

                if(this.GLOBAL_VARS[key] instanceof Array) {
                    val = this.GLOBAL_VARS[key].join(",");
                }

                replacementVars[key] = {
                    regexp: new RegExp("(%%" + key + ")", "g"),
                    val: val
                }
            });

            for(var i = 0; i < words.length; i++) {
                Object.keys(this.GLOBAL_VARS).forEach((key, idx) => {
                    words[i] = words[i].toString().replace(replacementVars[key].regexp, replacementVars[key].val);
                });

                if(words[i].toString().startsWith("%:")) {
                    if(!(words[i].split("%:")[1] in scopeVariables)) {
                        words[i] = "undefined";
                        continue;
                    }

                    words[i] = scopeVariables[words[i].split("%:")[1]];
                }else if(words[i].toString().startsWith("%$")) {
                    var sel = words[i].split("%$")[1].split(",");

                    if(!(sel[0] in this.GLOBAL_VARS)) {
                        words[i] = "undefined";
                        continue;
                    }

                    if(!(this.GLOBAL_VARS[sel[0]] instanceof Array)) {
                        if(iAmMain) this.#mainExecStarted = 0;
                        throw("%$ is a special selector reserved for arrays. Use %% instead.");
                    }

                    if(parseInt(sel[1]) > this.GLOBAL_VARS[sel[0]].length || parseInt(sel[1]) < 0) {
                        if(iAmMain) this.#mainExecStarted = 0;
                        throw("Array index out of bounds. (sel: " + sel[1] + ", len: " + this.GLOBAL_VARS[sel[0]].length + ")");
                    }

                    words[i] = this.GLOBAL_VARS[sel[0]][parseInt(sel[1])];
                }else if(words[i].toString().startsWith("%_")) {
                    words[i] = this.exec(this.CUSTOM_FUNCTIONS[words[i].split("%_")[1]].join(";\n"), depth+1);
                }
            }

            var _obj = words[0].split("->")[0];
            var _method = words[0].split("->")[1];

            if(_obj == "") _obj = "__globalctx__";
            if(line.trim() == "") continue;


            if(_obj in this.GLOBAL_OBJECTS) {
                if(_method in this.GLOBAL_OBJECTS[_obj]) {
                    try {
                        latestReturn = this.GLOBAL_OBJECTS[_obj][_method](words, {depth: depth});

                        if(_method == "returnString" || _method == "returnNumber") {
                            if(iAmMain) this.#mainExecStarted = 0;
                            return latestReturn;
                        }
                    }catch(err) {
                        if(iAmMain) this.#mainExecStarted = 0;
                        throw("PSError: Executing " + _obj + "->" + _method + " failed: " + err + " (at line " + lineIndex + ", line: " + line + ")");
                    }
                }else {
                    if(iAmMain) this.#mainExecStarted = 0;
                    throw("PSError: Tried to execute " + _method + " at object " + _obj + " but there is no method named that. (at line " + lineIndex + ", line: " + line + ")");
                }
            }else {
                if(iAmMain) this.#mainExecStarted = 0;
                throw("PSError: Tried to access undefined object "  + _obj + " (at line " + lineIndex + ", line: " + line + ")");
            }
        }

        if(iAmMain) this.#mainExecStarted = 0;
        return latestReturn;
    }

    quickMathEval(query) {
        if(!(query.split(/([\+\-\/\*])/g).length == 3)) {
            throw "QuickMath only supports two arguments, left and right. You can use variables to perform more advanced math.";
        }

        var args = query.split(/([\+\-\/\*])/g);

        if(args[0].toString().startsWith("%%")) {
            args[0] = parseFloat(this.GLOBAL_VARS[args[0].split("%%")[1]]);
        }

        if(args[2].toString().startsWith("%%")) {
            args[2] = parseFloat(this.GLOBAL_VARS[args[2].split("%%")[2]]);
        }

        args[0] = parseFloat(args[0]);
        args[2] = parseFloat(args[2]);

        var res = 0;

        if(args[1] == "+") {
            res = args[0] + args[2];
        }else if(args[1] == "-") {
            res = args[0] - args[2];
        }else if(args[1] == "/") {
            res = args[0] / args[2];
        }else if(args[1] == "*") {
            res = args[0] * args[2];
        }

        return res.toString();
    }
}

class PSConst {
    static errors = {
        "NO_HOOK": "To use this function, you either need to connect to a PSLang-Hook or run PoopScript from NodeJS.",
        "NO_VAR_PASSED": "No variables was passed to the function.",
        "NOT_DEF": "There is no variable named liked this.",
        "INV_VAR_NAME": "Invalid variable name passed. Variables names can only be alphabetical.",
        "INV_ASSIGN": "No valid assignment type sign when assigning variable. Types: {0}"
    }

    /** Used if errors have placeholders to fill. */
    static getError = (err, ...args) => {
        var result = PSConst.errors[err];

        for(var i = 0; i < args.length; i++) {
            result = result.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
        }

        return result;
    }

    static isNode = ((typeof process !== 'undefined') && (process.versions != null) && (process.versions.node != null));

    static removalTemplates = {
        "noJavaScript": ["__globalctx__->eval"],
        "simpleUsage": ["__globalctx__->alert", "__globalctx__->eval", "__globalctx__->throw", "__globalctx__->error", "custom->run", "custom->returnString", "custom->returnNumber", "custom->resetCustomFunctions"],
        "noVars": ["global->set", "global->unset", "global->assign", "global->reset"],
        "noFuncs": ["custom->run", "custom->returnString", "custom->returnNumber", "custom->reset"],
        "noResetting": ["global->unset", "global->reset", "custom->reset"]
    };
}

if(PSConst.isNode) {
    module.exports = {PoopScriptEnv, PSConst}
}else {
    window.PoopScriptEnv = PoopScriptEnv;
    window.PSConst = PSConst;
}