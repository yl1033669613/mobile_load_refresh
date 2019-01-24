# mobile_load_refresh
一个下拉刷新上拉加载的`移动端`原生js插件,不依赖任何额外的js库，可自行设计下拉刷新上拉加载提示，以及loading的样式，5kb的大小简单易用。

可查看的 [demo](https://yl1033669613.github.io/mobile_load_refresh/dist/index.html) （pc端查看时请使用浏览器的移动端模拟功能。）

## 用法
1. html部分需要一个容器，通常为一个`div`(不能是body或者html元素)，必须设置容器。

```html
<!-- 必需设置容器高度  默认300px-->
<div class="pl-container" style="height: 100vh;">
        <!-- 如果需要下拉刷新loading 请在这里添加以下一项 -->
    <div class="pl-down">刷新中...</div>

    <div class="pl-wrapper">
        
        <!-- <div class="content">
            列表代码.....
        </div> -->
        
        <!-- 如果需要上拉加载loading 请在这里添加以下三项-->
        <div class="pl-up-before">上拉加载更多</div>
        <div class="pl-up-in">加载中...</div>
        <div class="pl-up-end">没有更多了</div>
    </div>
</div>

```

2. js/css部分下载`pullloading.js`或者`pullloading.min.js`,以及`pullloading.css`在html中引用

**<link rel="stylesheet" href="your path/pullloading.css">**

**<script src="your path/pullloading.min.js"></script>**

实例化插件，并传入所需要的参数

```javascript
var pullLoading = new PullLoading({
	container: '.pl-container', // String 下拉刷新容器选择器 (必需)
    threshold: 80, // Number default 80 (可选)
    pullUp: function(pl) { // 上拉加载回调函数参数是插件实例本身 (可选)
    	...
    },
    pullDown: function(pl) { // 下拉刷新回调函数参数是插件实例本身 (可选)
        ...
    }
})

```
3. 方法
本插件有两个方法：`pullLoading.stopPull()`、 `pullLoading.pullUpEnd(bool)`。

`pullLoading.stopPull()` 用于告诉插件回调里面的代码已执行完成上拉加载或下拉刷新完毕, 在ajax请求完成之后调

`pullLoading.pullUpEnd(bool)` 用于设置上拉加载是否加载完所有数据，有一个参数。如果加载完所有数据则传`true`否则`false`. 

可用[Demo](https://github.com/yl1033669613/mobile_load_refresh/blob/master/dist/index.html)

## demo效果图
![图片名称](https://github.com/yl1033669613/mobile_load_refresh/blob/master/demoGif.gif)

## 最后
利用`gulp` 简单的对js进行了压缩处理

欢迎路过的道友指出不足之处, 或者提供更好的想法.
