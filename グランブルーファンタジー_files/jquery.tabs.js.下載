/*
jquery.tabs.js
@author Kazuyuki Taguchi
タブ切り替えを行うためだけの汎用プラグイン

デフォルト
var defaults = {
	actClass: "active",    // アクティブ状態を示すclass
	tabClass: "tabs",      // タブのclass
	tabTarg : "tabContent" // タブに対応したcontentに設定したclass
}

*/
!function(a){a.fn.tabs=function(b){var c={actClass:"active",tabClass:"tabs",tabTarg:"tabContent",defaultTab:0,eventOnTabChange:"completeTabChange"};a.extend(c,b);return this.each(function(){var b=c.actClass,d="."+c.tabClass,e="."+c.tabTarg,f=a(d),g=a(e);f.eq(c.defaultTab).addClass(b),g.eq(c.defaultTab).addClass(b),f.on("tap",function(){var e=a(d).index(this);f.removeClass(b).eq(e).addClass(b),g.removeClass(b).eq(e).addClass(b),Game.view&&Game.view.trigger(c.eventOnTabChange,e)})})}}(jQuery);