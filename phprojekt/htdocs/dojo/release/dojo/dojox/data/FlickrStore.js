/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["dojox.data.FlickrStore"]){dojo._hasResource["dojox.data.FlickrStore"]=!0;dojo.provide("dojox.data.FlickrStore");dojo.require("dojo.data.util.simpleFetch");dojo.require("dojo.io.script");dojo.require("dojo.date.stamp");dojo.require("dojo.AdapterRegistry");dojo.declare("dojox.data.FlickrStore",null,{constructor:function(a){if(a&&a.label)this.label=a.label;if(a&&"urlPreventCache"in a)this.urlPreventCache=a.urlPreventCache?!0:!1},_storeRef:"_S",label:"title",urlPreventCache:!0,
_assertIsItem:function(a){if(!this.isItem(a))throw Error("dojox.data.FlickrStore: a function was passed an item argument that was not an item");},_assertIsAttribute:function(a){if(typeof a!=="string")throw Error("dojox.data.FlickrStore: a function was passed an attribute argument that was not an attribute name string");},getFeatures:function(){return{"dojo.data.api.Read":!0}},getValue:function(a,b,c){return(a=this.getValues(a,b))&&a.length>0?a[0]:c},getAttributes:function(){return["title","description",
"author","datePublished","dateTaken","imageUrl","imageUrlSmall","imageUrlMedium","tags","link"]},hasAttribute:function(a,b){var c=this.getValue(a,b);return c||c===""||c===!1?!0:!1},isItemLoaded:function(a){return this.isItem(a)},loadItem:function(){},getLabel:function(a){return this.getValue(a,this.label)},getLabelAttributes:function(){return[this.label]},containsValue:function(a,b,c){a=this.getValues(a,b);for(b=0;b<a.length;b++)if(a[b]===c)return!0;return!1},getValues:function(a,b){this._assertIsItem(a);
this._assertIsAttribute(b);var c=dojo.hitch(this,"_unescapeHtml"),d=dojo.hitch(dojo.date.stamp,"fromISOString");switch(b){case "title":return[c(a.title)];case "author":return[c(a.author)];case "datePublished":return[d(a.published)];case "dateTaken":return[d(a.date_taken)];case "imageUrlSmall":return[a.media.m.replace(/_m\./,"_s.")];case "imageUrl":return[a.media.m.replace(/_m\./,".")];case "imageUrlMedium":return[a.media.m];case "link":return[a.link];case "tags":return a.tags.split(" ");case "description":return[c(a.description)];
default:return[]}},isItem:function(a){return a&&a[this._storeRef]===this?!0:!1},close:function(){},_fetchItems:function(a,b,c){var d=a.query=a.query||{},e={format:"json",tagmode:"any"};dojo.forEach(["tags","tagmode","lang","id","ids"],function(a){d[a]&&(e[a]=d[a])});e.id=d.id||d.userid||d.groupid;if(d.userids)e.ids=d.userids;var f=null,g={url:dojox.data.FlickrStore.urlRegistry.match(a),preventCache:this.urlPreventCache,content:e},h=dojo.hitch(this,function(c){f&&dojo.disconnect(f);b(this._processFlickrData(c),
a)}),f=dojo.connect("jsonFlickrFeed",h);dojo.io.script.get(g).addErrback(function(b){dojo.disconnect(f);c(b,a)})},_processFlickrData:function(a){var b=[];if(a.items)for(var b=a.items,c=0;c<a.items.length;c++)a.items[c][this._storeRef]=this;return b},_unescapeHtml:function(a){return a.replace(/&amp;/gm,"&").replace(/&lt;/gm,"<").replace(/&gt;/gm,">").replace(/&quot;/gm,'"').replace(/&#39;/gm,"'")}});dojo.extend(dojox.data.FlickrStore,dojo.data.util.simpleFetch);var feedsUrl="http://api.flickr.com/services/feeds/",
reg=dojox.data.FlickrStore.urlRegistry=new dojo.AdapterRegistry(!0);reg.register("group pool",function(a){return!!a.query.groupid},feedsUrl+"groups_pool.gne");reg.register("default",function(){return!0},feedsUrl+"photos_public.gne");if(!jsonFlickrFeed)var jsonFlickrFeed=function(){}};