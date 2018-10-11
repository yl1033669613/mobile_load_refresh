# mobile_load_refresh
一个下拉刷新上拉加载的移动端原生js插件不依赖任何额外的js库，需要自行设计下拉刷新上拉加载提示，以及loading的样式然后将dom实例传入插件即可，5kb的大小简单易用。
可用的 [demo](https://github.com/yl1033669613/mobile_load_refresh/tree/master/dist) 。浏览器打开`index.html`查看插件使用例子。

## 用法
1. html部分需要一个滚动容器，通常为一个`div`，必须设置容器的高度。并且容器需要一个可滚动的属性css设置`overflow: scroll`, 对于ios设备还需要`-webkit-overflow-scrolling: touch`否则ios设备下无法正常滚动。

```
<style>
	.container {
        height: 100vh;
        overflow: scroll;
        -webkit-overflow-scrolling: touch;
    }
</style>

<div class="container"> <!-- 滚动容器 -->
	...
</div>
```
如果启用了下拉刷新（参数中设置了下拉刷新回调函数），则需要一个下拉刷新的loading 该laoding需要开发者根据自己项目要求自行设计。

```
<!-- 下拉刷新loading 定位在屏幕之外，下拉拖动时可以被拖动回屏幕 -->
<style>
	.pulldown {
        position: absolute;
        width: 100%;
        line-height: 50px;
        top: -50px;
        left: 0;
        z-index: 100;
        display: block;
    }
</style>

<div class="container">
	<p class="pullload pulldown"><img src="./images/loading.png" class="loading-ico" alt=""></p>
	...
</div>
```
如果启用了上拉加载（参数中设置了上拉加载回调函数），则需要三个上拉加载的提示 该提示需要开发者根据自己项目要求自行设计。

```
<style>
	.pullload {
        display: none;
        text-align: center;
        font-size: 14px;
        color: #616161;
        margin-bottom: 10px;
    }
</style>

<div class="container">
	...
	<p class="pullload pullup-before">上拉加载更多</p> <!-- 上拉加载前 -->
	<p class="pullload pullup-in"><img src="./images/loading.png" class="loading-ico" alt="">加载中...</p> <!-- 上拉加载前中 -->
	<p class="pullload pullup-end">没有更多了</p> <!-- 所有数据加载完毕 -->
</div>
```

2. js部分下载`pullloading.js`或者`pullloading.min.js`在html中引用

> <script src="your path/pullloading.min.js"></script>

实例化插件，并传入所需要的参数

```javascript
var pullLoading = new PullLoading({
	scrollEle: document.querySelector('.container'), //下拉刷新容器dom实例
	refreshEl: document.querySelector('.pulldown'), //如果需要下拉刷新（必选）下拉刷新loading实例
	pullUpBefore: document.querySelector('.pullup-before'), //上拉加载未开始前的提示dom 需要自定义样式
    pullUpIn: document.querySelector('.pullup-in'), //上拉加载中loading 提示dom实例 需要自定义样式
    pullUpEnd: document.querySelector('.pullup-end'), //上拉加载完毕所有数据显示的提示dom实例 需要自定义样式
    pullUp: function(pl) { //上拉加载回调函数参数是插件实例本身
    	...
    },
    pullDown: function(pl) { //下拉刷新回调函数参数是插件实例本身
        ...
    }
});

```
3. 方法
本插件有两个方法：`pullLoading.stopPull()`、 `pullLoading.pullUpEnd(bool)`。
`.stopPull()` 用于告诉插件回调里面的代码已执行完成上拉加载或下拉刷新完毕。
`.pullUpEnd(bool)` 用于设置上拉加载是否加载完所有数据，有一个参数。如果加载完所有数据则传`true`否则`false`. 
**注意在下拉刷新时仍然需要程序员判断是否加载完所有数据如果是则`.pullUpEnd(true)`否则`.pullUpEnd(false)`**

## demo效果图
![图片名称](https://github.com/yl1033669613/mobile_load_refresh/blob/master/demoGif.gif)
