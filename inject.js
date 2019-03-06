/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


	/***/ }),
	/* 1 */
	/***/ (function(module, exports, __webpack_require__) {
	
	"use strict";
	
	
	var _ = __webpack_require__(2);
	
	var _require = __webpack_require__(3),
			watchWindow = _require.watchWindow;
	
	var _require2 = __webpack_require__(6),
			traverseFrame = _require2.traverseFrame,
			islinkedAnchor = _require2.islinkedAnchor;
	
	var _require3 = __webpack_require__(9),
			analyser = _require3.analyser;
	
	var _require4 = __webpack_require__(8),
			getSession = _require4.getSession;
	
	var _require5 = __webpack_require__(12),
			getDetail = _require5.getDetail;
	
	function watching($win) {
		watchWindow($win);
	}
	
	setInterval(function watch() {
		traverseFrame(window, watching);
		return watch;
	}(), 50);
	getSession();
	
	if (!document.defaultView) {
		document.defaultView = window;
	}
	
	var API_NAMESPACE = '/api/page/behavior';
	var MAX_APM_DELAY = 5000;
	
	var noop = function noop() {};
	
	function isCheckedElement(_ref) {
		var tagName = _ref.tagName,
				type = _ref.type;
		return tagName.toLowerCase() === 'input' && (type === 'checkbox' || type === 'radio');
	}
	
	function isValueElement(element) {
		var localName = element.tagName.toLowerCase();
	
		if (localName === 'textarea' || localName === 'select') {
			return true;
		}
	
		if (localName === 'input') {
			return !isCheckedElement(element);
		}
	
		return false;
	}
	
	analyser.on('resolve-action', function (action, data, node) {
		var url = "".concat(API_NAMESPACE, "/session/").concat(getSession(), "/action");
		var allDataElement = document.querySelectorAll('input, textarea, select');
	
		_.each(allDataElement, function (element) {
			if (isCheckedElement(element)) {
				return element.setAttribute('lc-apm-checked', element.checked);
			}
	
			if (isValueElement(element)) {
				return element.setAttribute('lc-apm-value', element.value);
			}
		});
	
		var temp = getDetail(action, data, node);
		console.log(temp);
		var xhr = new XMLHttpRequest();
		var a = JSON.stringify(temp);
		xhr.open("post", url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader('lemonce-mitm', 'forward-action-data');
	
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				if (action === 'click' && islinkedAnchor(node.target)) {
					node.target.click();
				}
			}
		};
	
		xhr.send(a); // axios.post(url, temp, {
		// 	timeout: MAX_APM_DELAY,
		// 	headers: flagHeader
		// }).then(noop, noop).then(() => {
		// 	if (action === 'click' && islinkedAnchor(node.target)) {
		// 		node.target.click();
		// 	}
		// });
	});
	
	/***/ }),
	/* 2 */
	/***/ (function(module, exports, __webpack_require__) {
	
	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.7.0
	//     http://underscorejs.org
	//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.
	
	(function() {
	
		// Baseline setup
		// --------------
	
		// Establish the root object, `window` in the browser, or `exports` on the server.
		var root = this;
	
		// Save the previous value of the `_` variable.
		var previousUnderscore = root._;
	
		// Save bytes in the minified (but not gzipped) version:
		var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
	
		// Create quick reference variables for speed access to core prototypes.
		var
			push             = ArrayProto.push,
			slice            = ArrayProto.slice,
			concat           = ArrayProto.concat,
			toString         = ObjProto.toString,
			hasOwnProperty   = ObjProto.hasOwnProperty;
	
		// All **ECMAScript 5** native function implementations that we hope to use
		// are declared here.
		var
			nativeIsArray      = Array.isArray,
			nativeKeys         = Object.keys,
			nativeBind         = FuncProto.bind;
	
		// Create a safe reference to the Underscore object for use below.
		var _ = function(obj) {
			if (obj instanceof _) return obj;
			if (!(this instanceof _)) return new _(obj);
			this._wrapped = obj;
		};
	
		// Export the Underscore object for **Node.js**, with
		// backwards-compatibility for the old `require()` API. If we're in
		// the browser, add `_` as a global object.
		if (true) {
			if ( true && module.exports) {
				exports = module.exports = _;
			}
			exports._ = _;
		} else {}
	
		// Current version.
		_.VERSION = '1.7.0';
	
		// Internal function that returns an efficient (for current engines) version
		// of the passed-in callback, to be repeatedly applied in other Underscore
		// functions.
		var createCallback = function(func, context, argCount) {
			if (context === void 0) return func;
			switch (argCount == null ? 3 : argCount) {
				case 1: return function(value) {
					return func.call(context, value);
				};
				case 2: return function(value, other) {
					return func.call(context, value, other);
				};
				case 3: return function(value, index, collection) {
					return func.call(context, value, index, collection);
				};
				case 4: return function(accumulator, value, index, collection) {
					return func.call(context, accumulator, value, index, collection);
				};
			}
			return function() {
				return func.apply(context, arguments);
			};
		};
	
		// A mostly-internal function to generate callbacks that can be applied
		// to each element in a collection, returning the desired result — either
		// identity, an arbitrary callback, a property matcher, or a property accessor.
		_.iteratee = function(value, context, argCount) {
			if (value == null) return _.identity;
			if (_.isFunction(value)) return createCallback(value, context, argCount);
			if (_.isObject(value)) return _.matches(value);
			return _.property(value);
		};
	
		// Collection Functions
		// --------------------
	
		// The cornerstone, an `each` implementation, aka `forEach`.
		// Handles raw objects in addition to array-likes. Treats all
		// sparse array-likes as if they were dense.
		_.each = _.forEach = function(obj, iteratee, context) {
			if (obj == null) return obj;
			iteratee = createCallback(iteratee, context);
			var i, length = obj.length;
			if (length === +length) {
				for (i = 0; i < length; i++) {
					iteratee(obj[i], i, obj);
				}
			} else {
				var keys = _.keys(obj);
				for (i = 0, length = keys.length; i < length; i++) {
					iteratee(obj[keys[i]], keys[i], obj);
				}
			}
			return obj;
		};
	
		// Return the results of applying the iteratee to each element.
		_.map = _.collect = function(obj, iteratee, context) {
			if (obj == null) return [];
			iteratee = _.iteratee(iteratee, context);
			var keys = obj.length !== +obj.length && _.keys(obj),
					length = (keys || obj).length,
					results = Array(length),
					currentKey;
			for (var index = 0; index < length; index++) {
				currentKey = keys ? keys[index] : index;
				results[index] = iteratee(obj[currentKey], currentKey, obj);
			}
			return results;
		};
	
		var reduceError = 'Reduce of empty array with no initial value';
	
		// **Reduce** builds up a single result from a list of values, aka `inject`,
		// or `foldl`.
		_.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
			if (obj == null) obj = [];
			iteratee = createCallback(iteratee, context, 4);
			var keys = obj.length !== +obj.length && _.keys(obj),
					length = (keys || obj).length,
					index = 0, currentKey;
			if (arguments.length < 3) {
				if (!length) throw new TypeError(reduceError);
				memo = obj[keys ? keys[index++] : index++];
			}
			for (; index < length; index++) {
				currentKey = keys ? keys[index] : index;
				memo = iteratee(memo, obj[currentKey], currentKey, obj);
			}
			return memo;
		};
	
		// The right-associative version of reduce, also known as `foldr`.
		_.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
			if (obj == null) obj = [];
			iteratee = createCallback(iteratee, context, 4);
			var keys = obj.length !== + obj.length && _.keys(obj),
					index = (keys || obj).length,
					currentKey;
			if (arguments.length < 3) {
				if (!index) throw new TypeError(reduceError);
				memo = obj[keys ? keys[--index] : --index];
			}
			while (index--) {
				currentKey = keys ? keys[index] : index;
				memo = iteratee(memo, obj[currentKey], currentKey, obj);
			}
			return memo;
		};
	
		// Return the first value which passes a truth test. Aliased as `detect`.
		_.find = _.detect = function(obj, predicate, context) {
			var result;
			predicate = _.iteratee(predicate, context);
			_.some(obj, function(value, index, list) {
				if (predicate(value, index, list)) {
					result = value;
					return true;
				}
			});
			return result;
		};
	
		// Return all the elements that pass a truth test.
		// Aliased as `select`.
		_.filter = _.select = function(obj, predicate, context) {
			var results = [];
			if (obj == null) return results;
			predicate = _.iteratee(predicate, context);
			_.each(obj, function(value, index, list) {
				if (predicate(value, index, list)) results.push(value);
			});
			return results;
		};
	
		// Return all the elements for which a truth test fails.
		_.reject = function(obj, predicate, context) {
			return _.filter(obj, _.negate(_.iteratee(predicate)), context);
		};
	
		// Determine whether all of the elements match a truth test.
		// Aliased as `all`.
		_.every = _.all = function(obj, predicate, context) {
			if (obj == null) return true;
			predicate = _.iteratee(predicate, context);
			var keys = obj.length !== +obj.length && _.keys(obj),
					length = (keys || obj).length,
					index, currentKey;
			for (index = 0; index < length; index++) {
				currentKey = keys ? keys[index] : index;
				if (!predicate(obj[currentKey], currentKey, obj)) return false;
			}
			return true;
		};
	
		// Determine if at least one element in the object matches a truth test.
		// Aliased as `any`.
		_.some = _.any = function(obj, predicate, context) {
			if (obj == null) return false;
			predicate = _.iteratee(predicate, context);
			var keys = obj.length !== +obj.length && _.keys(obj),
					length = (keys || obj).length,
					index, currentKey;
			for (index = 0; index < length; index++) {
				currentKey = keys ? keys[index] : index;
				if (predicate(obj[currentKey], currentKey, obj)) return true;
			}
			return false;
		};
	
		// Determine if the array or object contains a given value (using `===`).
		// Aliased as `include`.
		_.contains = _.include = function(obj, target) {
			if (obj == null) return false;
			if (obj.length !== +obj.length) obj = _.values(obj);
			return _.indexOf(obj, target) >= 0;
		};
	
		// Invoke a method (with arguments) on every item in a collection.
		_.invoke = function(obj, method) {
			var args = slice.call(arguments, 2);
			var isFunc = _.isFunction(method);
			return _.map(obj, function(value) {
				return (isFunc ? method : value[method]).apply(value, args);
			});
		};
	
		// Convenience version of a common use case of `map`: fetching a property.
		_.pluck = function(obj, key) {
			return _.map(obj, _.property(key));
		};
	
		// Convenience version of a common use case of `filter`: selecting only objects
		// containing specific `key:value` pairs.
		_.where = function(obj, attrs) {
			return _.filter(obj, _.matches(attrs));
		};
	
		// Convenience version of a common use case of `find`: getting the first object
		// containing specific `key:value` pairs.
		_.findWhere = function(obj, attrs) {
			return _.find(obj, _.matches(attrs));
		};
	
		// Return the maximum element (or element-based computation).
		_.max = function(obj, iteratee, context) {
			var result = -Infinity, lastComputed = -Infinity,
					value, computed;
			if (iteratee == null && obj != null) {
				obj = obj.length === +obj.length ? obj : _.values(obj);
				for (var i = 0, length = obj.length; i < length; i++) {
					value = obj[i];
					if (value > result) {
						result = value;
					}
				}
			} else {
				iteratee = _.iteratee(iteratee, context);
				_.each(obj, function(value, index, list) {
					computed = iteratee(value, index, list);
					if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
						result = value;
						lastComputed = computed;
					}
				});
			}
			return result;
		};
	
		// Return the minimum element (or element-based computation).
		_.min = function(obj, iteratee, context) {
			var result = Infinity, lastComputed = Infinity,
					value, computed;
			if (iteratee == null && obj != null) {
				obj = obj.length === +obj.length ? obj : _.values(obj);
				for (var i = 0, length = obj.length; i < length; i++) {
					value = obj[i];
					if (value < result) {
						result = value;
					}
				}
			} else {
				iteratee = _.iteratee(iteratee, context);
				_.each(obj, function(value, index, list) {
					computed = iteratee(value, index, list);
					if (computed < lastComputed || computed === Infinity && result === Infinity) {
						result = value;
						lastComputed = computed;
					}
				});
			}
			return result;
		};
	
		// Shuffle a collection, using the modern version of the
		// [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
		_.shuffle = function(obj) {
			var set = obj && obj.length === +obj.length ? obj : _.values(obj);
			var length = set.length;
			var shuffled = Array(length);
			for (var index = 0, rand; index < length; index++) {
				rand = _.random(0, index);
				if (rand !== index) shuffled[index] = shuffled[rand];
				shuffled[rand] = set[index];
			}
			return shuffled;
		};
	
		// Sample **n** random values from a collection.
		// If **n** is not specified, returns a single random element.
		// The internal `guard` argument allows it to work with `map`.
		_.sample = function(obj, n, guard) {
			if (n == null || guard) {
				if (obj.length !== +obj.length) obj = _.values(obj);
				return obj[_.random(obj.length - 1)];
			}
			return _.shuffle(obj).slice(0, Math.max(0, n));
		};
	
		// Sort the object's values by a criterion produced by an iteratee.
		_.sortBy = function(obj, iteratee, context) {
			iteratee = _.iteratee(iteratee, context);
			return _.pluck(_.map(obj, function(value, index, list) {
				return {
					value: value,
					index: index,
					criteria: iteratee(value, index, list)
				};
			}).sort(function(left, right) {
				var a = left.criteria;
				var b = right.criteria;
				if (a !== b) {
					if (a > b || a === void 0) return 1;
					if (a < b || b === void 0) return -1;
				}
				return left.index - right.index;
			}), 'value');
		};
	
		// An internal function used for aggregate "group by" operations.
		var group = function(behavior) {
			return function(obj, iteratee, context) {
				var result = {};
				iteratee = _.iteratee(iteratee, context);
				_.each(obj, function(value, index) {
					var key = iteratee(value, index, obj);
					behavior(result, value, key);
				});
				return result;
			};
		};
	
		// Groups the object's values by a criterion. Pass either a string attribute
		// to group by, or a function that returns the criterion.
		_.groupBy = group(function(result, value, key) {
			if (_.has(result, key)) result[key].push(value); else result[key] = [value];
		});
	
		// Indexes the object's values by a criterion, similar to `groupBy`, but for
		// when you know that your index values will be unique.
		_.indexBy = group(function(result, value, key) {
			result[key] = value;
		});
	
		// Counts instances of an object that group by a certain criterion. Pass
		// either a string attribute to count by, or a function that returns the
		// criterion.
		_.countBy = group(function(result, value, key) {
			if (_.has(result, key)) result[key]++; else result[key] = 1;
		});
	
		// Use a comparator function to figure out the smallest index at which
		// an object should be inserted so as to maintain order. Uses binary search.
		_.sortedIndex = function(array, obj, iteratee, context) {
			iteratee = _.iteratee(iteratee, context, 1);
			var value = iteratee(obj);
			var low = 0, high = array.length;
			while (low < high) {
				var mid = low + high >>> 1;
				if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
			}
			return low;
		};
	
		// Safely create a real, live array from anything iterable.
		_.toArray = function(obj) {
			if (!obj) return [];
			if (_.isArray(obj)) return slice.call(obj);
			if (obj.length === +obj.length) return _.map(obj, _.identity);
			return _.values(obj);
		};
	
		// Return the number of elements in an object.
		_.size = function(obj) {
			if (obj == null) return 0;
			return obj.length === +obj.length ? obj.length : _.keys(obj).length;
		};
	
		// Split a collection into two arrays: one whose elements all satisfy the given
		// predicate, and one whose elements all do not satisfy the predicate.
		_.partition = function(obj, predicate, context) {
			predicate = _.iteratee(predicate, context);
			var pass = [], fail = [];
			_.each(obj, function(value, key, obj) {
				(predicate(value, key, obj) ? pass : fail).push(value);
			});
			return [pass, fail];
		};
	
		// Array Functions
		// ---------------
	
		// Get the first element of an array. Passing **n** will return the first N
		// values in the array. Aliased as `head` and `take`. The **guard** check
		// allows it to work with `_.map`.
		_.first = _.head = _.take = function(array, n, guard) {
			if (array == null) return void 0;
			if (n == null || guard) return array[0];
			if (n < 0) return [];
			return slice.call(array, 0, n);
		};
	
		// Returns everything but the last entry of the array. Especially useful on
		// the arguments object. Passing **n** will return all the values in
		// the array, excluding the last N. The **guard** check allows it to work with
		// `_.map`.
		_.initial = function(array, n, guard) {
			return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
		};
	
		// Get the last element of an array. Passing **n** will return the last N
		// values in the array. The **guard** check allows it to work with `_.map`.
		_.last = function(array, n, guard) {
			if (array == null) return void 0;
			if (n == null || guard) return array[array.length - 1];
			return slice.call(array, Math.max(array.length - n, 0));
		};
	
		// Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
		// Especially useful on the arguments object. Passing an **n** will return
		// the rest N values in the array. The **guard**
		// check allows it to work with `_.map`.
		_.rest = _.tail = _.drop = function(array, n, guard) {
			return slice.call(array, n == null || guard ? 1 : n);
		};
	
		// Trim out all falsy values from an array.
		_.compact = function(array) {
			return _.filter(array, _.identity);
		};
	
		// Internal implementation of a recursive `flatten` function.
		var flatten = function(input, shallow, strict, output) {
			if (shallow && _.every(input, _.isArray)) {
				return concat.apply(output, input);
			}
			for (var i = 0, length = input.length; i < length; i++) {
				var value = input[i];
				if (!_.isArray(value) && !_.isArguments(value)) {
					if (!strict) output.push(value);
				} else if (shallow) {
					push.apply(output, value);
				} else {
					flatten(value, shallow, strict, output);
				}
			}
			return output;
		};
	
		// Flatten out an array, either recursively (by default), or just one level.
		_.flatten = function(array, shallow) {
			return flatten(array, shallow, false, []);
		};
	
		// Return a version of the array that does not contain the specified value(s).
		_.without = function(array) {
			return _.difference(array, slice.call(arguments, 1));
		};
	
		// Produce a duplicate-free version of the array. If the array has already
		// been sorted, you have the option of using a faster algorithm.
		// Aliased as `unique`.
		_.uniq = _.unique = function(array, isSorted, iteratee, context) {
			if (array == null) return [];
			if (!_.isBoolean(isSorted)) {
				context = iteratee;
				iteratee = isSorted;
				isSorted = false;
			}
			if (iteratee != null) iteratee = _.iteratee(iteratee, context);
			var result = [];
			var seen = [];
			for (var i = 0, length = array.length; i < length; i++) {
				var value = array[i];
				if (isSorted) {
					if (!i || seen !== value) result.push(value);
					seen = value;
				} else if (iteratee) {
					var computed = iteratee(value, i, array);
					if (_.indexOf(seen, computed) < 0) {
						seen.push(computed);
						result.push(value);
					}
				} else if (_.indexOf(result, value) < 0) {
					result.push(value);
				}
			}
			return result;
		};
	
		// Produce an array that contains the union: each distinct element from all of
		// the passed-in arrays.
		_.union = function() {
			return _.uniq(flatten(arguments, true, true, []));
		};
	
		// Produce an array that contains every item shared between all the
		// passed-in arrays.
		_.intersection = function(array) {
			if (array == null) return [];
			var result = [];
			var argsLength = arguments.length;
			for (var i = 0, length = array.length; i < length; i++) {
				var item = array[i];
				if (_.contains(result, item)) continue;
				for (var j = 1; j < argsLength; j++) {
					if (!_.contains(arguments[j], item)) break;
				}
				if (j === argsLength) result.push(item);
			}
			return result;
		};
	
		// Take the difference between one array and a number of other arrays.
		// Only the elements present in just the first array will remain.
		_.difference = function(array) {
			var rest = flatten(slice.call(arguments, 1), true, true, []);
			return _.filter(array, function(value){
				return !_.contains(rest, value);
			});
		};
	
		// Zip together multiple lists into a single array -- elements that share
		// an index go together.
		_.zip = function(array) {
			if (array == null) return [];
			var length = _.max(arguments, 'length').length;
			var results = Array(length);
			for (var i = 0; i < length; i++) {
				results[i] = _.pluck(arguments, i);
			}
			return results;
		};
	
		// Converts lists into objects. Pass either a single array of `[key, value]`
		// pairs, or two parallel arrays of the same length -- one of keys, and one of
		// the corresponding values.
		_.object = function(list, values) {
			if (list == null) return {};
			var result = {};
			for (var i = 0, length = list.length; i < length; i++) {
				if (values) {
					result[list[i]] = values[i];
				} else {
					result[list[i][0]] = list[i][1];
				}
			}
			return result;
		};
	
		// Return the position of the first occurrence of an item in an array,
		// or -1 if the item is not included in the array.
		// If the array is large and already in sort order, pass `true`
		// for **isSorted** to use binary search.
		_.indexOf = function(array, item, isSorted) {
			if (array == null) return -1;
			var i = 0, length = array.length;
			if (isSorted) {
				if (typeof isSorted == 'number') {
					i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
				} else {
					i = _.sortedIndex(array, item);
					return array[i] === item ? i : -1;
				}
			}
			for (; i < length; i++) if (array[i] === item) return i;
			return -1;
		};
	
		_.lastIndexOf = function(array, item, from) {
			if (array == null) return -1;
			var idx = array.length;
			if (typeof from == 'number') {
				idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
			}
			while (--idx >= 0) if (array[idx] === item) return idx;
			return -1;
		};
	
		// Generate an integer Array containing an arithmetic progression. A port of
		// the native Python `range()` function. See
		// [the Python documentation](http://docs.python.org/library/functions.html#range).
		_.range = function(start, stop, step) {
			if (arguments.length <= 1) {
				stop = start || 0;
				start = 0;
			}
			step = step || 1;
	
			var length = Math.max(Math.ceil((stop - start) / step), 0);
			var range = Array(length);
	
			for (var idx = 0; idx < length; idx++, start += step) {
				range[idx] = start;
			}
	
			return range;
		};
	
		// Function (ahem) Functions
		// ------------------
	
		// Reusable constructor function for prototype setting.
		var Ctor = function(){};
	
		// Create a function bound to a given object (assigning `this`, and arguments,
		// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
		// available.
		_.bind = function(func, context) {
			var args, bound;
			if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
			if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
			args = slice.call(arguments, 2);
			bound = function() {
				if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
				Ctor.prototype = func.prototype;
				var self = new Ctor;
				Ctor.prototype = null;
				var result = func.apply(self, args.concat(slice.call(arguments)));
				if (_.isObject(result)) return result;
				return self;
			};
			return bound;
		};
	
		// Partially apply a function by creating a version that has had some of its
		// arguments pre-filled, without changing its dynamic `this` context. _ acts
		// as a placeholder, allowing any combination of arguments to be pre-filled.
		_.partial = function(func) {
			var boundArgs = slice.call(arguments, 1);
			return function() {
				var position = 0;
				var args = boundArgs.slice();
				for (var i = 0, length = args.length; i < length; i++) {
					if (args[i] === _) args[i] = arguments[position++];
				}
				while (position < arguments.length) args.push(arguments[position++]);
				return func.apply(this, args);
			};
		};
	
		// Bind a number of an object's methods to that object. Remaining arguments
		// are the method names to be bound. Useful for ensuring that all callbacks
		// defined on an object belong to it.
		_.bindAll = function(obj) {
			var i, length = arguments.length, key;
			if (length <= 1) throw new Error('bindAll must be passed function names');
			for (i = 1; i < length; i++) {
				key = arguments[i];
				obj[key] = _.bind(obj[key], obj);
			}
			return obj;
		};
	
		// Memoize an expensive function by storing its results.
		_.memoize = function(func, hasher) {
			var memoize = function(key) {
				var cache = memoize.cache;
				var address = hasher ? hasher.apply(this, arguments) : key;
				if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
				return cache[address];
			};
			memoize.cache = {};
			return memoize;
		};
	
		// Delays a function for the given number of milliseconds, and then calls
		// it with the arguments supplied.
		_.delay = function(func, wait) {
			var args = slice.call(arguments, 2);
			return setTimeout(function(){
				return func.apply(null, args);
			}, wait);
		};
	
		// Defers a function, scheduling it to run after the current call stack has
		// cleared.
		_.defer = function(func) {
			return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
		};
	
		// Returns a function, that, when invoked, will only be triggered at most once
		// during a given window of time. Normally, the throttled function will run
		// as much as it can, without ever going more than once per `wait` duration;
		// but if you'd like to disable the execution on the leading edge, pass
		// `{leading: false}`. To disable execution on the trailing edge, ditto.
		_.throttle = function(func, wait, options) {
			var context, args, result;
			var timeout = null;
			var previous = 0;
			if (!options) options = {};
			var later = function() {
				previous = options.leading === false ? 0 : _.now();
				timeout = null;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			};
			return function() {
				var now = _.now();
				if (!previous && options.leading === false) previous = now;
				var remaining = wait - (now - previous);
				context = this;
				args = arguments;
				if (remaining <= 0 || remaining > wait) {
					clearTimeout(timeout);
					timeout = null;
					previous = now;
					result = func.apply(context, args);
					if (!timeout) context = args = null;
				} else if (!timeout && options.trailing !== false) {
					timeout = setTimeout(later, remaining);
				}
				return result;
			};
		};
	
		// Returns a function, that, as long as it continues to be invoked, will not
		// be triggered. The function will be called after it stops being called for
		// N milliseconds. If `immediate` is passed, trigger the function on the
		// leading edge, instead of the trailing.
		_.debounce = function(func, wait, immediate) {
			var timeout, args, context, timestamp, result;
	
			var later = function() {
				var last = _.now() - timestamp;
	
				if (last < wait && last > 0) {
					timeout = setTimeout(later, wait - last);
				} else {
					timeout = null;
					if (!immediate) {
						result = func.apply(context, args);
						if (!timeout) context = args = null;
					}
				}
			};
	
			return function() {
				context = this;
				args = arguments;
				timestamp = _.now();
				var callNow = immediate && !timeout;
				if (!timeout) timeout = setTimeout(later, wait);
				if (callNow) {
					result = func.apply(context, args);
					context = args = null;
				}
	
				return result;
			};
		};
	
		// Returns the first function passed as an argument to the second,
		// allowing you to adjust arguments, run code before and after, and
		// conditionally execute the original function.
		_.wrap = function(func, wrapper) {
			return _.partial(wrapper, func);
		};
	
		// Returns a negated version of the passed-in predicate.
		_.negate = function(predicate) {
			return function() {
				return !predicate.apply(this, arguments);
			};
		};
	
		// Returns a function that is the composition of a list of functions, each
		// consuming the return value of the function that follows.
		_.compose = function() {
			var args = arguments;
			var start = args.length - 1;
			return function() {
				var i = start;
				var result = args[start].apply(this, arguments);
				while (i--) result = args[i].call(this, result);
				return result;
			};
		};
	
		// Returns a function that will only be executed after being called N times.
		_.after = function(times, func) {
			return function() {
				if (--times < 1) {
					return func.apply(this, arguments);
				}
			};
		};
	
		// Returns a function that will only be executed before being called N times.
		_.before = function(times, func) {
			var memo;
			return function() {
				if (--times > 0) {
					memo = func.apply(this, arguments);
				} else {
					func = null;
				}
				return memo;
			};
		};
	
		// Returns a function that will be executed at most one time, no matter how
		// often you call it. Useful for lazy initialization.
		_.once = _.partial(_.before, 2);
	
		// Object Functions
		// ----------------
	
		// Retrieve the names of an object's properties.
		// Delegates to **ECMAScript 5**'s native `Object.keys`
		_.keys = function(obj) {
			if (!_.isObject(obj)) return [];
			if (nativeKeys) return nativeKeys(obj);
			var keys = [];
			for (var key in obj) if (_.has(obj, key)) keys.push(key);
			return keys;
		};
	
		// Retrieve the values of an object's properties.
		_.values = function(obj) {
			var keys = _.keys(obj);
			var length = keys.length;
			var values = Array(length);
			for (var i = 0; i < length; i++) {
				values[i] = obj[keys[i]];
			}
			return values;
		};
	
		// Convert an object into a list of `[key, value]` pairs.
		_.pairs = function(obj) {
			var keys = _.keys(obj);
			var length = keys.length;
			var pairs = Array(length);
			for (var i = 0; i < length; i++) {
				pairs[i] = [keys[i], obj[keys[i]]];
			}
			return pairs;
		};
	
		// Invert the keys and values of an object. The values must be serializable.
		_.invert = function(obj) {
			var result = {};
			var keys = _.keys(obj);
			for (var i = 0, length = keys.length; i < length; i++) {
				result[obj[keys[i]]] = keys[i];
			}
			return result;
		};
	
		// Return a sorted list of the function names available on the object.
		// Aliased as `methods`
		_.functions = _.methods = function(obj) {
			var names = [];
			for (var key in obj) {
				if (_.isFunction(obj[key])) names.push(key);
			}
			return names.sort();
		};
	
		// Extend a given object with all the properties in passed-in object(s).
		_.extend = function(obj) {
			if (!_.isObject(obj)) return obj;
			var source, prop;
			for (var i = 1, length = arguments.length; i < length; i++) {
				source = arguments[i];
				for (prop in source) {
					if (hasOwnProperty.call(source, prop)) {
							obj[prop] = source[prop];
					}
				}
			}
			return obj;
		};
	
		// Return a copy of the object only containing the whitelisted properties.
		_.pick = function(obj, iteratee, context) {
			var result = {}, key;
			if (obj == null) return result;
			if (_.isFunction(iteratee)) {
				iteratee = createCallback(iteratee, context);
				for (key in obj) {
					var value = obj[key];
					if (iteratee(value, key, obj)) result[key] = value;
				}
			} else {
				var keys = concat.apply([], slice.call(arguments, 1));
				obj = new Object(obj);
				for (var i = 0, length = keys.length; i < length; i++) {
					key = keys[i];
					if (key in obj) result[key] = obj[key];
				}
			}
			return result;
		};
	
		 // Return a copy of the object without the blacklisted properties.
		_.omit = function(obj, iteratee, context) {
			if (_.isFunction(iteratee)) {
				iteratee = _.negate(iteratee);
			} else {
				var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
				iteratee = function(value, key) {
					return !_.contains(keys, key);
				};
			}
			return _.pick(obj, iteratee, context);
		};
	
		// Fill in a given object with default properties.
		_.defaults = function(obj) {
			if (!_.isObject(obj)) return obj;
			for (var i = 1, length = arguments.length; i < length; i++) {
				var source = arguments[i];
				for (var prop in source) {
					if (obj[prop] === void 0) obj[prop] = source[prop];
				}
			}
			return obj;
		};
	
		// Create a (shallow-cloned) duplicate of an object.
		_.clone = function(obj) {
			if (!_.isObject(obj)) return obj;
			return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
		};
	
		// Invokes interceptor with the obj, and then returns obj.
		// The primary purpose of this method is to "tap into" a method chain, in
		// order to perform operations on intermediate results within the chain.
		_.tap = function(obj, interceptor) {
			interceptor(obj);
			return obj;
		};
	
		// Internal recursive comparison function for `isEqual`.
		var eq = function(a, b, aStack, bStack) {
			// Identical objects are equal. `0 === -0`, but they aren't identical.
			// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
			if (a === b) return a !== 0 || 1 / a === 1 / b;
			// A strict comparison is necessary because `null == undefined`.
			if (a == null || b == null) return a === b;
			// Unwrap any wrapped objects.
			if (a instanceof _) a = a._wrapped;
			if (b instanceof _) b = b._wrapped;
			// Compare `[[Class]]` names.
			var className = toString.call(a);
			if (className !== toString.call(b)) return false;
			switch (className) {
				// Strings, numbers, regular expressions, dates, and booleans are compared by value.
				case '[object RegExp]':
				// RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
				case '[object String]':
					// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
					// equivalent to `new String("5")`.
					return '' + a === '' + b;
				case '[object Number]':
					// `NaN`s are equivalent, but non-reflexive.
					// Object(NaN) is equivalent to NaN
					if (+a !== +a) return +b !== +b;
					// An `egal` comparison is performed for other numeric values.
					return +a === 0 ? 1 / +a === 1 / b : +a === +b;
				case '[object Date]':
				case '[object Boolean]':
					// Coerce dates and booleans to numeric primitive values. Dates are compared by their
					// millisecond representations. Note that invalid dates with millisecond representations
					// of `NaN` are not equivalent.
					return +a === +b;
			}
			if (typeof a != 'object' || typeof b != 'object') return false;
			// Assume equality for cyclic structures. The algorithm for detecting cyclic
			// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
			var length = aStack.length;
			while (length--) {
				// Linear search. Performance is inversely proportional to the number of
				// unique nested structures.
				if (aStack[length] === a) return bStack[length] === b;
			}
			// Objects with different constructors are not equivalent, but `Object`s
			// from different frames are.
			var aCtor = a.constructor, bCtor = b.constructor;
			if (
				aCtor !== bCtor &&
				// Handle Object.create(x) cases
				'constructor' in a && 'constructor' in b &&
				!(_.isFunction(aCtor) && aCtor instanceof aCtor &&
					_.isFunction(bCtor) && bCtor instanceof bCtor)
			) {
				return false;
			}
			// Add the first object to the stack of traversed objects.
			aStack.push(a);
			bStack.push(b);
			var size, result;
			// Recursively compare objects and arrays.
			if (className === '[object Array]') {
				// Compare array lengths to determine if a deep comparison is necessary.
				size = a.length;
				result = size === b.length;
				if (result) {
					// Deep compare the contents, ignoring non-numeric properties.
					while (size--) {
						if (!(result = eq(a[size], b[size], aStack, bStack))) break;
					}
				}
			} else {
				// Deep compare objects.
				var keys = _.keys(a), key;
				size = keys.length;
				// Ensure that both objects contain the same number of properties before comparing deep equality.
				result = _.keys(b).length === size;
				if (result) {
					while (size--) {
						// Deep compare each member
						key = keys[size];
						if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
					}
				}
			}
			// Remove the first object from the stack of traversed objects.
			aStack.pop();
			bStack.pop();
			return result;
		};
	
		// Perform a deep comparison to check if two objects are equal.
		_.isEqual = function(a, b) {
			return eq(a, b, [], []);
		};
	
		// Is a given array, string, or object empty?
		// An "empty" object has no enumerable own-properties.
		_.isEmpty = function(obj) {
			if (obj == null) return true;
			if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
			for (var key in obj) if (_.has(obj, key)) return false;
			return true;
		};
	
		// Is a given value a DOM element?
		_.isElement = function(obj) {
			return !!(obj && obj.nodeType === 1);
		};
	
		// Is a given value an array?
		// Delegates to ECMA5's native Array.isArray
		_.isArray = nativeIsArray || function(obj) {
			return toString.call(obj) === '[object Array]';
		};
	
		// Is a given variable an object?
		_.isObject = function(obj) {
			var type = typeof obj;
			return type === 'function' || type === 'object' && !!obj;
		};
	
		// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
		_.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
			_['is' + name] = function(obj) {
				return toString.call(obj) === '[object ' + name + ']';
			};
		});
	
		// Define a fallback version of the method in browsers (ahem, IE), where
		// there isn't any inspectable "Arguments" type.
		if (!_.isArguments(arguments)) {
			_.isArguments = function(obj) {
				return _.has(obj, 'callee');
			};
		}
	
		// Optimize `isFunction` if appropriate. Work around an IE 11 bug.
		if (true) {
			_.isFunction = function(obj) {
				return typeof obj == 'function' || false;
			};
		}
	
		// Is a given object a finite number?
		_.isFinite = function(obj) {
			return isFinite(obj) && !isNaN(parseFloat(obj));
		};
	
		// Is the given value `NaN`? (NaN is the only number which does not equal itself).
		_.isNaN = function(obj) {
			return _.isNumber(obj) && obj !== +obj;
		};
	
		// Is a given value a boolean?
		_.isBoolean = function(obj) {
			return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
		};
	
		// Is a given value equal to null?
		_.isNull = function(obj) {
			return obj === null;
		};
	
		// Is a given variable undefined?
		_.isUndefined = function(obj) {
			return obj === void 0;
		};
	
		// Shortcut function for checking if an object has a given property directly
		// on itself (in other words, not on a prototype).
		_.has = function(obj, key) {
			return obj != null && hasOwnProperty.call(obj, key);
		};
	
		// Utility Functions
		// -----------------
	
		// Run Underscore.js in *noConflict* mode, returning the `_` variable to its
		// previous owner. Returns a reference to the Underscore object.
		_.noConflict = function() {
			root._ = previousUnderscore;
			return this;
		};
	
		// Keep the identity function around for default iteratees.
		_.identity = function(value) {
			return value;
		};
	
		_.constant = function(value) {
			return function() {
				return value;
			};
		};
	
		_.noop = function(){};
	
		_.property = function(key) {
			return function(obj) {
				return obj[key];
			};
		};
	
		// Returns a predicate for checking whether an object has a given set of `key:value` pairs.
		_.matches = function(attrs) {
			var pairs = _.pairs(attrs), length = pairs.length;
			return function(obj) {
				if (obj == null) return !length;
				obj = new Object(obj);
				for (var i = 0; i < length; i++) {
					var pair = pairs[i], key = pair[0];
					if (pair[1] !== obj[key] || !(key in obj)) return false;
				}
				return true;
			};
		};
	
		// Run a function **n** times.
		_.times = function(n, iteratee, context) {
			var accum = Array(Math.max(0, n));
			iteratee = createCallback(iteratee, context, 1);
			for (var i = 0; i < n; i++) accum[i] = iteratee(i);
			return accum;
		};
	
		// Return a random integer between min and max (inclusive).
		_.random = function(min, max) {
			if (max == null) {
				max = min;
				min = 0;
			}
			return min + Math.floor(Math.random() * (max - min + 1));
		};
	
		// A (possibly faster) way to get the current timestamp as an integer.
		_.now = Date.now || function() {
			return new Date().getTime();
		};
	
		 // List of HTML entities for escaping.
		var escapeMap = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;',
			'`': '&#x60;'
		};
		var unescapeMap = _.invert(escapeMap);
	
		// Functions for escaping and unescaping strings to/from HTML interpolation.
		var createEscaper = function(map) {
			var escaper = function(match) {
				return map[match];
			};
			// Regexes for identifying a key that needs to be escaped
			var source = '(?:' + _.keys(map).join('|') + ')';
			var testRegexp = RegExp(source);
			var replaceRegexp = RegExp(source, 'g');
			return function(string) {
				string = string == null ? '' : '' + string;
				return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
			};
		};
		_.escape = createEscaper(escapeMap);
		_.unescape = createEscaper(unescapeMap);
	
		// If the value of the named `property` is a function then invoke it with the
		// `object` as context; otherwise, return it.
		_.result = function(object, property) {
			if (object == null) return void 0;
			var value = object[property];
			return _.isFunction(value) ? object[property]() : value;
		};
	
		// Generate a unique integer id (unique within the entire client session).
		// Useful for temporary DOM ids.
		var idCounter = 0;
		_.uniqueId = function(prefix) {
			var id = ++idCounter + '';
			return prefix ? prefix + id : id;
		};
	
		// By default, Underscore uses ERB-style template delimiters, change the
		// following template settings to use alternative delimiters.
		_.templateSettings = {
			evaluate    : /<%([\s\S]+?)%>/g,
			interpolate : /<%=([\s\S]+?)%>/g,
			escape      : /<%-([\s\S]+?)%>/g
		};
	
		// When customizing `templateSettings`, if you don't want to define an
		// interpolation, evaluation or escaping regex, we need one that is
		// guaranteed not to match.
		var noMatch = /(.)^/;
	
		// Certain characters need to be escaped so that they can be put into a
		// string literal.
		var escapes = {
			"'":      "'",
			'\\':     '\\',
			'\r':     'r',
			'\n':     'n',
			'\u2028': 'u2028',
			'\u2029': 'u2029'
		};
	
		var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
	
		var escapeChar = function(match) {
			return '\\' + escapes[match];
		};
	
		// JavaScript micro-templating, similar to John Resig's implementation.
		// Underscore templating handles arbitrary delimiters, preserves whitespace,
		// and correctly escapes quotes within interpolated code.
		// NB: `oldSettings` only exists for backwards compatibility.
		_.template = function(text, settings, oldSettings) {
			if (!settings && oldSettings) settings = oldSettings;
			settings = _.defaults({}, settings, _.templateSettings);
	
			// Combine delimiters into one regular expression via alternation.
			var matcher = RegExp([
				(settings.escape || noMatch).source,
				(settings.interpolate || noMatch).source,
				(settings.evaluate || noMatch).source
			].join('|') + '|$', 'g');
	
			// Compile the template source, escaping string literals appropriately.
			var index = 0;
			var source = "__p+='";
			text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
				source += text.slice(index, offset).replace(escaper, escapeChar);
				index = offset + match.length;
	
				if (escape) {
					source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
				} else if (interpolate) {
					source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
				} else if (evaluate) {
					source += "';\n" + evaluate + "\n__p+='";
				}
	
				// Adobe VMs need the match returned to produce the correct offest.
				return match;
			});
			source += "';\n";
	
			// If a variable is not specified, place data values in local scope.
			if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
	
			source = "var __t,__p='',__j=Array.prototype.join," +
				"print=function(){__p+=__j.call(arguments,'');};\n" +
				source + 'return __p;\n';
	
			try {
				var render = new Function(settings.variable || 'obj', '_', source);
			} catch (e) {
				e.source = source;
				throw e;
			}
	
			var template = function(data) {
				return render.call(this, data, _);
			};
	
			// Provide the compiled source as a convenience for precompilation.
			var argument = settings.variable || 'obj';
			template.source = 'function(' + argument + '){\n' + source + '}';
	
			return template;
		};
	
		// Add a "chain" function. Start chaining a wrapped Underscore object.
		_.chain = function(obj) {
			var instance = _(obj);
			instance._chain = true;
			return instance;
		};
	
		// OOP
		// ---------------
		// If Underscore is called as a function, it returns a wrapped object that
		// can be used OO-style. This wrapper holds altered versions of all the
		// underscore functions. Wrapped objects may be chained.
	
		// Helper function to continue chaining intermediate results.
		var result = function(obj) {
			return this._chain ? _(obj).chain() : obj;
		};
	
		// Add your own custom functions to the Underscore object.
		_.mixin = function(obj) {
			_.each(_.functions(obj), function(name) {
				var func = _[name] = obj[name];
				_.prototype[name] = function() {
					var args = [this._wrapped];
					push.apply(args, arguments);
					return result.call(this, func.apply(_, args));
				};
			});
		};
	
		// Add all of the Underscore functions to the wrapper object.
		_.mixin(_);
	
		// Add all mutator Array functions to the wrapper.
		_.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
			var method = ArrayProto[name];
			_.prototype[name] = function() {
				var obj = this._wrapped;
				method.apply(obj, arguments);
				if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
				return result.call(this, obj);
			};
		});
	
		// Add all accessor Array functions to the wrapper.
		_.each(['concat', 'join', 'slice'], function(name) {
			var method = ArrayProto[name];
			_.prototype[name] = function() {
				return result.call(this, method.apply(this._wrapped, arguments));
			};
		});
	
		// Extracts the result from a wrapped and chained object.
		_.prototype.value = function() {
			return this._wrapped;
		};
	
		// AMD registration happens at the end for compatibility with AMD loaders
		// that may not enforce next-turn semantics on modules. Even though general
		// practice for AMD registration is to be anonymous, underscore registers
		// as a named module because, like jQuery, it is a base library that is
		// popular enough to be bundled in a third party lib, but not be part of
		// an AMD load request. Those cases could generate an error when an
		// anonymous define() is called outside of a loader request.
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
				return _;
			}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
					__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
	}.call(this));
	
	
	/***/ }),
	/* 3 */
	/***/ (function(module, exports, __webpack_require__) {
	
	"use strict";
	
	
	var _ = __webpack_require__(2);
	
	var _require = __webpack_require__(4),
			commit = _require.commit,
			setTarget = _require.setTarget,
			setFocus = _require.setFocus;
	
	var _require2 = __webpack_require__(6),
			islinkedAnchor = _require2.islinkedAnchor,
			getTarget = _require2.getTarget;
	
	var INJECTION_FLAG = '__TRACKER_INJECTED__';
	var WATCHING_EVENTTYPE_LIST = ['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'change'];
	
	function isWatchedEvent(eventType) {
		return _.indexOf(WATCHING_EVENTTYPE_LIST, eventType) !== -1;
	}
	
	function injectStopPropagation($window) {
		var $Event = $window.Event;
		var _stopPropagation = $Event.prototype.stopPropagation;
	
		$Event.prototype.stopPropagation = function () {
			var type = this.type;
	
			if (isWatchedEvent(type)) {
				commit(this);
			}
	
			_stopPropagation.call(this);
		};
	}
	
	function injectAddEventListener($window) {
		var $HTMLElement = $window.HTMLElement || $window.Element;
		var listener = null;
	
		if ($HTMLElement.prototype['addEventListener']) {
			listener = 'addEventListener';
		} else if ($HTMLElement.prototype['attachEvent']) {
			listener = 'attachEvent';
		}
	
		var _addEventListener = $HTMLElement.prototype[listener];
	
		$HTMLElement.prototype[listener] = function (type, listener) {
			var _this = this;
	
			if (isWatchedEvent(type)) {
				_addEventListener.call(this, 'mouseover', function () {
					setTarget(_this);
				}, false);
			}
	
			for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
				args[_key - 2] = arguments[_key];
			}
	
			_addEventListener.call.apply(_addEventListener, [this, type, listener].concat(args));
		};
	
		return _addEventListener;
	}
	
	function setInjectFlag($window, flagValue) {
		/**
		 * PreInjected: false,
		 * PostInjected: true
		 */
		$window[INJECTION_FLAG] = flagValue;
	}
	
	function isWindowWatching($window) {
		return Object.prototype.hasOwnProperty.call($window, INJECTION_FLAG);
	}
	
	function watchWindow($window) {
		if (isWindowWatching($window)) {
			return;
		}
	
		var addEventListener = injectAddEventListener($window);
		injectStopPropagation($window);
		setInjectFlag($window, false);
		var listener = null;
		var isIE8 = false;
	
		if (window['addEventListener']) {
			listener = 'addEventListener';
		} else if (window['attachEvent']) {
			listener = 'attachEvent';
			isIE8 = true;
		}
	
		$window[listener](isIE8 ? 'onload' : 'load', function () {
			var bodyElement = $window.document.body;
	
			_.each(WATCHING_EVENTTYPE_LIST, function (eventType) {
				addEventListener.call(bodyElement, isIE8 ? "on".concat(eventType) : eventType, function (event) {
					var target = getTarget(event);
					var isTrusted = isIE8 ? true : event.isTrusted;
	
					if (islinkedAnchor(target) && isTrusted && event.type === 'click') {
						event.preventDefault();
					}
	
					commit(event);
					setFocus($window.document.activeElement);
				}, false);
			});
	
			if (isIE8) {
				var watchIElement = function watchIElement() {
					var iElementList = $window.document.querySelectorAll('input,textarea');
	
					_.each(iElementList, function (ele) {
						if (ele[INJECTION_FLAG]) {
							return;
						}
	
						ele[INJECTION_FLAG] = true;
						addEventListener.call(ele, 'onchange', function (event) {
							commit(event);
							setFocus($window.document.activeElement);
						}, false);
					});
				};
	
				setInterval(function w() {
					watchIElement();
					return w;
				}(), 100);
			}
	
			addEventListener.call(bodyElement, isIE8 ? 'onmouseover' : 'mouseover', function (event) {
				var target = getTarget(event);
				setTarget(target || event.srcElement);
				setFocus($window.document.activeElement);
			});
			setInjectFlag($window, true);
		});
	}
	
	exports.watchWindow = watchWindow;
	
	/***/ }),
	/* 4 */
	/***/ (function(module, exports, __webpack_require__) {
	
	"use strict";
	
	
	var EventEmitter = __webpack_require__(5);
	
	var _require = __webpack_require__(6),
			getSnapshot = _require.getSnapshot,
			getTarget = _require.getTarget;
	
	var _require2 = __webpack_require__(8),
			getSession = _require2.getSession;
	
	var $state = {
		target: null,
		focus: null,
		bodySnapshot: ''
	};
	
	function commit(event) {
		var target = getTarget(event);
	
		if (Object.prototype.hasOwnProperty.call(event, 'isTrusted')) {
			if (!event.isTrusted) {
				return;
			}
		}
	
		setTarget(target);
		state.emit('commit', event);
	}
	
	function setTarget(element) {
		if ($state.target === element) {
			return;
		}
	
		$state.target = element;
		state.emit('target-change', element);
	}
	
	function setFocus(element) {
		if ($state.focus === element) {
			return;
		}
	
		$state.focus = element;
		state.emit('focus-change', element);
	}
	
	function getBodySnapshot() {
		return $state.bodySnapshot;
	}
	
	var sessionURL = 'api/page/behavior/session/';
	var url = "".concat(sessionURL).concat(getSession(), "/snapshot/");
	
	function captureBody() {
		$state.bodySnapshot = getSnapshot(window.top, '');
	}
	
	var state = new EventEmitter();
	exports.state = state;
	exports.$state = $state;
	exports.setTarget = setTarget;
	exports.setFocus = setFocus;
	exports.getBodySnapshot = getBodySnapshot;
	exports.captureBody = captureBody;
	exports.commit = commit;
	
	/***/ }),
	/* 5 */
	/***/ (function(module, exports, __webpack_require__) {
	
	"use strict";
	
	
	var has = Object.prototype.hasOwnProperty
		, prefix = '~';
	
	/**
	 * Constructor to create a storage for our `EE` objects.
	 * An `Events` instance is a plain object whose properties are event names.
	 *
	 * @constructor
	 * @private
	 */
	function Events() {}
	
	//
	// We try to not inherit from `Object.prototype`. In some engines creating an
	// instance in this way is faster than calling `Object.create(null)` directly.
	// If `Object.create(null)` is not supported we prefix the event names with a
	// character to make sure that the built-in object properties are not
	// overridden or used as an attack vector.
	//
	if (Object.create) {
		Events.prototype = Object.create(null);
	
		//
		// This hack is needed because the `__proto__` property is still inherited in
		// some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
		//
		if (!new Events().__proto__) prefix = false;
	}
	
	/**
	 * Representation of a single event listener.
	 *
	 * @param {Function} fn The listener function.
	 * @param {*} context The context to invoke the listener with.
	 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
	 * @constructor
	 * @private
	 */
	function EE(fn, context, once) {
		this.fn = fn;
		this.context = context;
		this.once = once || false;
	}
	
	/**
	 * Add a listener for a given event.
	 *
	 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {*} context The context to invoke the listener with.
	 * @param {Boolean} once Specify if the listener is a one-time listener.
	 * @returns {EventEmitter}
	 * @private
	 */
	function addListener(emitter, event, fn, context, once) {
		if (typeof fn !== 'function') {
			throw new TypeError('The listener must be a function');
		}
	
		var listener = new EE(fn, context || emitter, once)
			, evt = prefix ? prefix + event : event;
	
		if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
		else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
		else emitter._events[evt] = [emitter._events[evt], listener];
	
		return emitter;
	}
	
	/**
	 * Clear event by name.
	 *
	 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
	 * @param {(String|Symbol)} evt The Event name.
	 * @private
	 */
	function clearEvent(emitter, evt) {
		if (--emitter._eventsCount === 0) emitter._events = new Events();
		else delete emitter._events[evt];
	}
	
	/**
	 * Minimal `EventEmitter` interface that is molded against the Node.js
	 * `EventEmitter` interface.
	 *
	 * @constructor
	 * @public
	 */
	function EventEmitter() {
		this._events = new Events();
		this._eventsCount = 0;
	}
	
	/**
	 * Return an array listing the events for which the emitter has registered
	 * listeners.
	 *
	 * @returns {Array}
	 * @public
	 */
	EventEmitter.prototype.eventNames = function eventNames() {
		var names = []
			, events
			, name;
	
		if (this._eventsCount === 0) return names;
	
		for (name in (events = this._events)) {
			if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
		}
	
		if (Object.getOwnPropertySymbols) {
			return names.concat(Object.getOwnPropertySymbols(events));
		}
	
		return names;
	};
	
	/**
	 * Return the listeners registered for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @returns {Array} The registered listeners.
	 * @public
	 */
	EventEmitter.prototype.listeners = function listeners(event) {
		var evt = prefix ? prefix + event : event
			, handlers = this._events[evt];
	
		if (!handlers) return [];
		if (handlers.fn) return [handlers.fn];
	
		for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
			ee[i] = handlers[i].fn;
		}
	
		return ee;
	};
	
	/**
	 * Return the number of listeners listening to a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @returns {Number} The number of listeners.
	 * @public
	 */
	EventEmitter.prototype.listenerCount = function listenerCount(event) {
		var evt = prefix ? prefix + event : event
			, listeners = this._events[evt];
	
		if (!listeners) return 0;
		if (listeners.fn) return 1;
		return listeners.length;
	};
	
	/**
	 * Calls each of the listeners registered for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @returns {Boolean} `true` if the event had listeners, else `false`.
	 * @public
	 */
	EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
		var evt = prefix ? prefix + event : event;
	
		if (!this._events[evt]) return false;
	
		var listeners = this._events[evt]
			, len = arguments.length
			, args
			, i;
	
		if (listeners.fn) {
			if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);
	
			switch (len) {
				case 1: return listeners.fn.call(listeners.context), true;
				case 2: return listeners.fn.call(listeners.context, a1), true;
				case 3: return listeners.fn.call(listeners.context, a1, a2), true;
				case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
				case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
				case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
			}
	
			for (i = 1, args = new Array(len -1); i < len; i++) {
				args[i - 1] = arguments[i];
			}
	
			listeners.fn.apply(listeners.context, args);
		} else {
			var length = listeners.length
				, j;
	
			for (i = 0; i < length; i++) {
				if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);
	
				switch (len) {
					case 1: listeners[i].fn.call(listeners[i].context); break;
					case 2: listeners[i].fn.call(listeners[i].context, a1); break;
					case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
					case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
					default:
						if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
							args[j - 1] = arguments[j];
						}
	
						listeners[i].fn.apply(listeners[i].context, args);
				}
			}
		}
	
		return true;
	};
	
	/**
	 * Add a listener for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {*} [context=this] The context to invoke the listener with.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.on = function on(event, fn, context) {
		return addListener(this, event, fn, context, false);
	};
	
	/**
	 * Add a one-time listener for a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn The listener function.
	 * @param {*} [context=this] The context to invoke the listener with.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.once = function once(event, fn, context) {
		return addListener(this, event, fn, context, true);
	};
	
	/**
	 * Remove the listeners of a given event.
	 *
	 * @param {(String|Symbol)} event The event name.
	 * @param {Function} fn Only remove the listeners that match this function.
	 * @param {*} context Only remove the listeners that have this context.
	 * @param {Boolean} once Only remove one-time listeners.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
		var evt = prefix ? prefix + event : event;
	
		if (!this._events[evt]) return this;
		if (!fn) {
			clearEvent(this, evt);
			return this;
		}
	
		var listeners = this._events[evt];
	
		if (listeners.fn) {
			if (
				listeners.fn === fn &&
				(!once || listeners.once) &&
				(!context || listeners.context === context)
			) {
				clearEvent(this, evt);
			}
		} else {
			for (var i = 0, events = [], length = listeners.length; i < length; i++) {
				if (
					listeners[i].fn !== fn ||
					(once && !listeners[i].once) ||
					(context && listeners[i].context !== context)
				) {
					events.push(listeners[i]);
				}
			}
	
			//
			// Reset the array, or remove it completely if we have no more listeners.
			//
			if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
			else clearEvent(this, evt);
		}
	
		return this;
	};
	
	/**
	 * Remove all listeners, or those of the specified event.
	 *
	 * @param {(String|Symbol)} [event] The event name.
	 * @returns {EventEmitter} `this`.
	 * @public
	 */
	EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
		var evt;
	
		if (event) {
			evt = prefix ? prefix + event : event;
			if (this._events[evt]) clearEvent(this, evt);
		} else {
			this._events = new Events();
			this._eventsCount = 0;
		}
	
		return this;
	};
	
	//
	// Alias methods names because people roll like that.
	//
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
	EventEmitter.prototype.addListener = EventEmitter.prototype.on;
	
	//
	// Expose the prefix.
	//
	EventEmitter.prefixed = prefix;
	
	//
	// Allow `EventEmitter` to be imported as module namespace.
	//
	EventEmitter.EventEmitter = EventEmitter;
	
	//
	// Expose the module.
	//
	if (true) {
		module.exports = EventEmitter;
	}
	
	
	/***/ }),
	/* 6 */
	/***/ (function(module, exports, __webpack_require__) {
	
	var arrayFrom = __webpack_require__(7);
	
	var _ = __webpack_require__(2);
	
	var isIE8 = true;
	
	if (window.addEventListener) {
		isIE8 = false;
	}
	
	function getAllAttributes(element) {
		if (!element.hasAttributes()) {
			return '';
		}
	
		var attrs = element.attributes;
		var length = attrs.length;
		var output = '';
	
		for (var i = 0; i < length; i++) {
			output += " ".concat(attrs[i].name, "=\"").concat(attrs[i].value, "\"");
		}
	
		return output;
	}
	
	function getNodeDetailWithAttributes(element) {
		return "<".concat(element.tagName.toLowerCase()).concat(getAllAttributes(element), ">");
	}
	
	;
	
	function visitFrameWindow(window) {
		var windowList = [window];
		var iframeList = window.document.querySelectorAll('iframe');
	
		_.each(iframeList, function (iframe) {
			var iframeWindow = iframe.contentWindow;
	
			try {
				iframeWindow.__CORS_TEST__ = true;
				windowList = windowList.concat(visitFrameWindow(iframeWindow));
			} catch (err) {
				return;
			}
		});
	
		return windowList;
	}
	
	function traverseFrame(rootWindow) {
		var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
		if (!rootWindow) return;
	
		_.each(visitFrameWindow(rootWindow), function (window) {
			callback(window);
		});
	}
	
	;
	var MODEL_ELEMENT = /(input|textarea)/;
	var VALUE_IGNORE_INPUT = /(checkbox|radio)/;
	var DEFAULT_TRANCATE_LENGTH = 60;
	
	function searchText(element) {
		return element.textContent ? element.textContent : element.innerText;
	}
	
	;
	
	function searchLabel(element) {
		var labels = element.labels;
	
		if (labels && labels[0]) {
			return labels[0].textContent ? labels[0].textContent : labels[0].innerText;
		}
	
		if (VALUE_IGNORE_INPUT.test(element.type)) {
			return null;
		}
	
		return element.value;
	}
	
	;
	
	function strTrim(str) {
		return str.replace(/^\s+|\s+$/g, "");
	}
	
	function truncateText(string, length) {
		var text = strTrim(String(string));
		var newlinePos = text.search(/\r?\n/);
	
		if (newlinePos !== -1) {
			text = text.substr(0, newlinePos);
		}
	
		if (text.length > length) {
			return text.substr(0, length - 1) + '...';
		}
	
		return text;
	}
	
	function getTextSlice(element) {
		var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_TRANCATE_LENGTH;
		var raw;
	
		if (MODEL_ELEMENT.test(element.tagName.toLowerCase())) {
			raw = searchLabel(element);
		} else {
			raw = searchText(element);
		}
	
		return raw ? truncateText(raw, length) : null;
	}
	
	;
	
	function islinkedAnchor(element) {
		return element.tagName.toLowerCase() === 'a' && element.href && element.target !== '_blank';
	}
	
	;
	var SCRIPT_REG = /<script\.*<\/script>/g;
	var STYLE_REG = /<style\.*<\/style>/g;
	var LINK_REG = /<link\.*<\/link>/g;
	var META_REG = /<meta\.*<\/meta>/g;
	var URL_REG = /url\s*\(\s*([\S ]+)\s*\)/gi;
	var SRC_REG = /src="[\S^"]+"/gi;
	
	function resolveURL(dst, src) {
		dst = dst.replace(/\/+$/, '');
		var dstResult = dst.match(/^(https?:\/\/[^\/\s]+)((\/[^\/\s]+)*)(\?\S*)?/);
		var origin = dstResult[1];
		var dstPath = dstResult[2]; //   const [, origin, dstPath] = dst.match(/^(https?:\/\/[^\/\s]+)((\/[^\/\s]+)*)(\?\S*)?/);
	
		var dstPathComponent = dstPath ? dstPath.split('/') : [];
		var srcResult = src.match(/(\S+)(\?\S+)?/);
		var srcPath = srcResult[1];
		var srcQuery = srcResult[2]; //   const [, srcPath, srcQuery] = src.match(/(\S+)(\?\S+)?/);
	
		var srcPathComponent = srcPath.split('/');
		dstPathComponent.shift();
		dstPathComponent.pop();
	
		if (srcPathComponent[0] === '') {
			dstPathComponent.length = 0;
			srcPathComponent.shift();
		}
	
		_.each(srcPathComponent, function (component) {
			if (component === '.') {
				return;
			}
	
			if (component === '..') {
				return dstPathComponent.pop();
			}
	
			dstPathComponent.push(component);
		});
	
		return "".concat(origin, "/").concat(dstPathComponent.join('/')).concat(srcQuery ? srcQuery : '');
	}
	
	function relativeToStyleSheets(cssText, baseURL) {
		return cssText.replace(URL_REG, function (match, url) {
			var absURL = resolveURL(baseURL, url.replace(/['"]/g, ''));
			return "url(".concat(absURL, ")");
		});
	}
	
	function getStyleSheets($document) {
		var styleSheetList = $document.styleSheets;
		var styleText = '';
	
		_.each(arrayFrom(styleSheetList), function (styleSheet) {
			if (!styleSheet.cssRules && !styleSheet.cssText) {
				return;
			}
	
			var baseURL = styleSheet.href;
	
			if (isIE8) {
				styleText += baseURL ? relativeToStyleSheets(styleSheet.cssText, baseURL) : styleSheet.cssText;
				return;
			}
	
			_.each(arrayFrom(styleSheet.cssRules), function (rule) {
				styleText += baseURL ? relativeToStyleSheets(rule.cssText, baseURL) : rule.cssText;
			});
		});
	
		return styleText;
	}
	
	function replaceSnapshotSrc(html, newSrc) {
		return html.replace(SRC_REG, "src=\"".concat(newSrc, "\""));
	}
	
	function getTarget($event) {
		return $event.target || $event.srcElement;
	}
	
	function getBodyHTMLText($document) {
		return $document.body.outerHTML.replace(SCRIPT_REG, '').replace(STYLE_REG, '');
	}
	
	function getHeadHTMLText($document) {
		return $document.getElementsByTagName('head')[0].outerHTML.replace(SCRIPT_REG, '').replace(LINK_REG, '').replace(STYLE_REG, '');
	}
	
	function getHTMLText($document) {
		var head = getHeadHTMLText($document);
		var body = getBodyHTMLText($document); // const base = $document.baseURI;
	
		var title = $document.title;
		var style = getStyleSheets($document);
		return "<!DOCTYPE html><html><head><title>".concat(title, "</title><style type=\"text/css\">").concat(style, "</style></head>").concat(body, "</html>"); // return `<!DOCTYPE html><html><head><base href="${base}"/><title>${title}</title><style type="text/css">${style}</style></head>${body}</html>`;
	}
	
	function getSnapshot($window, preSrc) {
		var result = {};
	
		if ($window.self === $window.top) {
			var now = Date.now().toString();
			result.time = now;
		}
	
		result.self = getHTMLText($window.document);
		var iframeList = $window.document.querySelectorAll('iframe');
	
		if (iframeList.length !== 0) {
			_.each(iframeList, function (iframe, index) {
				var outerHTML = iframe.outerHTML;
				var src = preSrc === '' ? index : "".concat(preSrc, "-").concat(index);
				var newOuterHTML = replaceSnapshotSrc(outerHTML, src);
				result.self = result.self.replace(outerHTML, newOuterHTML);
				result[index] = getSnapshot(iframe.contentWindow, src);
			});
		}
	
		return result;
	}
	
	function addEventListener(element, eventType, listener) {
		if (element.addEventListener) {
			element.addEventListener(eventType, listener, false);
		} else {
			element.attachEvent("on".concat(eventType), listener);
		}
	}
	
	exports.getNodeDetailWithAttributes = getNodeDetailWithAttributes;
	exports.traverseFrame = traverseFrame;
	exports.searchText = searchText;
	exports.searchLabel = searchLabel;
	exports.getTextSlice = getTextSlice;
	exports.islinkedAnchor = islinkedAnchor;
	exports.getBodyHTMLText = getBodyHTMLText;
	exports.getHeadHTMLText = getHeadHTMLText;
	exports.getHTMLText = getHTMLText;
	exports.getSnapshot = getSnapshot;
	exports.getTarget = getTarget;
	exports.addEventListener = addEventListener;
	
	/***/ }),
	/* 7 */
	/***/ (function(module, exports) {
	
	var arrayFrom = function () {
		var toStr = Object.prototype.toString;
	
		var isCallable = function isCallable(fn) {
			return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
		};
	
		var toInteger = function toInteger(value) {
			var number = Number(value);
	
			if (isNaN(number)) {
				return 0;
			}
	
			if (number === 0 || !isFinite(number)) {
				return number;
			}
	
			return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		};
	
		var maxSafeInteger = Math.pow(2, 53) - 1;
	
		var toLength = function toLength(value) {
			var len = toInteger(value);
			return Math.min(Math.max(len, 0), maxSafeInteger);
		};
	
		var toItems = function toItems(value) {
			// support set
			if (value.size > 0 && value.values) {
				var values = value.values();
				var it = values.next();
				var o = [];
	
				while (!it.done) {
					o.push(it.value);
					it = values.next();
				}
	
				return o;
			}
	
			return Object(value);
		}; // The length property of the from method is 1.
	
	
		return function from(arrayLike
		/*, mapFn, thisArg */
		) {
			// 1. Let C be the this value.
			var C = this; // 2. Let items be ToObject(arrayLike).
	
			var items = toItems(arrayLike); // 3. ReturnIfAbrupt(items).
	
			if (arrayLike == null) {
				throw new TypeError("Array.from requires an array-like object - not null or undefined");
			} // 4. If mapfn is undefined, then let mapping be false.
	
	
			var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
			var T;
	
			if (typeof mapFn !== 'undefined') {
				// 5. else      
				// 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
				if (!isCallable(mapFn)) {
					throw new TypeError('Array.from: when provided, the second argument must be a function');
				} // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
	
	
				if (arguments.length > 2) {
					T = arguments[2];
				}
			} // 10. Let lenValue be Get(items, "length").
			// 11. Let len be ToLength(lenValue).
	
	
			var len = toLength(items.length); // 13. If IsConstructor(C) is true, then
			// 13. a. Let A be the result of calling the [[Construct]] internal method 
			// of C with an argument list containing the single item len.
			// 14. a. Else, Let A be ArrayCreate(len).
	
			var A = isCallable(C) ? Object(new C(len)) : new Array(len); // 16. Let k be 0.
	
			var k = 0; // 17. Repeat, while k < len… (also steps a - h)
	
			var kValue;
	
			while (k < len) {
				kValue = items[k];
	
				if (mapFn) {
					A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
				} else {
					A[k] = kValue;
				}
	
				k += 1;
			} // 18. Let putStatus be Put(A, "length", len, true).
	
	
			A.length = len; // 20. Return A.
	
			return A;
		};
	}();
	
	module.exports = arrayFrom;
	
	/***/ }),
	/* 8 */
	/***/ (function(module, exports) {
	
	var APM_SESSION_FLAG = 'apm_session';
	var SECOND = 1000;
	var MINUTE = 60 * SECOND;
	var HOUR = 60 * MINUTE;
	var DAY = 24 * HOUR;
	var SESSION_OPTIONS = {
		path: '/',
		expires: 365 * DAY
	};
	
	function getSessionOptionStr() {
		return ";path=".concat(SESSION_OPTIONS.path, ";expires=").concat(new Date(Date.now() + SESSION_OPTIONS.expires).toUTCString());
	}
	
	function getNumber() {
		return Math.ceil(Math.random() * 10).toString(16);
	}
	
	function getCode(length) {
		var result = '';
	
		for (var i = 0; i < length; i = i + 1) {
			result = result + getNumber();
		}
	
		return result + '.' + Date.now().toString(16);
	}
	
	function generateApmSessionId() {
		return getCode(11);
	}
	
	function getSession() {
		return document.cookie.replace(/(?:(?:^|.*;\s*)apm_session\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	}
	
	;
	
	function updateSession() {
		var sessionId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : generateApmSessionId();
		return document.cookie = APM_SESSION_FLAG + '=' + sessionId + getSessionOptionStr();
	}
	
	function createNewSession() {
		return updateSession();
	}
	
	var lastSession = getSession();
	
	if (lastSession) {
		updateSession(lastSession);
	} else {
		createNewSession();
	}
	
	exports.getSession = getSession;
	
	/***/ }),
	/* 9 */
	/***/ (function(module, exports, __webpack_require__) {
	
	"use strict";
	
	
	var EventEmitter = __webpack_require__(5);
	
	var _ = __webpack_require__(2);
	
	var _require = __webpack_require__(10),
			queryFullCSSPath = _require.queryFullCSSPath;
	
	var _require2 = __webpack_require__(6),
			getNodeDetailWithAttributes = _require2.getNodeDetailWithAttributes,
			getSnapshot = _require2.getSnapshot,
			getTarget = _require2.getTarget,
			addEventListener = _require2.addEventListener;
	
	var _require3 = __webpack_require__(4),
			state = _require3.state,
			getBodySnapshot = _require3.getBodySnapshot,
			captureBody = _require3.captureBody;
	
	var _require4 = __webpack_require__(8),
			getSession = _require4.getSession;
	
	var DOUBLE_CLICK_INTERVAL = 400;
	var ECHO_TIMEOUT = 1000;
	var SIMPLE_EVENT_LIST = ['mousedown', 'mouseup'];
	var CHECKING_ELEMENT_TYPE = /(checkbox|radio)/;
	
	function isSimpleEvent(event) {
		return _.indexOf(SIMPLE_EVENT_LIST, event.type) !== -1;
	}
	
	function isCheckbox(element) {
		return element.tagName.toLowerCase() === 'input' && CHECKING_ELEMENT_TYPE.test(element.type);
	}
	
	function isDropdownMenu(element) {
		return element.tagName.toLowerCase() === 'select';
	}
	
	var $analyser = {
		releaseSignal: {
			suppose: null,
			checkpoint: 0,
			watching: false
		},
		eventStack: [],
		target: {
			path: '',
			abstract: ''
		},
		focus: {
			path: '',
			abstract: ''
		},
		DOM: {
			target: null,
			focus: null
		},
		getData: function getData() {
			return {
				stack: this.eventStack,
				target: _.extend({}, this.target),
				focus: _.extend({}, this.focus),
				snapshot: getBodySnapshot()
			};
		},
		release: function release() {
			var releaseSignal = this.releaseSignal;
			var suppose = releaseSignal.suppose;
	
			if (suppose !== null) {
				var node = _.extend({}, this.DOM);
	
				analyser.emit('resolve-action', suppose, this.getData(), node);
			}
	
			releaseSignal.suppose = null;
			releaseSignal.watching = false;
			this.eventStack = [];
			return this;
		},
		setReleaseSignal: function setReleaseSignal(delay) {
			var suppose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
			var releaseSignal = this.releaseSignal;
			releaseSignal.checkpoint = Date.now() + delay;
			releaseSignal.watching = true;
			releaseSignal.suppose = suppose;
			return this;
		},
		eatMouseEvent: function eatMouseEvent(event) {
			this.eventStack.push(event);
			return this;
		},
		releaseAsAction: function releaseAsAction(name) {
			this.releaseSignal.suppose = name;
			this.release();
			return this;
		}
	};
	state.on('commit', function (event) {
		$analyser.setReleaseSignal(ECHO_TIMEOUT);
	
		if (isSimpleEvent(event)) {
			return $analyser.eatMouseEvent(event);
		}
	
		if (event.type === 'click') {
			$analyser.eatMouseEvent(event);
			var target = getTarget(event);
	
			if (isCheckbox(target) || isDropdownMenu(target)) {
				$analyser.setReleaseSignal(ECHO_TIMEOUT, 'change');
			} else {
				$analyser.setReleaseSignal(DOUBLE_CLICK_INTERVAL, 'click');
			}
	
			return;
		}
	
		if (event.type === 'dblclick') {
			return $analyser.eatMouseEvent(event).releaseAsAction('doubleClick');
		}
	
		if (event.type === 'contextmenu') {
			return $analyser.eatMouseEvent(event).releaseAsAction('rightClick');
		}
	
		if (event.type === 'change') {
			$analyser.eatMouseEvent(event);
	
			var _target = getTarget(event);
	
			if (!isDropdownMenu(_target)) {
				$analyser.releaseAsAction('change');
			}
	
			return;
		}
	});
	state.on('target-change', function (element) {
		var target = $analyser.target,
				DOM = $analyser.DOM;
		$analyser.release();
		target.path = queryFullCSSPath(element);
		target.abstract = getNodeDetailWithAttributes(element);
		captureBody();
		DOM.target = element;
	});
	state.on('focus-change', function (element) {
		var focus = $analyser.focus,
				DOM = $analyser.DOM;
		focus.path = queryFullCSSPath(element);
		focus.abstract = getNodeDetailWithAttributes(element);
		DOM.focus = element;
	});
	addEventListener(window, 'unload', function () {
		$analyser.release();
	});
	var sessionURL = 'api/page/behavior/session/';
	var url = "".concat(sessionURL).concat(getSession(), "/snapshot/");
	addEventListener(window, 'load', function () {
		if (window.self !== window.top) {
			return;
		} else {
			analyser.emit('resolve-action', 'enter', {
				location: window.location,
				title: document.title,
				referrer: document.referrer,
				snapshot: getSnapshot(window.top, '')
			});
		}
	});
	setInterval(function () {
		var _$analyser$releaseSig = $analyser.releaseSignal,
				checkpoint = _$analyser$releaseSig.checkpoint,
				watching = _$analyser$releaseSig.watching;
	
		if (!watching) {
			return;
		}
	
		if (Date.now() < checkpoint) {
			return;
		}
	
		$analyser.release();
	}, Math.floor(DOUBLE_CLICK_INTERVAL / 4));
	var analyser = new EventEmitter();
	exports.analyser = analyser;
	
	/***/ }),
	/* 10 */
	/***/ (function(module, exports, __webpack_require__) {
	
	"use strict";
	
	
	var queryElement = __webpack_require__(11);
	
	queryElement.setupIdIgnore(function (id) {
		return id && /\d\d/.test(id);
	});
	queryElement.setupClassIgnore(function () {
		return true;
	});
	
	function queryCSSPath(element) {
		var result = queryElement(element);
		var fixed = result.replace(/\\3(\d)\s/g, '$1').replace(/\\/g, '\\\\');
		return fixed;
	}
	
	exports.queryFullCSSPath = function queryFullCSSPath(element) {
		var selector = '';
	
		while (element) {
			selector = "".concat(queryCSSPath(element)) + (selector ? ' < ' : '') + "".concat(selector);
			element = element.ownerDocument.defaultView.frameElement;
		}
	
		return selector;
	};
	
	/***/ }),
	/* 11 */
	/***/ (function(module, exports, __webpack_require__) {
	
	var __WEBPACK_AMD_DEFINE_RESULT__;(function () {
		'use strict';
	
		var _ = __webpack_require__(2);
	
		var invalidId = [];
		var invalidClass = [];
	
		var idIgnore = function idIgnore() {};
	
		var classIgnore = function classIgnore() {};
		/**
		 * escape css name
		 * based on:
		 * https://github.com/mathiasbynens/CSS.escape
		 */
	
	
		function escape(value) {
			var string = String(value);
			var length = string.length;
			var index = -1;
			var codeUnit;
			var result = '';
			var firstCodeUnit = string.charCodeAt(0);
	
			while (++index < length) {
				codeUnit = string.charCodeAt(index);
	
				if (codeUnit == 0x0000) {
					result += "\uFFFD";
					continue;
				}
	
				if (codeUnit >= 0x0001 && codeUnit <= 0x001F || codeUnit == 0x007F || index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039 || index === 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit == 0x002D) {
					result += '\\' + codeUnit.toString(16) + ' ';
					continue;
				}
	
				if (index == 0 && length == 1 && codeUnit == 0x002D) {
					result += '\\' + string.charAt(index);
				}
	
				if (codeUnit >= 0x0080 || codeUnit == 0x002D || codeUnit == 0x005F || codeUnit >= 0x0030 && codeUnit <= 0x0039 || codeUnit >= 0x0041 && codeUnit <= 0x005A || codeUnit >= 0x0061 && codeUnit <= 0x007A) {
					result += string.charAt(index);
					continue;
				}
	
				result += '\\' + string.charAt(index);
			}
	
			return result;
		} // the following code are mostly based on:
		// https://github.com/mozilla/gecko-dev
	
		/**
		 * Find the position of element in nodeList.
		 * @returns an index of match, or -1 if there is no match
		 */
	
	
		function positionInNodeList(element, nodeList) {
			for (var i = 0; i < nodeList.length; i++) {
				if (element === nodeList[i]) {
					return i;
				}
			}
	
			return -1;
		}
		/**
		 * Find a unique CSS selector for a given element
		 * @returns a string such that ele.ownerDocument.querySelector(reply) === ele
		 * and ele.ownerDocument.querySelectorAll(reply).length === 1
		 * inspired by 
		 */
	
	
		function findCssSelector(ele) {
			var doc = ele.ownerDocument;
			var id = ele.id;
	
			if (id && !idIgnore(id) && _.indexOf(invalidId, id) === -1 && doc.querySelectorAll('#' + escape(id)).length === 1) {
				return '#' + escape(id);
			} // unique tag name
	
	
			var tagName = ele.tagName.toLowerCase();
	
			if (tagName === 'html' || tagName === 'head' || tagName === 'body') {
				return tagName;
			}
	
			function strTrim(str) {
				return str.replace(/^\s+|\s+$/g, "");
			}
	
			function getClassList(elem) {
				var trimmedClasses = strTrim(elem.getAttribute("class") || "");
				var classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [];
				return classes;
			}
	
			var classList = getClassList(ele); // try to find a unique class name
	
			var selector, index, matches, i, className;
	
			if (classList.length > 0) {
				for (i = 0; i < classList.length; i++) {
					className = classList[i];
	
					if (_.indexOf(invalidClass, className) > -1) {
						continue;
					}
	
					if (classIgnore(className)) {
						continue;
					} // Is this className unique by itself?
	
	
					selector = tagName + '.' + escape(className);
					matches = doc.querySelectorAll(selector);
	
					if (matches.length === 1) {
						return selector;
					} // is nth-child unique?
	
	
					index = positionInNodeList(ele, ele.parentNode.children) + 1;
					selector = selector + ':nth-child(' + index + ')';
					matches = doc.querySelectorAll(selector);
	
					if (matches.length === 1) {
						return selector;
					}
				}
			} // not unique enough, fall back to nth-child and
			// use recursion
	
	
			if (ele.parentNode !== doc) {
				index = positionInNodeList(ele, ele.parentNode.children) + 1;
				selector = findCssSelector(ele.parentNode) + ' > ' + tagName + ':nth-child(' + index + ')';
			}
	
			return selector;
		}
	
		findCssSelector.invalidId = invalidId;
		findCssSelector.invalidClass = invalidClass;
		findCssSelector.positionInNodeList = positionInNodeList;
		findCssSelector.escape = escape;
	
		findCssSelector.setupIdIgnore = function (fn) {
			return idIgnore = fn;
		};
	
		findCssSelector.setupClassIgnore = function (fn) {
			return classIgnore = fn;
		};
	
		if (true) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
				return findCssSelector;
			}).call(exports, __webpack_require__, exports, module),
					__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else {}
	})();
	
	/***/ }),
	/* 12 */
	/***/ (function(module, exports, __webpack_require__) {
	
	"use strict";
	
	
	var _require = __webpack_require__(6),
			getTextSlice = _require.getTextSlice;
	/**
	 * select
	 * 
	 */
	
	
	var CHECKING_ELEMENT_TYPE = /(checkbox|radio)/;
	var INPUT_ELEMENT_TYPE = /(text|password|email|date|datetime|color|number)/;
	
	function isTextBox(element) {
		return element.tagName.toLowerCase() === 'input' && INPUT_ELEMENT_TYPE.test(element.type) || element.tagName.toLowerCase() === 'textarea';
	}
	
	function isCheckbox(element) {
		return element.tagName.toLowerCase() === 'input' && CHECKING_ELEMENT_TYPE.test(element.type);
	}
	
	function isDropdownMenu(element) {
		return element.tagName.toLowerCase() === 'select';
	}
	
	function getElementType(element) {
		return {
			localName: element.tagName.toLowerCase(),
			type: element.tagName.toLowerCase() === 'input' ? element.type : null
		};
	}
	
	function InputActionFactory(_ref, element) {
		var _ref$focus = _ref.focus,
				path = _ref$focus.path,
				abstract = _ref$focus.abstract,
				snapshot = _ref.snapshot;
		return {
			type: 'input',
			data: {
				path: path,
				abstract: abstract,
				snapshot: snapshot,
				value: element.value,
				text: getTextSlice(element),
				element: getElementType(element)
			}
		};
	}
	
	function ClickActionFactory(_ref2, element) {
		var _ref2$target = _ref2.target,
				path = _ref2$target.path,
				abstract = _ref2$target.abstract,
				snapshot = _ref2.snapshot;
		var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'click';
		return {
			type: type,
			data: {
				path: path,
				abstract: abstract,
				snapshot: snapshot,
				text: getTextSlice(element),
				element: getElementType(element)
			}
		};
	}
	
	function CheckingActionFactory(_ref3, element) {
		var _ref3$target = _ref3.target,
				path = _ref3$target.path,
				abstract = _ref3$target.abstract,
				snapshot = _ref3.snapshot;
		return {
			type: element.checked ? 'check' : 'uncheck',
			data: {
				path: path,
				abstract: abstract,
				snapshot: snapshot,
				value: element.value,
				text: getTextSlice(element),
				element: getElementType(element)
			}
		};
	}
	
	function SelectionActionFactory(_ref4, element) {
		var _ref4$focus = _ref4.focus,
				path = _ref4$focus.path,
				abstract = _ref4$focus.abstract,
				snapshot = _ref4.snapshot;
		var selectedIndex = element.selectedIndex,
				value = element.value;
		var option = element.options[selectedIndex];
		return {
			type: 'select',
			data: {
				path: path,
				abstract: abstract,
				value: value,
				snapshot: snapshot,
				text: getTextSlice(element),
				selectedIndex: selectedIndex,
				label: getTextSlice(option),
				element: getElementType(element)
			}
		};
	}
	
	function EnterFactory(_ref5) {
		var location = _ref5.location,
				referrer = _ref5.referrer,
				title = _ref5.title,
				snapshot = _ref5.snapshot;
		return {
			type: 'enter',
			data: {
				href: location.href,
				referrer: referrer,
				title: title,
				snapshot: snapshot
			}
		};
	}
	
	var translatorMapping = {
		click: function click(data, node) {
			if (isCheckbox(node.target)) {
				return this.change(data, node);
			}
	
			return ClickActionFactory(data, node.target);
		},
		rightClick: function rightClick(data, node) {
			return ClickActionFactory(data, node.target, 'rightClick');
		},
		doubleClick: function doubleClick(data, node) {
			return ClickActionFactory(data, node.target, 'doubleClick');
		},
		change: function change(data, node) {
			if (isTextBox(node.focus)) {
				return InputActionFactory(data, node.focus);
			}
	
			if (isCheckbox(node.target)) {
				return CheckingActionFactory(data, node.target);
			}
	
			if (isDropdownMenu(node.focus)) {
				return SelectionActionFactory(data, node.focus);
			}
		},
		enter: function enter(data) {
			return EnterFactory(data);
		}
	};
	
	function getDetail(action) {
		for (var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			data[_key - 1] = arguments[_key];
		}
	
		return translatorMapping[action].apply(translatorMapping, data);
	}
	
	exports.getDetail = getDetail;
	
	/***/ })
	/******/ ]);