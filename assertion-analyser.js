function objParser(str, init) {
    // find objects, arrays, strings  and function arguments
    // between parens, because they may contain ','
    var openSym = ['[', '{', '"', "'", '('];
    var closeSym = [']', '}', '"', "'", ')'];
    var type;
    for(var i = (init || 0); i < str.length; i++ ) {
        type = openSym.indexOf(str[i]);
        if (type !== -1) break;
    }
    if (type === -1 ) return null;
    var open = openSym[type];
    var close = closeSym[type];
    var count = 1;
    for (var k = i+1; k < str.length; k++) {
        if(open === '"' || open === "'") {
            if (str[k] === close) count--;
            if (str[k] === "\\") k++;
        }
        else {
            if (str[k] === open) count++;
            if (str[k] === close) count--;
        }
        if (count === 0) break;
    }
    if (count !== 0) return null;
    var obj = str.slice(i, k+1);
    return {
        start : i,
        end: k,
        obj: obj
    };
}

function replacer(str) {
    // replace objects with a symbol ( __#n)
    var obj;
    var cnt = 0;
    var data = [];
    while(obj = objParser(str)) {
        data[cnt] = obj.obj;
        str = str.substring(0, obj.start) + '__#' + cnt++ + str.substring(obj.end+1)
    }
    return {
        str: str,
        dictionary : data
    }
}