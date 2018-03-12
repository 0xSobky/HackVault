/**
 * A wrapper object for helper functions.
 */
let regaxorHelpers = {
    padLeft(str) {
        return str[0] + str;
    },

    padRight(str) {
        return str + str[str.length - 1];
    },

    replaceDots(str) {
        return str.replace(/\./g, 'X');
    },

    doubleEscape(str) {
        return str.replace(/\\/g, '\\\\');
    },

    prefixLn(str) {
        return '\r\n\n\r' + str;
    },

    postfixLn(str) {
        return str + '\r\n\n\r';
    },

    replicateLn(str) {
        return str.repeat(2) + '\u2028' + str;
    },

    sliceRight(str) {
        let length = str.length / 2;
        return str.slice(length);
    },

    sliceLeft(str) {
        let length = str.length / 2;
        return str.slice(0, length);
    },

    flip(str) {
        let length = str.length / 2;
        return str.slice(length) + str.slice(0, length);
    },

    reverse(str) {
        str = str.split('');
        str = str.reverse();
        return str.join('');
    },

    changeCase(str) {
        if (str.toLowerCase() === str)
            str = str.toUpperCase();
        else
            str = str.toLowerCase();
        return str;
    },

    shuffle(str) {
        let arr = str.split('');
        let index = arr.length;
        while (index--) {
            let rand = Math.floor(Math.random() * (index + 1));
            [arr[rand], arr[index]] = [arr[index], arr[rand]];
        }
        return arr.join('');
    },

    shift(str) {
        let arr = str.split('');
        let index = arr.length;
        let rand = Math.ceil(Math.random() * 5);
        while (index--) {
            let char = arr[index];
            arr[index] = String.fromCharCode(
                char.charCodeAt(char) << rand
            );
        }
        return arr.join('');
    }
};


/**
 * Fuzz a given regular expression.
 * @param {string} str - A raw string.
 * @param {object|string} re - A regex literal/string literal.
 * @param {boolean} literalFlag - `true` for regex literals.
 * @return {object} array - An array of object literals.
 */
let regaxor = (str, re, literalFlag) => {
    let flags = '';
    let outputs = {'matches': [], 'mismatches': []};
    if (!literalFlag) {
        re = re.trim();
        if (re.startsWith('/') && /\/\w*$/.test(re)) {
            let parts = re.split('/');
            flags = parts[2];
            re = parts[1];
        }
    }
    for (let func of Object.values(regaxorHelpers)) {
        let result;
        let matchStr = func(str);
        if (matchStr === str)
            continue;
        re = flags ? new RegExp(re, flags) : new RegExp(re);
        do {
            let dict = {};
            result = re.exec(matchStr);
            if (result !== null) {
                dict.index = result.index;
                dict.match = result[0];
                dict.input = result.input;
                outputs.matches.push(dict);
            } else {
                outputs.mismatches.push(matchStr);
            }
        } while (re.lastIndex && result !== null &&
            re.lastIndex !== matchStr.lastIndexOf(result) + 1);
    }
    return outputs;
};
