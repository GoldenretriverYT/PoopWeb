class PoopScriptEnv {
    GLOBAL_VARS = {};
    #console = null;
    #strict = false;
    #timeoutTime = 2000;
    #intervals = {};
    #intervalIndex = 0;
    #mainExecStarted = 0;

    static removalTemplates = {
        "noJavaScript": ["__globalctx__->eval"],
        "simpleUsage": ["__globalctx__->alert", "__globalctx__->eval", "__globalctx__->throw", "__globalctx__->error", "custom->run", "custom->returnString", "custom->returnNumber", "custom->resetCustomFunctions"],
        "noVars": ["global->set", "global->unset", "global->assign", "global->reset"],
        "noFuncs": ["custom->run", "custom->returnString", "custom->returnNumber", "custom->reset"],
        "noResetting": ["global->unset", "global->reset", "custom->reset"],
        "poopweb": ["__globalctx__->eval", "__globalctx__->alert"]
    };

    GLOBAL_OBJECTS = {
        __globalctx__: {
            "alert": (words) => {
                alert(words.splice(1).join(" "));
            },
            "log": (words) => {
                this.#console.log(words.splice(1).join(" "));
            },
            "print": (words) => {
                if(!("lognnl" in this.#console)) {
                    throw "Print (log without new line) is not supported by current (custom) console. It needs to support: <cc>.lognnl(str);";
                }

                this.#console.lognnl(words.splice(1).join(" "));
            },
            "warn": (words) => {
                this.#console.warn(words.splice(1).join(" "));
            },
            "error": (words) => {
                this.#console.error(words.splice(1).join(" "));
            },
            "throw": (words) => {
                throw(words.splice(1).join(" "));
            },
            "eval": (words) => {
                eval(words.splice(1).join(" "));
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
                    throw("No variable name passed to global->set");
                }

                if((words[1].match(/([^A-Za-z])+/g) || []).length > 0) { // find all matches of non-alpha chars or return empty array instead of NULL
                    throw("Invalid variable name - only alphabetic names are allowed.");
                }

                if(!(words[2] == "=" || words[2] == "+=" || words[2] == "-=" || words[2] == "++" || words[2] == "--")) { // This is to prevent accidentally not adding a name for the variable and then wondering why its never correctly replaced
                    throw("No assignment type sign when setting variable. Types: =, +=, -=, ++, --");
                }

                if(words[2] == "="){
                    this.GLOBAL_VARS[words[1]] = words.splice(3).join(" ");
                }else if(words[2] == "+=") {
                    if(isNaN(parseFloat(this.GLOBAL_VARS[words[1]]))) {
                        this.GLOBAL_VARS[words[1]] = this.GLOBAL_VARS[words[1]] + words.splice(3).join(" ");
                    }else {
                        this.GLOBAL_VARS[words[1]] = parseFloat(this.GLOBAL_VARS[words[1]]) + parseFloat(words[3]);
                    }
                }else if(words[2] == "-=") {
                    if(isNaN(parseFloat(this.GLOBAL_VARS[words[1]]))) {
                        if(this.#strict) throw("Unable to subtract from string.");
                        return;
                    }else {
                        this.GLOBAL_VARS[words[1]] = parseFloat(this.GLOBAL_VARS[words[1]]) - parseFloat(words[3]);
                    }
                }else if(words[2] == "++") {
                    if(isNaN(parseFloat(this.GLOBAL_VARS[words[1]]))) {
                        if(this.#strict) throw("Unable to subtract from string.");
                        return;
                    }else {
                        this.GLOBAL_VARS[words[1]] = parseFloat(this.GLOBAL_VARS[words[1]]) + 1;
                    }
                }else if(words[2] == "--") {
                    if(isNaN(parseFloat(this.GLOBAL_VARS[words[1]]))) {
                        if(this.#strict) throw("Unable to subtract from string.");
                        return;
                    }else {
                        this.GLOBAL_VARS[words[1]] = parseFloat(this.GLOBAL_VARS[words[1]]) - 1;
                    }
                }
            },
            "setType": (words) => {
                if(words[1] == undefined) { // well, we DO need a name.
                    throw("No variable name passed to global->set");
                }

                if((words[1].match(/([^A-Za-z])+/g) || []).length > 0) { // find all matches of non-alpha chars or return empty array instead of NULL
                    throw("Invalid variable name - only alphabetic names are allowed.");
                }

                if(!(words[2] == "=")) { // This is to prevent accidentally not adding a name for the variable and then wondering why its never correctly replaced
                    throw("No assignment type sign when setting variable with specific Type. Types: =");
                }

                if(words[2] == "="){
                    if(words[3] == "string") {
                        this.GLOBAL_VARS[words[1]] = words.splice(4).join(" ");
                    }else if(words[3] == "number") {
                        this.GLOBAL_VARS[words[1]] = parseFloat(words[4]);
                    }else if(words[3] == "array") {
                        this.GLOBAL_VARS[words[1]] = words.splice(4);
                    }
                }
            },
            "assign": (words) => {
                if(words[1] == undefined) { // well, we DO need a name.
                    throw("No variable name passed to global->set");
                }

                if((words[1].match(/([^A-Za-z])+/g) || []).length > 0) { // find all matches of non-alpha chars or return empty array instead of NULL
                    throw("Invalid variable name - only alphabetic names are allowed.");
                }

                if(!(words[2] == "=")) { // This is to prevent accidentally not adding a name for the variable and then wondering why its never correctly replaced
                    throw("No valid assignment type sign when assigning variable. Types: =");
                }

                this.GLOBAL_VARS[words[1]] = this.exec(words.splice(3).join(" "));
            },
            "unset": (words) => {
                if(words[1] == undefined) { // well, we DO need a name.
                    throw("No variable name passed to global->unset");
                }

                if((words[1].match(/([^A-Za-z])+/g) || []).length > 0) { // find all matches of non-alpha chars or return empty array instead of NULL
                    throw("Invalid variable name - only alphabetic names are allowed.");
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
                return words.splice(2).join(words[1]);
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
                return words.splice(1).join(" ");
            },
            "returnNumber": (words) => {
                return parseFloat(words[1]);
            },
            "reset": (words) => {
                this.CUSTOM_FUNCTIONS = {};
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

            var words = line.replace(/(\\)(\\\\)*;/g, ";").trim().split(" ");

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
                    if(iAmMain) this.#mainExecStarted = 0;
                    throw("Can not exit definition mode, because you aren't even in definition mode!");
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

            for(var i = 0; i < words.length; i++) {
                if(words[i].startsWith("%%")) {
                    if(!(words[i].split("%%")[1] in this.GLOBAL_VARS)) {
                        words[i] = "undefined";
                        continue;
                    }

                    if(this.GLOBAL_VARS[words[i].split("%%")[1]] instanceof Array) {
                        words[i] = this.GLOBAL_VARS[words[i].split("%%")[1]].join(",");
                        continue;
                    }

                    words[i] = this.GLOBAL_VARS[words[i].split("%%")[1]];
                }else if(words[i].startsWith("%$")) {
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
                }else if(words[i].startsWith("%_")) {
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
}

module.exports = PoopScriptEnv;