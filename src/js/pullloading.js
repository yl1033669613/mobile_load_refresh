;
(function(win, undefined) {
    "use strict"

    // 对象合并
    function extend(o, n, override) {
        for (var key in n) {
            if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
                o[key] = n[key];
            }
        }
        return o;
    };

    // 判断是否为dom实例
    function isDOMElement(obj) {
        return !!(obj && typeof win !== 'undefined' && (obj === win || obj.nodeType));
    };

    //判断dom元素是HTML或者是BODY
    function testHTMLOrBODY(ele) {
        var regex = /HTML|BODY/;
        return regex.test(ele.tagName);
    };

    function PullLoading(opt) {
        this._init(opt);
    };

    PullLoading.prototype = {
        constructor: this,
        // 初始化函数
        _init: function(opt) {
            var defOpt = {
                scrollEle: null, //可滚动元素 下拉刷新上拉加载容器 不能是HTML或者BODY节点
                scrollEleHeight: '300px', //string css 样式值  可以是50% 50vh 50px .5rem   必须
                refreshEl: null, //下拉刷新loading Dom
                pullUpBefore: null, //加载前
                pullUpIn: null, //加载中
                pullUpEnd: null, //加载完所有数据
                pullDown: null, //刷新完毕回调 cb
                pullUp: null //加载完毕回调 cb
            };

            this.dte = 100;
            this.isPullUp = false;
            this.isPullDown = false;
            this.pullUpLoading = false;
            this.pullDownLoading = false;
            this.isPullUpEnd = false;
            this.currY = 0;
            this.option = extend(defOpt, opt, true);

            if (this._checkOption()) {
                //设置容器必须css
                this._css(this.option.scrollEle, { overflow: 'scroll', webkitOverflowScrolling: 'touch', height: this.option.scrollEleHeight });

                if (this.isPullUp) {
                    this._show(this.option.pullUpBefore);
                    this._hide(this.option.pullUpIn);
                    this._hide(this.option.pullUpEnd);
                };
                if (this.isPullDown) {
                    this._css(this.option.refreshEl, { transition: 'transform .1s' });
                };
                this._scrollHandle();
                this._touchHandle();
            }
        },
        // 验证参数
        _checkOption: function() {
            if (!isDOMElement(this.option.scrollEle)) {
                throw new Error('scrollEle不存在或者不是一个可操作的dom实例');
            } else if (testHTMLOrBODY(this.option.scrollEle)) {
                throw new Error('scrollEle不能是HTML或者BODY节点');
            };
            if ((typeof this.option.pullDown !== 'function') && (typeof this.option.pullUp !== 'function')) {
                return false;
            };
            if (typeof this.option.pullDown === 'function') {
                if (!isDOMElement(this.option.refreshEl)) {
                    throw new Error('refreshEl不存在或者不是一个可操作的dom实例');
                };
                this.isPullDown = true;
            };
            if (typeof this.option.pullUp === 'function') {
                if (!isDOMElement(this.option.pullUpBefore)) {
                    throw new Error('pullUpBefore不存在或者不是一个可操作的dom实例');
                };
                if (!isDOMElement(this.option.pullUpIn)) {
                    throw new Error('pullUpIn不存在或者不是一个可操作的dom实例');
                };
                if (!isDOMElement(this.option.pullUpEnd)) {
                    throw new Error('pullUpEnd不存在或者不是一个可操作的dom实例');
                };
                this.isPullUp = true;
            };
            return true;
        },
        _touchHandle: function() {
            var self = this,
                pullDownY = 0,
                refreshLoadingEleHeight = 0;
            if (self.isPullDown) {
                refreshLoadingEleHeight = self.option.refreshEl.offsetHeight;
            };

            self.option.scrollEle.addEventListener('touchstart', function(e){
                self.currY = e.changedTouches[0].clientY;
            });

            self.option.scrollEle.addEventListener('touchmove', function(e) {
                if (self._getScrollTop() == 0) { //当向上滚动的高度=0，或者说滚动位置处在最顶部 scrollTop = 0
                    if (self._getScrollHeight() == self._getClientHeight() && e.changedTouches[0].clientY - self.currY < 0) { //可滚动容器没有滚动条 并且为向上划时
                        e.preventDefault(); //没有滚动条的情况继续向上划动阻止页面默认行为
                        if (e.changedTouches[0].clientY - self.currY < -self.dte) {
                            self._pullUp();
                        }
                    };
                    if (e.changedTouches[0].clientY - self.currY > 0 && self.isPullDown && !self.pullUpLoading) { //下拉的判断方向为由上往下 并且存在下拉刷新回调函数 且不在上拉加载当中时
                        e.preventDefault(); //滚动到顶部时继续下拉阻止浏览器默认行为
                        if (e.changedTouches[0].clientY - self.currY < self.dte && !self.pullDownLoading) { //下拉刷新loading提示动作区间
                            var downDts = e.changedTouches[0].clientY - pullDownY - self.currY;
                            pullDownY = pullDownY + downDts;
                            var _pullDownY = pullDownY / (self.dte / refreshLoadingEleHeight);
                            if (_pullDownY > refreshLoadingEleHeight) {
                                _pullDownY = refreshLoadingEleHeight
                            };
                            self._css(self.option.refreshEl, { transition: 'transform 0s', transform: 'translate(0, ' + _pullDownY + 'px)' }); //设置loading提示dom位置使其跟随拖动有一个下拉的动作
                        };
                        if (e.changedTouches[0].clientY - self.currY > self.dte) { //下拉到指定阈值 默认100像素 触发下拉刷新回调
                            self._css(self.option.refreshEl, { transform: 'translate(0, ' + refreshLoadingEleHeight + 'px)' });
                            self._pullDown();
                        }
                    }
                }
            });

            self.option.scrollEle.addEventListener('touchend', function(e) {
                if (self._getScrollTop() == 0) {
                    if (e.changedTouches[0].clientY - self.currY > 0 && e.changedTouches[0].clientY - self.currY < self.dte) { //下拉未拖动到阈值时恢复loading dom位置
                        self._css(self.option.refreshEl, { transition: 'transform .2s', transform: 'translate(0, 0)' });
                    }
                }
            })
        },
        //当存在滚动条时，上拉加载以滚动到底部为触发条件
        _scrollHandle: function() {
            var self = this;
            self.option.scrollEle.addEventListener('scroll', function(e) {
                if (self._getScrollTop() + self._getClientHeight() == self._getScrollHeight()) {
                    self._pullUp();
                }
            })
        },
        _pullUp: function() {
            if (this.isPullUp && !this.pullUpLoading && !this.isPullUpEnd && !this.pullDownLoading) {
                this.pullUpLoading = true;
                this._hide(this.option.pullUpBefore);
                this._show(this.option.pullUpIn);
                this.option.pullUp && this.option.pullUp(this);
            }
        },
        _pullDown: function() {
            if (this.isPullDown && !this.pullDownLoading) {
                this.pullDownLoading = true;
                this.option.pullDown && this.option.pullDown(this);
            }
        },
        //滚动区域向卷起的高度
        _getScrollTop: function() {
            return this.option.scrollEle.scrollTop;
        },
        //滚动区域可视高度
        _getClientHeight: function() {
            return this.option.scrollEle.clientHeight;
        },
        //滚动区域总高度
        _getScrollHeight: function() {
            return this.option.scrollEle.scrollHeight;
        },
        _hide: function(ele) {
            ele.style.display = 'none';
        },
        _show: function(ele) {
            ele.style.display = 'block';
        },
        //css
        _css: function(dom, styleObj) {
            for (var prop in styleObj) {
                var attr = prop.replace(/[A-Z]/g, function(word) {
                    return '-' + word.toLowerCase();
                });
                if (attr.indexOf('webkit') != -1) {
                    attr = '-' + attr;
                };
                dom.style[attr] = styleObj[prop];
            }
        },
        //停止上拉加载或者下拉刷新动作 每次结束必须调用该方法
        stopPull: function() {
            if (!this.isPullUpEnd && this.isPullUp) {
                this._show(this.option.pullUpBefore);
                this._hide(this.option.pullUpIn);
            };
            if (this.isPullDown) {
                this._css(this.option.refreshEl, { transition: 'transform .2s', transform: 'translate(0, 0)' });
            }
            this.pullUpLoading = false;
            this.pullDownLoading = false;
        },
        //设置上拉加载完所有数据时显示提示信息
        pullUpEnd: function(bool) {
            if (!this.isPullUp) return;
            this.isPullUpEnd = bool;
            if (bool) {
                this._show(this.option.pullUpEnd);
                this._hide(this.option.pullUpIn);
                this._hide(this.option.pullUpBefore);
            } else {
                this._show(this.option.pullUpBefore);
                this._hide(this.option.pullUpIn);
                this._hide(this.option.pullUpEnd);
            }
        }
    };

    !('PullLoading' in win) && (win.PullLoading = PullLoading);
}(window))
