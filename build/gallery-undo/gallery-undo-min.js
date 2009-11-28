YUI.add("gallery-undo",function(A){(function(){function C(L){C.superclass.constructor.apply(this,arguments);}var E=A.Lang,I="UndoManager",H="actionAdded",G="undoCanceled",B="beforeUndo",K="undoPerformed",J="beforeRedo",F="redoPerformed",D="asyncProcessing";C.NAME=I;C.ATTRS={limit:{value:0,validator:function(L){return E.isNumber(L)&&L>=0;}}};A.extend(C,A.Base,{_actions:[],_undoIndex:0,_actionHandle:null,_processing:false,initializer:function(L){this._initEvents();this.after("limitChange",A.bind(this._afterLimit,this));},destructor:function(){this.purgeAll();},_initEvents:function(){this.publish(H);this.publish(G);this.publish(B);this.publish(K);this.publish(J);this.publish(F);},add:function(P){var O=null,Q,N,M,L;if(this._processing){return false;}Q=this._actions;N=this._undoIndex;if(N>0){O=Q[N-1];}for(L=Q.length-1;L>N;L--){M=Q.splice(L,1)[0];M.cancel();this.fire(G,{"action":M});}if(O){if(!O.merge(P)){Q.push(P);}}else{Q.push(P);}this._limitActions();this._undoIndex++;this.fire(H,P);return true;},_limitActions:function(N){var P,M,U,L,V,S,R,T,Q,O;if(!N){N=this.get("limit");}P=this._actions;if(P.length<=N){return;}T=this._undoIndex;U=parseInt(N/2,10);L=N-U;V=N-L;S=T-L;R=P.length-T-V;if(S<0){R+=S;}else{if(R<0){S+=R;}}for(Q=0;Q<S;Q++){this._undoIndex--;M=P.splice(0,1)[0];M.cancel();this.fire(G,{"action":M});}for(Q=P.length-1,O=0;O<R;Q--,O++){M=P.splice(Q,1)[0];M.cancel();this.fire(G,{"action":M});}},_afterLimit:function(L){this._limitActions(L.newVal);},undo:function(){if(this.canUndo()){this._undoTo(this._undoIndex-1);}},redo:function(){if(this.canRedo()){this._redoTo(this._undoIndex+1);}},canUndo:function(){return !this._processing&&this._undoIndex>0;},canRedo:function(){return !this._processing&&this._undoIndex<this._actions.length;},getUndoLabel:function(){var L;if(this.canUndo()){L=this._actions[this._undoIndex-1];return L.get("label");}return null;},getRedoLabel:function(){var L;if(this.canRedo()){L=this._actions[this._undoIndex];return L.get("label");}return null;},purgeAll:function(){var M,L;for(L=this._actions.length-1;L>=0;L--){M=this._actions.splice(L,1)[0];M.cancel();this.fire(G,{"action":M});}this._undoIndex=0;this._processing=false;},processTo:function(L){if(E.isNumber(L)&&this.canUndo()&&this.canRedo()){if(this._undoIndex<L){this._redoTo(L);}else{if(this._undoIndex>L){this._undoTo(L);}}}},_redoTo:function(L){var M=this._actions[this._undoIndex];if(!M.get(D)){this._processing=true;this.fire(J,M);this._undoIndex++;M.redo();this.fire(F,M);if(this._undoIndex<L){this._redoTo(L);}else{this._processing=false;}}else{this._processing=true;this._actionHandle=M.on(F,A.bind(this._onAsyncRedoPerformed,this,M,L));this.fire(J,M);this._undoIndex++;M.redo();}},_undoTo:function(L){var M=this._actions[this._undoIndex-1];if(!M.get(D)){this._processing=true;this.fire(B,M);this._undoIndex--;M.undo();this.fire(K,M);if(this._undoIndex>L){this._undoTo(L);}else{this._processing=false;}}else{this._processing=true;M=this._actions[this._undoIndex-1];this._actionHandle=M.on(K,A.bind(this._onAsyncUndoPerformed,this,M,L));this.fire(B,M);this._undoIndex--;M.undo();}},_onAsyncUndoPerformed:function(M,L){this._actionHandle.detach();this._actionHandle=null;this.fire(K,M);if(this._undoIndex>L){this._undoTo(L);}else{this._processing=false;}},_onAsyncRedoPerformed:function(M,L){this._actionHandle.detach();this._actionHandle=null;this.fire(F,M);if(this._undoIndex<L){this._redoTo(L);}else{this._processing=false;}}});A.UndoManager=C;}());(function(){function G(J){G.superclass.constructor.apply(this,arguments);}var F=A.Lang,I="UndoableAction",C="label",D="beforeUndo",B="undoPerformed",E="beforeRedo",H="redoPerformed";G.NAME=I;G.ATTRS={label:{value:"",validator:F.isString},asyncProcessing:{value:false,validator:F.isBoolean}};A.extend(G,A.Base,{_childActions:[],initializer:function(J){this._initEvents();},destructor:function(){},_initEvents:function(){this.publish(D);this.publish(B);this.publish(E);this.publish(H);},undo:function(){var L,K,J;this.fire(D);L=this._childActions;for(J=L.length-1;J>0;J--){K=L[J];K.undo();}this.fire(B);},redo:function(){var M,L,J,K;this.fire(D);M=this._childActions;K=M.length;for(J=0;J<K;J++){L=M[J];L.redo();}this.fire(H);},merge:function(J){return false;},toString:function(){return this.get(C);}});A.UndoableAction=G;}());},"@VERSION@",{requires:["base","event"]});