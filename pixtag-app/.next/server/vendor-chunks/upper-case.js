"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/upper-case";
exports.ids = ["vendor-chunks/upper-case"];
exports.modules = {

/***/ "(ssr)/./node_modules/upper-case/dist.es2015/index.js":
/*!******************************************************!*\
  !*** ./node_modules/upper-case/dist.es2015/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   localeUpperCase: () => (/* binding */ localeUpperCase),\n/* harmony export */   upperCase: () => (/* binding */ upperCase)\n/* harmony export */ });\n/**\n * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt\n */\nvar SUPPORTED_LOCALE = {\n    tr: {\n        regexp: /[\\u0069]/g,\n        map: {\n            i: \"\\u0130\",\n        },\n    },\n    az: {\n        regexp: /[\\u0069]/g,\n        map: {\n            i: \"\\u0130\",\n        },\n    },\n    lt: {\n        regexp: /[\\u0069\\u006A\\u012F]\\u0307|\\u0069\\u0307[\\u0300\\u0301\\u0303]/g,\n        map: {\n            i̇: \"\\u0049\",\n            j̇: \"\\u004A\",\n            į̇: \"\\u012E\",\n            i̇̀: \"\\u00CC\",\n            i̇́: \"\\u00CD\",\n            i̇̃: \"\\u0128\",\n        },\n    },\n};\n/**\n * Localized upper case.\n */\nfunction localeUpperCase(str, locale) {\n    var lang = SUPPORTED_LOCALE[locale.toLowerCase()];\n    if (lang)\n        return upperCase(str.replace(lang.regexp, function (m) { return lang.map[m]; }));\n    return upperCase(str);\n}\n/**\n * Upper case as a function.\n */\nfunction upperCase(str) {\n    return str.toUpperCase();\n}\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdXBwZXItY2FzZS9kaXN0LmVzMjAxNS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0EsaUVBQWlFLHFCQUFxQjtBQUN0RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9waXh0YWctYXBwLy4vbm9kZV9tb2R1bGVzL3VwcGVyLWNhc2UvZGlzdC5lczIwMTUvaW5kZXguanM/OWU2MCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFNvdXJjZTogZnRwOi8vZnRwLnVuaWNvZGUub3JnL1B1YmxpYy9VQ0QvbGF0ZXN0L3VjZC9TcGVjaWFsQ2FzaW5nLnR4dFxuICovXG52YXIgU1VQUE9SVEVEX0xPQ0FMRSA9IHtcbiAgICB0cjoge1xuICAgICAgICByZWdleHA6IC9bXFx1MDA2OV0vZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgICBpOiBcIlxcdTAxMzBcIixcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIGF6OiB7XG4gICAgICAgIHJlZ2V4cDogL1tcXHUwMDY5XS9nLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAgIGk6IFwiXFx1MDEzMFwiLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgbHQ6IHtcbiAgICAgICAgcmVnZXhwOiAvW1xcdTAwNjlcXHUwMDZBXFx1MDEyRl1cXHUwMzA3fFxcdTAwNjlcXHUwMzA3W1xcdTAzMDBcXHUwMzAxXFx1MDMwM10vZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgICBpzIc6IFwiXFx1MDA0OVwiLFxuICAgICAgICAgICAgasyHOiBcIlxcdTAwNEFcIixcbiAgICAgICAgICAgIMSvzIc6IFwiXFx1MDEyRVwiLFxuICAgICAgICAgICAgacyHzIA6IFwiXFx1MDBDQ1wiLFxuICAgICAgICAgICAgacyHzIE6IFwiXFx1MDBDRFwiLFxuICAgICAgICAgICAgacyHzIM6IFwiXFx1MDEyOFwiLFxuICAgICAgICB9LFxuICAgIH0sXG59O1xuLyoqXG4gKiBMb2NhbGl6ZWQgdXBwZXIgY2FzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvY2FsZVVwcGVyQ2FzZShzdHIsIGxvY2FsZSkge1xuICAgIHZhciBsYW5nID0gU1VQUE9SVEVEX0xPQ0FMRVtsb2NhbGUudG9Mb3dlckNhc2UoKV07XG4gICAgaWYgKGxhbmcpXG4gICAgICAgIHJldHVybiB1cHBlckNhc2Uoc3RyLnJlcGxhY2UobGFuZy5yZWdleHAsIGZ1bmN0aW9uIChtKSB7IHJldHVybiBsYW5nLm1hcFttXTsgfSkpO1xuICAgIHJldHVybiB1cHBlckNhc2Uoc3RyKTtcbn1cbi8qKlxuICogVXBwZXIgY2FzZSBhcyBhIGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBwZXJDYXNlKHN0cikge1xuICAgIHJldHVybiBzdHIudG9VcHBlckNhc2UoKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/upper-case/dist.es2015/index.js\n");

/***/ })

};
;