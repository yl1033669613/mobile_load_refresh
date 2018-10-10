!function(o,t){"use strict";function l(t){return!(!t||void 0===o||t!==o&&!t.nodeType)}function i(t){this._init(t)}i.prototype={constructor:this,_init:function(t){this.dte=100,this.isPullUp=!1,this.isPullDown=!1,this.pullUpLoading=!1,this.pullDownLoading=!1,this.isPullUpEnd=!1,this.currY=0,this.option=function(t,o,l){for(var i in o)!o.hasOwnProperty(i)||t.hasOwnProperty(i)&&!l||(t[i]=o[i]);return t}({scrollEle:null,refreshEl:null,pullUpBefore:null,pullUpIn:null,pullUpEnd:null,pullDown:null,pullUp:null},t,!0),this._checkOption()&&(this.isPullUp&&(this._show(this.option.pullUpBefore),this._hide(this.option.pullUpIn),this._hide(this.option.pullUpEnd)),this.isPullDown&&this._css(this.option.refreshEl,{transition:"transform .1s"}),this._scrollHandle(),this._touchHandle())},_checkOption:function(){if(!l(this.option.scrollEle))throw new Error("scrollEle不存在或者不是一个可操作的dom实例");if(t=this.option.scrollEle,/HTML|BODY/.test(t.tagName))throw new Error("scrollEle不能是HTML或者BODY节点");var t;if("function"!=typeof this.option.pullDown&&"function"!=typeof this.option.pullUp)return!1;if("function"==typeof this.option.pullDown){if(!l(this.option.refreshEl))throw new Error("refreshEl不存在或者不是一个可操作的dom实例");this.isPullDown=!0}if("function"==typeof this.option.pullUp){if(!l(this.option.pullUpBefore))throw new Error("pullUpBefore不存在或者不是一个可操作的dom实例");if(!l(this.option.pullUpIn))throw new Error("pullUpIn不存在或者不是一个可操作的dom实例");if(!l(this.option.pullUpEnd))throw new Error("pullUpEnd不存在或者不是一个可操作的dom实例");this.isPullUp=!0}return!0},_touchHandle:function(){var i=this,n=0,s=0;i.isPullDown&&(s=i.option.refreshEl.offsetHeight),i.option.scrollEle.ontouchstart=function(t){i.currY=t.changedTouches[0].clientY},i.option.scrollEle.ontouchmove=function(t){if(0==i._getScrollTop()&&(i._getScrollHeight()==i._getClientHeight()&&t.changedTouches[0].clientY-i.currY<0&&(t.preventDefault(),t.changedTouches[0].clientY-i.currY<-i.dte&&i._pullUp()),0<t.changedTouches[0].clientY-i.currY&&i.isPullDown&&!i.pullUpLoading)){if(t.preventDefault(),t.changedTouches[0].clientY-i.currY<i.dte&&!i.pullDownLoading){var o=t.changedTouches[0].clientY-n-i.currY,l=(n+=o)/(i.dte/s);s<l&&(l=s),i._css(i.option.refreshEl,{transition:"transform .1s",transform:"translate(0, "+l+"px)"})}t.changedTouches[0].clientY-i.currY>i.dte&&(i._css(i.option.refreshEl,{transform:"translate(0, "+s+"px)"}),i._pullDown())}},i.option.scrollEle.ontouchend=function(t){0==i._getScrollTop()&&0<t.changedTouches[0].clientY-i.currY&&t.changedTouches[0].clientY-i.currY<i.dte&&i._css(i.option.refreshEl,{transition:"transform .2s",transform:"translate(0, 0)"})}},_scrollHandle:function(){var o=this;o.option.scrollEle.onscroll=function(t){o._getScrollTop()+o._getClientHeight()==o._getScrollHeight()&&o._pullUp()}},_pullUp:function(){!this.isPullUp||this.pullUpLoading||this.isPullUpEnd||this.pullDownLoading||(this.pullUpLoading=!0,this._hide(this.option.pullUpBefore),this._show(this.option.pullUpIn),this.option.pullUp&&this.option.pullUp(this))},_pullDown:function(){this.isPullDown&&!this.pullDownLoading&&(this.pullDownLoading=!0,this.option.pullDown&&this.option.pullDown(this))},_getScrollTop:function(){return this.option.scrollEle.scrollTop},_getClientHeight:function(){return this.option.scrollEle.clientHeight},_getScrollHeight:function(){return this.option.scrollEle.scrollHeight},_hide:function(t){t.style.display="none"},_show:function(t){t.style.display="block"},_css:function(t,o){for(var l in o){var i=l.replace(/[A-Z]/g,function(t){return"-"+t.toLowerCase()});t.style[i]=o[l]}},stopPull:function(){!this.isPullUpEnd&&this.isPullUp&&(this._show(this.option.pullUpBefore),this._hide(this.option.pullUpIn)),this.isPullDown&&this._css(this.option.refreshEl,{transition:"transform .2s",transform:"translate(0, 0)"}),this.pullUpLoading=!1,this.pullDownLoading=!1},pullUpEnd:function(t){this.isPullUp&&((this.isPullUpEnd=t)?(this._show(this.option.pullUpEnd),this._hide(this.option.pullUpIn),this._hide(this.option.pullUpBefore)):(this._show(this.option.pullUpBefore),this._hide(this.option.pullUpIn),this._hide(this.option.pullUpEnd)))}},!("PullLoading"in o)&&(o.PullLoading=i)}(window);