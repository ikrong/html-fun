!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=143)}({143:function(e,t,n){"use strict";n.r(t);n(144);var r=[1,0,2,4],o=document.querySelector("canvas"),i=o.getContext("2d");o.height=window.innerHeight,o.width=window.innerWidth;for(var u=[],l=[],f=o.width/14,a=0;a<f;a++)u[a]=1,l[a]=0;setInterval((function(){i.fillStyle="rgba(0, 0, 0, 0.1)",i.fillRect(0,0,o.width,o.height),i.fillStyle="green",i.font="".concat(14,"px Verdana");for(var e=0;e<f;e++)i.fillText(r[l[e]],14*e,14*u[e]),l[e]++,l[e]>r.length-1&&(l[e]=0),14*u[e]>2*o.height/3&&Math.random()>.9&&(u[e]=0),u[e]++}),50)},144:function(e,t,n){}});