;
(function(win, undefined) {
    "use strict"
    // 对象合并
    function _extend(o, n, override) {
        for (var key in n) {
            if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
                o[key] = n[key]
            }
        }
        return o
    };
    // 判断是否为dom实例
    function _isDOMElement(obj) {
        return !!(obj && typeof win !== 'undefined' && (obj === win || obj.nodeType))
    };
    //判断dom元素是HTML或者是BODY
    function _testHTMLOrBODY(ele) {
        var regex = /HTML|BODY/;
        return regex.test(ele.tagName)
    };
    //获取并返回dom实例
    function _getDomInstanceByClass(classStr) {
        return win.document.querySelector(classStr)
    };
    //隐藏
    function _hide(ele) {
        ele.style.display = 'none'
    };
    //显示
    function _show(ele) {
        ele.style.display = 'block'
    };
    //css
    function _css(dom, styleObj) {
        for (var prop in styleObj) {
            var attr = prop.replace(/[A-Z]/g, function(word) {
                return '-' + word.toLowerCase();
            });
            if (attr.indexOf('webkit') != -1) {
                attr = '-' + attr;
            };
            dom.style[attr] = styleObj[prop]
        }
    };
    //滚动区域向上卷起的高度
    function _getScrollTop(ele) {
        return ele.scrollTop
    };
    //滚动区域总高度
    function _getScrollHeight(ele) {
        return ele.scrollHeight
    };

    function PullLoading(opt) {
        this._init(opt)
    };
    PullLoading.prototype = {
        constructor: PullLoading,
        _init: function(opt) { // 初始化函数
            var defOpt = {
                container: '',
                pullDown: null, //刷新完毕回调 cb
                pullUp: null //加载完毕回调 cb
            };
            this.dte = 80;

            this.scrollEle = null;
            this.refreshEl = null;
            this.pullUpBeforeEl = null;
            this.pullUpInEl = null;
            this.pullUpEndEl = null;

            this.isPullUp = false;
            this.isPullDown = false;
            this.pullUpLoading = false;
            this.pullDownLoading = false;
            this.isPullUpEnd = false;

            this.currY = 0;
            this.startY = 0;
            this.pullDownY = 0;

            this.contClientHeight = 0;
            this.option = _extend(defOpt, opt, true);
            if (this._checkOption()) {
                _css(this.scrollEle, { overflow: 'scroll', webkitOverflowScrolling: 'touch' }); //设置容器必须css
                this.contClientHeight = this.scrollEle.clientHeight; //滚动区域可视高度
                //判断上拉下拉
                if (this.isPullUp) {
                    _show(this.pullUpBeforeEl);
                    _hide(this.pullUpInEl);
                    _hide(this.pullUpInEl)
                };
                if (this.isPullDown) {
                    this.refreshLoadingEleHeight = this.refreshEl.offsetHeight;
                    _css(this.refreshEl, { transition: 'transform .1s', top: -this.refreshLoadingEleHeight + 'px' });
                };
                //初始化事件
                this._initEvent()
            }
        },
        _checkOption: function() { // 验证参数
            var opts = this.option;
            this.scrollEle = _getDomInstanceByClass(opts.container);
            if (!_isDOMElement(this.scrollEle)) {
                throw new Error(opts.container + '实例未找到')
            } else if (_testHTMLOrBODY(this.scrollEle)) {
                throw new Error(opts.container + '不能是HTML或者BODY节点')
            };
            if ((typeof opts.pullDown !== 'function') && (typeof opts.pullUp !== 'function')) {
                return false
            };
            if (typeof opts.pullDown === 'function') {
                this.refreshEl = _getDomInstanceByClass(opts.container + ' .pl-down');
                if (!_isDOMElement(this.refreshEl)) {
                    throw new Error('请添加下拉刷新loading')
                };
                this.isPullDown = true
            };
            if (typeof opts.pullUp === 'function') {
                this.pullUpBeforeEl = _getDomInstanceByClass(opts.container + ' .pl-up-before');
                this.pullUpInEl = _getDomInstanceByClass(opts.container + ' .pl-up-in');
                this.pullUpEndEl = _getDomInstanceByClass(opts.container + ' .pl-up-end');
                if (!_isDOMElement(this.pullUpBeforeEl)) {
                    throw new Error('请添加上拉加载前提示')
                };
                if (!_isDOMElement(this.pullUpInEl)) {
                    throw new Error('请添加上拉加载中提示')
                };
                if (!_isDOMElement(this.pullUpEndEl)) {
                    throw new Error('请添加上拉加载已加载全部内容提示')
                };
                this.isPullUp = true
            };
            return true
        },
        _initEvent: function() {
            this.scrollEle.addEventListener('touchstart', this._touchstartHandle.bind(this));
            this.scrollEle.addEventListener('touchmove', this._touchmoveHandle.bind(this));
            this.scrollEle.addEventListener('touchend', this._touchendHandle.bind(this));
            this.scrollEle.addEventListener('scroll', this._scrollHandle.bind(this))
        },
        _touchstartHandle: function(e) {
            this.startY = e.changedTouches[0].clientY;
            this.currY = e.changedTouches[0].clientY;
            this.pullDownY = 0
        },
        _touchmoveHandle: function(e) {
            var touches = e.changedTouches[0];
            if (_getScrollTop(this.scrollEle) == 0) { //当向上滚动的高度=0，或者说滚动位置处在最顶部 scrollTop = 0
                if (_getScrollHeight(this.scrollEle) <= this.contClientHeight && this.isPullUp && touches.clientY - this.startY < 0) { //可滚动容器没有滚动条 阻止默认行为
                    e.preventDefault()
                };
                if (this.isPullDown && touches.clientY - this.startY >= 0 && !this.pullUpLoading && !this.pullDownLoading) { //下拉的判断方向为由上往下 并且存在下拉刷新回调函数 且不在上拉加载当中时
                    e.preventDefault(); //滚动到顶部时继续下拉阻止浏览器默认行为
                    this.pullDownY = touches.clientY - this.currY + this.pullDownY;
                    this.currY = touches.clientY;
                    var _pullDownY = this.pullDownY / (this.dte / this.refreshLoadingEleHeight);
                    if (_pullDownY >= this.refreshLoadingEleHeight) {
                        _pullDownY = this.refreshLoadingEleHeight
                    };
                    _css(this.refreshEl, { transition: 'transform 0s', transform: 'translate(0, ' + _pullDownY + 'px)' }) //设置loading提示dom位置使其跟随拖动有一个下拉的动作
                }
            }
        },
        _touchendHandle: function(e) {
            if (this.pullUpLoading || this.pullDownLoading) return;
            var touches = e.changedTouches[0];
            if (_getScrollTop(this.scrollEle) == 0) {
                if (touches.clientY - this.startY >= 0) {
                    if (touches.clientY - this.startY >= this.dte) {
                        _css(this.refreshEl, { transform: 'translate(0, ' + this.refreshLoadingEleHeight + 'px)' });
                        this._pullDown()
                    } else { //下拉未拖动到阈值时恢复loading位置
                        _css(this.refreshEl, { transition: 'transform .2s', transform: 'translate(0, 0)' })
                    }
                } else {
                    if (_getScrollHeight(this.scrollEle) <= this.contClientHeight && touches.clientY - this.startY <= -this.dte) {
                        this._pullUp()
                    }
                }
            }
        },
        _scrollHandle: function(e) { //当存在滚动条时，上拉加载以滚动到底部为触发条件
            if (_getScrollTop(this.scrollEle) + this.contClientHeight == _getScrollHeight(this.scrollEle)) {
                this._pullUp()
            }
        },
        _pullUp: function() {
            if (this.isPullUp && !this.isPullUpEnd && !this.pullDownLoading && !this.pullUpLoading) {
                this.pullUpLoading = true;
                _hide(this.pullUpBeforeEl);
                _show(this.pullUpInEl);
                this.option.pullUp && this.option.pullUp(this)
            }
        },
        _pullDown: function() {
            if (this.isPullDown && !this.pullDownLoading && !this.pullUpLoading) {
                this.pullDownLoading = true;
                this.pullUpEnd(false);
                this.option.pullDown && this.option.pullDown(this)
            }
        },
        stopPull: function() { //停止上拉加载或者下拉刷新动作 每次结束必须调用该方法
            if (!this.isPullUpEnd && this.isPullUp) {
                _show(this.pullUpBeforeEl);
                _hide(this.pullUpInEl)
            };
            if (this.isPullDown) {
                _css(this.refreshEl, { transition: 'transform .2s', transform: 'translate(0, 0)' })
            };
            this.pullUpLoading = false;
            this.pullDownLoading = false
        },
        pullUpEnd: function(bool) { //设置上拉加载完所有数据时显示提示信息
            if (!this.isPullUp) return;
            this.isPullUpEnd = bool;
            if (bool) {
                _show(this.pullUpEndEl);
                _hide(this.pullUpInEl);
                _hide(this.pullUpBeforeEl)
            } else {
                _show(this.pullUpBeforeEl);
                _hide(this.pullUpInEl);
                _hide(this.pullUpEndEl)
            }
        }
    };
    !('PullLoading' in win) && (win.PullLoading = PullLoading)
}(window))
