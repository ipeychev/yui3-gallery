YUI.add("gallery-accordion",function(A){(function(){function M(v){M.superclass.constructor.apply(this,arguments);}var u=A.Lang,V=A.Node,Z=A.Anim,H=A.Easing,N="accordion",X=A.WidgetStdMod,s=document.compatMode=="BackCompat",T=s&&A.UA.ie>0,U=T?1:0,I=A.ClassNameManager.getClassName,W="yui-accordion-item",f=I(N,"proxyel","visible"),h=I(N,"graggroup"),b="beforeItemAdd",e="itemAdded",D="beforeItemRemove",i="itemRemoved",C="beforeItemResized",p="itemResized",d="beforeItemExpand",g="beforeItemCollapse",J="itemExpanded",m="itemCollapsed",j="beforeItemReorder",R="beforeEndItemReorder",S="itemReordered",k="default",O="animation",P="alwaysVisible",E="expanded",c="collapseOthersOnExpand",Y="items",t="contentHeight",B="iconClose",F="iconAlwaysVisible",G="stretch",r="px",a="contentBox",n="boundingBox",l="rendered",o="bodyContent",Q="children",K="parentNode",q="node",L="data";M.NAME=N;M.ATTRS={itemChosen:{value:"click",validator:u.isString},items:{value:[],readOnly:true,validator:u.isArray},resizeEvent:{value:k,validator:function(v){if(v===k){return true;}else{if(u.isObject(v)){if(u.isValue(v.sourceObject)&&u.isValue(v.resizeEvent)){return true;}}}return false;}},useAnimation:{value:true,validator:u.isBoolean},animation:{value:{duration:1,easing:H.easeOutStrong},validator:function(v){return u.isObject(v)&&u.isNumber(v.duration)&&u.isFunction(v.easing);}},reorderItems:{value:false,validator:function(v){return u.isBoolean(v)&&!u.isUndefined(A.DD);}},collapseOthersOnExpand:{value:true,validator:u.isBoolean}};A.extend(M,A.Widget,{initializer:function(v){this._initEvents();this.after("render",A.bind(this._afterRender,this));},destructor:function(){var v,y,w,x;v=this.get(Y);x=v.length;for(w=x-1;w>=0;w--){y=v[w];v.splice(w,1);this._removeItemHandles(y);y.destroy();}},_initEvents:function(){this.publish(b);this.publish(e);this.publish(D);this.publish(i);this.publish(C);this.publish(p);this.publish(d);this.publish(g);this.publish(J);this.publish(m);this.publish(j);this.publish(R);this.publish(S);},_forCollapsing:{},_forExpanding:{},_animations:{},_itemsHandles:{},_removeItemHandles:function(x){var w,v;w=this._itemsHandles[x];for(v in w){if(w.hasOwnProperty(v)){v=w[v];v.detach();}}delete this._itemsHandles[x];},_getNodeOffsetHeight:function(x){var v,w;if(x instanceof V){if(x.hasMethod("getBoundingClientRect")){w=x.invoke("getBoundingClientRect");if(w){v=w.bottom-w.top;return v;}}else{v=x.get("offsetHeight");return A.Lang.isValue(v)?v:0;}}else{if(x){v=x.offsetHeight;return A.Lang.isValue(v)?v:0;}}return 0;},_setItemProperties:function(x,z,w){var v,y;v=x.get(P);y=x.get(E);if(z!=y){x.set(E,z,{internalCall:true});}if(w!==v){x.set(P,w,{internalCall:true});}},_setItemUI:function(w,x,v){w.markAsExpanded(x);w.markAsAlwaysVisible(v);},_afterRender:function(w){var v;v=this.get("resizeEvent");this._setUpResizing(v);this.after("resizeEventChange",A.bind(this._afterResizeEventChange,this));},_afterResizeEventChange:function(v){this._setUpResizing(v.newVal);},_onItemChosen:function(AA,AB,v){var z,x,y,w;z={};w=this.get(c);x=AA.get(P);y=AA.get(E);if(v){this.removeItem(AA);return;}else{if(AB){if(y){x=!x;y=x?true:y;this._setItemProperties(AA,y,x);this._setItemUI(AA,y,x);return;}else{this._forExpanding[AA]={"item":AA,alwaysVisible:true};if(w){z[AA]={"item":AA};this._storeItemsForCollapsing(z);}}}else{if(y){this._forCollapsing[AA]={"item":AA};}else{this._forExpanding[AA]={"item":AA,"alwaysVisible":x};if(w){z[AA]={"item":AA};this._storeItemsForCollapsing(z);}}}}this._processItems();},_adjustStretchItems:function(){var v=this.get(Y),w;w=this._getHeightPerStretchItem();A.Array.each(v,function(AB,AA,z){var x,AD,AC,AE,y;AE=AB.get(t);y=AB.get(E);if(AE.method===G&&y){AC=this._animations[AB];if(AC){AC.stop();}x=AB.getStdModNode(X.BODY);AD=this._getNodeOffsetHeight(x);if(w<AD){this._processCollapsing(AB,w);}else{if(w>AD){this._processExpanding(AB,w);}}}},this);return w;},_getHeightPerStretchItem:function(){var v,x,w=0;x=this.get(Y);v=this.get(n).get("clientHeight");A.Array.each(x,function(AC,AB,AA){var AD,z,AF,AE,y;AF=AC.getStdModNode(X.HEADER);AE=AC.get(t);y=this._getNodeOffsetHeight(AF);v-=y;AD=!AC.get(E);if(AD){v-=U;return;}if(AE.method===G){w++;}else{z=this._getItemContentHeight(AC);v-=z;}},this);if(w>0){v/=w;}if(v<0){v=0;}return v;},_getItemContentHeight:function(x){var z,w=0,v,y;z=x.get(t);if(z.method==="auto"){v=x.getStdModNode(X.BODY);y=v.get(Q).item(0);w=y?this._getNodeOffsetHeight(y):0;}else{if(z.method==="fixed"){w=z.height;}else{w=this._getHeightPerStretchItem();}}return w;},_storeItemsForCollapsing:function(w){var v;w=w||{};v=this.get(Y);A.Array.each(v,function(AB,AA,z){var y,x;y=AB.get(E);x=AB.get(P);if(y&&!x&&!w[AB]){this._forCollapsing[AB]={"item":AB};}},this);},_expandItem:function(x,v){var w=x.get(P);this._processExpanding(x,v);this._setItemUI(x,true,w);},_processExpanding:function(AC,AB,v){var w,x,z,AD=false,AA,y;y=AC.getStdModNode(X.BODY);this.fire(C,{"item":AC});if(y.get("clientHeight")<=0){AD=true;this.fire(d,{"item":AC});}if(!v&&this.get("useAnimation")){z=AC.get(O)||{};w=new Z({node:y,to:{"height":AB}});w.on("end",A.bind(this._onExpandComplete,this,AC,AD));AA=this.get(O);w.set("duration",z.duration||AA.duration);w.set("easing",z.easing||AA.easing);x=this._animations[AC];if(x){x.stop();}AC.markAsExpanding(true);this._animations[AC]=w;w.run();}else{y.setStyle("height",AB+r);this.fire(p,{"item":AC});if(AD){this.fire(J,{"item":AC});}}},_onExpandComplete:function(v,w){delete this._animations[v];v.markAsExpanding(false);this.fire(p,{"item":v});if(w){this.fire(J,{"item":v});}},_collapseItem:function(v){this._processCollapsing(v,U);this._setItemUI(v,false,false);},_processCollapsing:function(AC,AB,v){var w,x,z,AA,y,AD=(AB===U);y=AC.getStdModNode(X.BODY);this.fire(C,{"item":AC});if(AD){this.fire(g,{"item":AC});}if(!v&&this.get("useAnimation")){z=AC.get(O)||{};w=new Z({node:y,to:{"height":AB}});w.on("end",A.bind(this._onCollapseComplete,this,AC,AD));AA=this.get(O);w.set("duration",z.duration||AA.duration);w.set("easing",z.easing||AA.easing);
x=this._animations[AC];if(x){x.stop();}AC.markAsCollapsing(true);this._animations[AC]=w;w.run();}else{y.setStyle("height",AB+r);this.fire(p,{"item":AC});if(AD){this.fire(m,{"item":AC});}}},_onCollapseComplete:function(v,w){delete this._animations[v];v.markAsCollapsing(false);this.fire(p,{item:v});if(w){this.fire(m,{"item":v});}},_initItemDragDrop:function(w){var AA,v,z,x,y;AA=w.getStdModNode(X.HEADER);if(AA.dd){return;}z=this.get(n);x=w.get(n);v=new A.DD.Drag({node:AA,groups:[h]}).plug(A.Plugin.DDProxy,{moveOnEnd:false}).plug(A.Plugin.DDConstrained,{constrain2node:z});y=new A.DD.Drop({node:x,groups:[h]});v.on("drag:start",A.bind(this._onDragStart,this,v));v.on("drag:end",A.bind(this._onDragEnd,this,v));v.after("drag:end",A.bind(this._afterDragEnd,this,v));v.on("drag:drophit",A.bind(this._onDropHit,this,v));},_onDragStart:function(v,y){var x,w;w=this.getItem(v.get(q).get(K));x=v.get("dragNode");x.addClass(f);x.set("innerHTML",w.get("label"));return this.fire(j,{"item":w});},_onDragEnd:function(v,y){var x,w;x=v.get("dragNode");x.removeClass(f);x.set("innerHTML","");w=this.getItem(v.get(q).get(K));return this.fire(R,{"item":w});},_afterDragEnd:function(v,y){var w,x;x=v.get(L);if(x.drophit){w=this.getItem(v.get(q).get(K));v.set(L,{drophit:false});return this.fire(S,{"item":w});}return true;},_onDropHit:function(AE,AA){var z,AD,w,AC,y,v,AB,x,AF;AF=this.getItem(AE.get(q).get(K));x=this.getItem(AA.drop.get(q));if(x===AF){return false;}z=this.getItemIndex(AF);AD=this.getItemIndex(x);w=x.get(n);AC=AF.get(n);y=this.get(a);v=false;AB=this.get(Y);if(AD<z){v=true;}y.removeChild(AC);if(v){y.insertBefore(AC,w);AB.splice(z,1);AB.splice(AD,0,AF);}else{y.insertBefore(AC,w.next(W));AB.splice(AD+1,0,AF);AB.splice(z,1);}AE.set(L,{drophit:true});return true;},_processItems:function(){var x,w,y,AA,v,AB,z;x=this._forCollapsing;w=this._forExpanding;this._setItemsProperties();for(z in x){if(x.hasOwnProperty(z)){y=x[z];this._collapseItem(y.item);}}AA=this._adjustStretchItems();for(z in w){if(w.hasOwnProperty(z)){y=w[z];z=y.item;v=AA;AB=z.get(t);if(AB.method!==G){v=this._getItemContentHeight(z);}this._expandItem(z,v);}}this._forCollapsing={};this._forExpanding={};},_setItemsProperties:function(){var x,w,v;x=this._forCollapsing;w=this._forExpanding;for(v in x){if(x.hasOwnProperty(v)){v=x[v];this._setItemProperties(v.item,false,false);}}for(v in w){if(w.hasOwnProperty(v)){v=w[v];this._setItemProperties(v.item,true,v.alwaysVisible);}}},_afterItemExpand:function(z){var x,y,w,v;if(z.internalCall){return;}x=z.newVal;y=z.currentTarget;w=y.get(P);v=this.get(c);if(x){this._forExpanding[y]={"item":y,"alwaysVisible":w};if(v){this._storeItemsForCollapsing();}}else{this._forCollapsing[y]={"item":y};}this._processItems();},_afterItemAlwaysVisible:function(y){var x,v,w;if(y.internalCall){return;}v=y.newVal;x=y.currentTarget;w=x.get(E);if(v){if(w){this._setItemProperties(x,true,true);this._setItemUI(x,true,true);return;}else{this._forExpanding[x]={"item":x,"alwaysVisible":true};this._storeItemsForCollapsing();}}else{if(w){this._setItemUI(x,true,false);return;}else{return;}}this._processItems();},_afterContentHeight:function(AA){var y,w,v,z,x;y=AA.currentTarget;this._adjustStretchItems();if(AA.newVal.method!==G){x=y.get(E);w=this._getItemContentHeight(y);v=y.getStdModNode(X.BODY);z=this._getNodeOffsetHeight(v);if(w<z){this._processCollapsing(y,w,!x);}else{if(w>z){this._processExpanding(y,w,!x);}}}},_afterContentUpdate:function(AB){var y,w,v,AA,x,AC,z;y=AB.currentTarget;AC=y.get("contentHeight").method==="auto";x=y.get(E);if(AC&&x&&AB.src!==A.Widget.UI_SRC){A.later(0,this,function(){w=this._getItemContentHeight(y);v=y.getStdModNode(X.BODY);AA=this._getNodeOffsetHeight(v);if(w!==AA){z=this._animations[y];if(z){z.stop();}this._adjustStretchItems();if(w<AA){this._processCollapsing(y,w,!x);}else{if(w>AA){this._processExpanding(y,w,!x);}}}});}},_setUpResizing:function(v){if(this._resizeEventHandle){this._resizeEventHandle.detach();}if(v===k){this._resizeEventHandle=A.on("windowresize",A.bind(this._adjustStretchItems,this));}else{this._resizeEventHandle=v.sourceObject.on(v.resizeEvent,A.bind(this._adjustStretchItems,this));}},renderUI:function(){var v,w;v=this.get(a);w=v.queryAll("> div."+W);w.each(function(AA,x,z){var y;if(!this.getItem(AA)){y=new A.AccordionItem({contentBox:AA});this.addItem(y);}},this);},bindUI:function(){var v,w;v=this.get(a);w=this.get("itemChosen");v.delegate(w,A.bind(this._onItemChosenEvent,this),"div.yui-widget-hd");},_onItemChosenEvent:function(AA){var AC,AB,x,y,w,z,v;AC=AA.currentTarget;AB=AC.get(K);x=this.getItem(AB);y=x.get(F);w=x.get(B);z=(y===AA.target);v=(w===AA.target);this._onItemChosen(x,z,v);},addItem:function(AI,y){var AB,AG,AF,v,AD,AE,AH,AA,AC,z,x,w;AC=this.fire(b,{"item":AI});if(!AC){return false;}AD=this.get(Y);AE=this.get(a);AA=AI.get(a);w=AI.get(n);if(!AA.inDoc()){if(y){v=this.getItemIndex(y);if(v<0){return false;}AD.splice(v,0,AI);if(AI.get(l)){AE.insertBefore(w,y.get(n));}else{AE.insertBefore(AA,y.get(n));}}else{AD.push(AI);if(AI.get(l)){AE.insertBefore(w,null);}else{AE.insertBefore(AA,null);}}}else{z=this.get(a);x=z.get(Q);AC=x.some(function(AL,AK,AJ){if(AL===AA){AD.splice(AK,0,AI);return true;}else{return false;}},this);if(!AC){return false;}}AF=AI.get(o);if(!AF){AI.set(o,"&nbsp;");}if(!AI.get(l)){AI.render();}AB=AI.get(E);AG=AI.get(P);AB=AB||AG;if(AB){this._forExpanding[AI]={"item":AI,"alwaysVisible":AG};}else{this._forCollapsing[AI]={"item":AI};}this._processItems();if(this.get("reorderItems")){this._initItemDragDrop(AI);}AH=this._itemsHandles[AI];if(!AH){AH={};}AH={"expandedChange":AI.after("expandedChange",A.bind(this._afterItemExpand,this)),"alwaysVisibleChange":AI.after("alwaysVisibleChange",A.bind(this._afterItemAlwaysVisible,this)),"contentHeightChange":AI.after("contentHeightChange",A.bind(this._afterContentHeight,this)),"contentUpdate":AI.after("contentUpdate",A.bind(this._afterContentUpdate,this))};this._itemsHandles[AI]=AH;this.fire(e,{"item":AI});return true;},removeItem:function(w){var v,z,y=null,x;
v=this.get(Y);if(u.isNumber(w)){x=w;}else{if(w instanceof A.AccordionItem){x=this.getItemIndex(w);}else{return null;}}if(x>=0){this.fire(D,{item:w});y=v.splice(x,1)[0];this._removeItemHandles(y);z=y.get(n);z.remove();this._adjustStretchItems();this.fire(i,{item:w});}return y;},getItem:function(x){var v=this.get(Y),w=null;if(u.isNumber(x)){w=v[x];return(w instanceof A.AccordionItem)?w:null;}else{if(x instanceof V){A.Array.some(v,function(AC,AB,z){var y,AA;y=AC.get(a);AA=AC.get(n);if(y===x){w=AC;return true;}else{if(AA===x){w=AC;return true;}else{return false;}}},this);}}return w;},getItemIndex:function(x){var w=-1,v;if(x instanceof A.AccordionItem){v=this.get(Y);A.Array.some(v,function(AA,z,y){if(AA===x){w=z;return true;}else{return false;}},this);}return w;}});A.Accordion=M;}());(function(){function c(AA){c.superclass.constructor.apply(this,arguments);}var y=A.Lang,S=A.Base,e=A.Node,Q=A.JSON,f=A.WidgetStdMod,h="accordion-item",O=A.ClassNameManager.getClassName,D=O(h,"iconexpanded","expanding"),w=O(h,"iconexpanded","collapsing"),P=O(h,"icon"),L=O(h,"label"),s=O(h,"iconalwaysvisible"),j=O(h,"icons"),q=O(h,"iconexpanded"),n=O(h,"iconclose"),R=O(h,"iconclose","hidden"),U=O(h,"iconexpanded","on"),M=O(h,"iconexpanded","off"),E=O(h,"iconalwaysvisible","on"),o=O(h,"iconalwaysvisible","off"),a=O(h,"expanded"),X=O(h,"closable"),l=O(h,"alwaysvisible"),m=O(h,"contentheight"),p="title",C="strings",g="contentBox",u="rendered",I="className",i="auto",K="stretch",Y="fixed",V=".yui-widget-hd",b=".",r=".yui-widget-hd "+b,v="innerHTML",x="iconsContainer",k="icon",T="nodeLabel",H="iconAlwaysVisible",d="iconExpanded",B="iconClose",t="href",W="#",G="yuiConfig",F="headerContent",J=/^(?:true|yes|1)$/,N=/^auto\s*/,z=/^stretch\s*/,Z=/^fixed-\d+/;c.NAME=h;c.ATTRS={icon:{value:null,validator:function(AA){return this._validateIcon(AA);},setter:function(AA){return this._setIcon(AA);}},label:{value:"&#160;",validator:y.isString},nodeLabel:{value:null,validator:function(AA){return this._validateNodeLabel(AA);},setter:function(AA){return this._setNodeLabel(AA);}},iconsContainer:{value:null,validator:function(AA){return this._validateIconsContainer(AA);},setter:function(AA){return this._setIconsContainer(AA);}},iconExpanded:{value:null,validator:function(AA){return this._validateIconExpanded(AA);},setter:function(AA){return this._setIconExpanded(AA);}},iconAlwaysVisible:{value:null,validator:function(AA){return this._validateIconAlwaysVisible(AA);},setter:function(AA){return this._setIconAlwaysVisible(AA);}},iconClose:{value:null,validator:function(AA){return this._validateIconClose(AA);},setter:function(AA){return this._setIconClose(AA);}},expanded:{value:false,validator:y.isBoolean},contentHeight:{value:{method:i},validator:function(AA){if(y.isObject(AA)){if(AA.method===i){return true;}else{if(AA.method===K){return true;}else{if(AA.method===Y&&y.isNumber(AA.height)&&AA.height>=0){return true;}}}}return false;}},alwaysVisible:{value:false,validator:y.isBoolean},animation:{value:{},validator:y.isObject},strings:{value:{title_always_visible_off:"Click to set always visible on",title_always_visible_on:"Click to set always visible off",title_iconexpanded_off:"Click to expand",title_iconexpanded_on:"Click to collapse",title_iconclose:"Click to close"}},closable:{value:false,validator:y.isBoolean}};c.HTML_PARSER={icon:r+P,label:function(AA){var AD,AE,AC,AB;AC=this._getConfigDOMAttribute(AA);if(AC&&y.isValue(AC.label)){return AC.label;}AB=AA.getAttribute("data-label");if(AB){return AB;}AE=r+L;AD=AA.query(AE);return(AD)?AD.get(v):null;},nodeLabel:r+L,iconsContainer:r+j,iconAlwaysVisible:r+s,iconExpanded:r+q,iconClose:r+n,expanded:function(AA){var AC,AB;AC=this._getConfigDOMAttribute(AA);if(AC&&y.isBoolean(AC.expanded)){return AC.expanded;}AB=AA.getAttribute("data-expanded");if(AB){return J.test(AB);}return AA.hasClass(a);},alwaysVisible:function(AB){var AC,AA;AC=this._getConfigDOMAttribute(AB);if(AC&&y.isBoolean(AC.alwaysVisible)){AA=AC.alwaysVisible;}else{AA=AB.getAttribute("data-alwaysvisible");if(AA){AA=J.test(AA);}else{AA=AB.hasClass(l);}}if(AA){this.set("expanded",true,{internalCall:true});}return AA;},closable:function(AA){var AC,AB;AC=this._getConfigDOMAttribute(AA);if(AC&&y.isBoolean(AC.closable)){return AC.closable;}AB=AA.getAttribute("data-closable");if(AB){return J.test(AB);}return AA.hasClass(X);},contentHeight:function(AB){var AF,AG,AA=0,AC,AE,AD;AE=this._getConfigDOMAttribute(AB);if(AE&&AE.contentHeight){return AE.contentHeight;}AD=AB.getAttribute("data-contentheight");if(N.test(AD)){return{method:i};}else{if(z.test(AD)){return{method:K};}else{if(Z.test(AD)){AA=this._extractFixedMethodValue(AD);return{method:Y,height:AA};}}}AG=AB.get(I);AF=m+"-";AC=AG.indexOf(AF,0);if(AC>=0){AC+=AF.length;AG=AG.substring(AC);if(N.test(AG)){return{method:i};}else{if(z.test(AG)){return{method:K};}else{if(Z.test(AG)){AA=this._extractFixedMethodValue(AG);return{method:Y,height:AA};}}}}return null;}};c.TEMPLATES={icon:'<a class="'+P+'"></a>',label:'<a href="#" class="'+L+'"></a>',iconsContainer:'<div class="'+j+'"></div>',iconExpanded:['<a href="#" class="',q," ",M,'"></a>'].join(""),iconAlwaysVisible:['<a href="#" class="',s," ",o,'"></a>'].join(""),iconClose:['<a href="#" class="',n," ",R,'"></a>'].join("")};A.extend(c,A.Widget,{_createHeader:function(){var AI,AG,AH,AE,AF,AD,AB,AA,AC;AF=this.get(k);AD=this.get(T);AB=this.get(d);AA=this.get(H);AC=this.get(B);AE=this.get(x);AH=this.get(C);AI=this.get("closable");AG=c.TEMPLATES;if(!AF){AF=e.create(AG.icon);this.set(k,AF);}if(!AD){AD=e.create(AG.label);this.set(T,AD);}else{if(!AD.hasAttribute(t)){AD.setAttribute(t,W);}}AD.setContent(this.get("label"));if(!AE){AE=e.create(AG.iconsContainer);this.set(x,AE);}if(!AA){AA=e.create(AG.iconAlwaysVisible);AA.setAttribute(p,AH.title_always_visible_off);this.set(H,AA);}else{if(!AA.hasAttribute(t)){AA.setAttribute(t,W);}}if(!AB){AB=e.create(AG.iconExpanded);AB.setAttribute(p,AH.title_iconexpanded_off);this.set(d,AB);}else{if(!AB.hasAttribute(t)){AB.setAttribute(t,W);
}}if(!AC){AC=e.create(AG.iconClose);AC.setAttribute(p,AH.title_iconclose);this.set(B,AC);}else{if(!AC.hasAttribute(t)){AC.setAttribute(t,W);}}if(AI){AC.removeClass(R);}else{AC.addClass(R);}this._addHeaderComponents();},_addHeaderComponents:function(){var AG,AB,AF,AC,AE,AD,AA;AB=this.get(k);AF=this.get(T);AE=this.get(d);AD=this.get(H);AA=this.get(B);AC=this.get(x);AG=this.get(F);if(!AG){AG=new e(document.createDocumentFragment());AG.appendChild(AB);AG.appendChild(AF);AG.appendChild(AC);AC.appendChild(AD);AC.appendChild(AE);AC.appendChild(AA);this.setStdModContent(f.HEADER,AG,f.REPLACE);}else{if(!AG.contains(AB)){if(AG.contains(AF)){AG.insertBefore(AB,AF);}else{AG.appendChild(AB);}}if(!AG.contains(AF)){AG.appendChild(AF);}if(!AG.contains(AC)){AG.appendChild(AC);}if(!AC.contains(AD)){AC.appendChild(AD);}if(!AC.contains(AE)){AC.appendChild(AE);}if(!AC.contains(AA)){AC.appendChild(AA);}}},_labelChanged:function(AB){var AA;if(this.get(u)){AA=this.get(T);AA.set(v,AB.newVal);}},_closableChanged:function(AB){var AA;if(this.get(u)){AA=this.get(B);if(AB.newVal){AA.removeClass(R);}else{AA.addClass(R);}}},initializer:function(AA){this.after("labelChange",A.bind(this._labelChanged,this));this.after("closableChange",A.bind(this._closableChanged,this));},destructor:function(){},renderUI:function(){this._createHeader();},bindUI:function(){var AA;AA=this.get(g);AA.delegate("click",A.bind(this._onLinkClick,this),V+" a");},_onLinkClick:function(AA){AA.preventDefault();},markAsAlwaysVisible:function(AB){var AC,AA;AC=this.get(H);AA=this.get(C);if(AB){if(!AC.hasClass(E)){AC.replaceClass(o,E);AC.set(p,AA.title_always_visible_on);return true;}}else{if(AC.hasClass(E)){AC.replaceClass(E,o);AC.set(p,AA.title_always_visible_off);return true;}}return false;},markAsExpanded:function(AB){var AA,AC;AC=this.get(d);AA=this.get(C);if(AB){if(!AC.hasClass(U)){AC.replaceClass(M,U);AC.set(p,AA.title_iconexpanded_on);return true;}}else{if(AC.hasClass(U)){AC.replaceClass(U,M);AC.set(p,AA.title_iconexpanded_off);return true;}}return false;},markAsExpanding:function(AB){var AA=this.get(d);if(AB){if(!AA.hasClass(D)){AA.addClass(D);return true;}}else{if(AA.hasClass(D)){AA.removeClass(D);return true;}}return false;},markAsCollapsing:function(AA){var AB=this.get(d);if(AA){if(!AB.hasClass(w)){AB.addClass(w);return true;}}else{if(AB.hasClass(w)){AB.removeClass(w);return true;}}return false;},resize:function(){this.fire("contentUpdate");},_getConfigDOMAttribute:function(AA){if(!this._parsedCfg){this._parsedCfg=AA.getAttribute(G);if(this._parsedCfg){this._parsedCfg=Q.parse(this._parsedCfg);}}return this._parsedCfg;},_extractFixedMethodValue:function(AE){var AB,AD,AC,AA=null;for(AB=6,AD=AE.length;AB<AD;AB++){AC=AE.charAt(AB);AC=parseInt(AC,10);if(y.isNumber(AC)){AA=(AA*10)+AC;}else{break;}}return AA;},_validateIcon:function(AA){return !this.get(u)||AA;},_validateNodeLabel:function(AA){return !this.get(u)||AA;},_validateIconsContainer:function(AA){return !this.get(u)||AA;},_validateIconExpanded:function(AA){return !this.get(u)||AA;},_validateIconAlwaysVisible:function(AA){return !this.get(u)||AA;},_validateIconClose:function(AA){return !this.get(u)||AA;},_setIcon:function(AA){return A.get(AA)||null;},_setNodeLabel:function(AA){return A.get(AA)||null;},_setIconsContainer:function(AA){return A.get(AA)||null;},_setIconExpanded:function(AA){return A.get(AA)||null;},_setIconAlwaysVisible:function(AA){return A.get(AA)||null;},_setIconClose:function(AA){return A.get(AA)||null;}});S.build(c.NAME,c,[f],{dynamic:false});A.AccordionItem=c;}());},"@VERSION@",{requires:["event","anim-easing","widget","widget-stdmod","json-parse"],optional:["dd-constrain","dd-proxy","dd-drop"]});