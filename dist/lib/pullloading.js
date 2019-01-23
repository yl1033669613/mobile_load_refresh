;
(function(win, undefined) {
    "use strict"
    var PULLWRAPPER = ' .pl-wrapper',
        PULLDOWN = ' .pl-down',
        PULLUPBEFORE = ' .pl-up-before',
        PULLUPIN = ' .pl-up-in',
        PULLUPEND = ' .pl-up-end';
    var CSSTSF = '',
        CSSTSI = '';

    function _getCssCpe() { //获取系统css transform, transition兼容写法由于在移动端 只需要考虑webkit
        var transform = '',
            transition = '',
            divStyle = document.createElement('div').style,
            transformArr = ['transform', 'webkitTransform'],
            transitionArr = ['transition', 'webkitTransition'],
            i = 0,
            len = transformArr.length;
        for (; i < len; i++) {
            if (transformArr[i] in divStyle && !transform) {
                transform = transformArr[i];
            };
            if (transitionArr[i] in divStyle && !transition) {
                transition = transitionArr[i];
            }
        };
        return {
            transform: transform,
            transition: transition
        }
    };
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
        ele.style.display = 'none';
        return ele
    };
    //显示
    function _show(ele) {
        ele.style.display = 'block';
        return ele
    };
    //set css
    function _setCss(ele, styleObj) {
        for (var prop in styleObj) {
            ele.style[prop] = styleObj[prop]
        };
        return ele
    };

    function PullLoading(opt) {
        this._init(opt)
    };
    PullLoading.prototype = {
        constructor: PullLoading,
        _init: function(opt) { // 初始化函数
            var defaultOption = {
                threshold: 80,
                container: '',
                pullDown: null,
                pullUp: null
            };

            this.containerEle = null;
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
            this.option = _extend(defaultOption, opt, true);

            if (this._checkOption()) {
                _setCss(this.containerEle, { overflow: 'hidden' });
                _setCss(this.scrollEle, { overflow: 'scroll', webkitOverflowScrolling: 'touch' });
                this.contClientHeight = this.scrollEle.clientHeight; //保存滚动区域可视高度
                if (this.isPullUp) { //判断存在上拉 并初始化视图
                    _show(this.pullUpBeforeEl);
                    _hide(this.pullUpInEl);
                    _hide(this.pullUpInEl)
                };
                if (this.isPullDown) { //判断存在下拉 并初始化视图
                    _show(this.refreshEl);
                    this.refreshLoadingEleHeight = this.refreshEl.offsetHeight;
                    var obj = {
                        top: -this.refreshLoadingEleHeight + 'px'
                    };
                    obj[CSSTSI] = 'transform .1s';
                    _setCss(this.refreshEl, obj)
                };
                //初始化事件
                this._initEvent()
            }
        },
        _checkOption: function() { // 验证
            var opts = this.option,
                cssCpe = _getCssCpe();
            CSSTSF = cssCpe.transform;
            CSSTSI = cssCpe.transition;
            try {
                if (!CSSTSF || !CSSTSI) throw new Error('浏览器不支持本插件');
                this.containerEle = _getDomInstanceByClass(opts.container);
                if (!_isDOMElement(this.containerEle)) {
                    throw new Error(opts.container + ' 实例未找到')
                } else if (_testHTMLOrBODY(this.containerEle)) {
                    throw new Error(opts.container + ' 不能是HTML或者BODY节点')
                } else {
                    this.scrollEle = _getDomInstanceByClass(this.option.container + PULLWRAPPER)
                };
                if ((typeof opts.pullDown !== 'function') && (typeof opts.pullUp !== 'function')) return false;
                if (typeof opts.pullDown === 'function') {
                    this.refreshEl = _getDomInstanceByClass(opts.container + PULLDOWN);
                    if (!_isDOMElement(this.refreshEl)) throw new Error('请添加下拉刷新loading');
                    this.isPullDown = true
                };
                if (typeof opts.pullUp === 'function') {
                    this.pullUpBeforeEl = _getDomInstanceByClass(opts.container + PULLUPBEFORE);
                    this.pullUpInEl = _getDomInstanceByClass(opts.container + PULLUPIN);
                    this.pullUpEndEl = _getDomInstanceByClass(opts.container + PULLUPEND);
                    if (!_isDOMElement(this.pullUpBeforeEl)) throw new Error('请添加上拉加载前提示');
                    if (!_isDOMElement(this.pullUpInEl)) throw new Error('请添加上拉加载中提示');
                    if (!_isDOMElement(this.pullUpEndEl)) throw new Error('请添加上拉加载已加载全部内容提示');
                    this.isPullUp = true
                };
            } catch (e) {
                console.error(e)
                return false
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
            this.startY = this.currY = e.changedTouches[0].clientY;
            this.pullDownY = 0
        },
        _touchmoveHandle: function(e) {
            var touchesY = e.changedTouches[0].clientY;
            if (this.scrollEle.scrollTop == 0) { //当向上滚动的高度=0，或者说滚动位置处在最顶部 scrollTop = 0
                if (this.isPullUp && this.scrollEle.scrollHeight <= this.contClientHeight && touchesY - this.startY < 0) { //可滚动容器没有滚动条 并且向上拉时 阻止默认行为
                    e.preventDefault()
                };
                if (this.isPullDown && touchesY - this.startY >= 0 && !this.pullUpLoading && !this.pullDownLoading) { //下拉的判断方向为由上往下 并且存在下拉刷新回调函数 且不在上拉加载当中时
                    e.preventDefault();
                    this.pullDownY = touchesY - this.currY + this.pullDownY;
                    this.currY = touchesY;
                    var _pullDownY = this.pullDownY / (this.option.threshold / this.refreshLoadingEleHeight);
                    if (_pullDownY >= this.refreshLoadingEleHeight) {
                        _pullDownY = this.refreshLoadingEleHeight
                    };
                    var obj = {};
                    obj[CSSTSI] = 'transform 0s';
                    obj[CSSTSF] = 'translate(0, ' + _pullDownY + 'px)';
                    _setCss(this.refreshEl, obj)
                }
            }
        },
        _touchendHandle: function(e) {
            if (this.pullUpLoading || this.pullDownLoading) return;
            var touchesY = e.changedTouches[0].clientY;
            if (this.scrollEle.scrollTop == 0) {
                if (this.isPullDown) {
                    if (touchesY - this.startY >= this.option.threshold) {
                        var obj = {};
                        obj[CSSTSF] = 'translate(0, ' + this.refreshLoadingEleHeight + 'px)';
                        _setCss(this.refreshEl, obj);
                        this._pullDown()
                    } else { //下拉未拖动到阈值时恢复loading位置
                        var obj = {};
                        obj[CSSTSI] = 'transform .2s';
                        obj[CSSTSF] = 'translate(0, 0)';
                        _setCss(this.refreshEl, obj)
                    }
                };
                if (this.isPullUp) {
                    if (this.scrollEle.scrollHeight <= this.contClientHeight && touchesY - this.startY <= -this.option.threshold) {
                        this._pullUp()
                    }
                }
            }
        },
        _scrollHandle: function(e) { //当存在滚动条时，上拉加载以滚动到底部为触发条件
            if (this.isPullUp && this.scrollEle.scrollTop + this.contClientHeight == this.scrollEle.scrollHeight) {
                this._pullUp()
            }
        },
        _pullUp: function() {
            if (!this.isPullUpEnd && !this.pullDownLoading && !this.pullUpLoading) {
                this.pullUpLoading = true;
                _hide(this.pullUpBeforeEl);
                _show(this.pullUpInEl);
                this.option.pullUp && this.option.pullUp(this)
            }
        },
        _pullDown: function() {
            if (!this.pullDownLoading && !this.pullUpLoading) {
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
                var obj = {};
                obj[CSSTSI] = 'transform .2s';
                obj[CSSTSF] = 'translate(0, 0)';
                _setCss(this.refreshEl, obj)
            };
            this.pullUpLoading = false;
            this.pullDownLoading = false;
            return this
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
            };
            return this.isPullUpEnd
        }
    };

    !('PullLoading' in win) && (win.PullLoading = PullLoading)
}(window))
