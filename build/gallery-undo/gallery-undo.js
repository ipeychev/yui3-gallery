YUI.add('gallery-undo', function(Y) {

(function(){
    
    function UndoManager( config ){
        UndoManager.superclass.constructor.apply( this, arguments );
    }

    var Lang = Y.Lang,
    UMName = "UndoManager",
    ACTIONADDED = "actionAdded",
    ACTIONCANCELED = "undoCanceled",
    BEFOREUNDO = "beforeUndo",
    UNDOPERFORMED = "undoPerformed",
    BEFOREREDO = "beforeRedo",
    REDOPERFORMED = "redoPerformed",
    ASYNCPROCESSING = "asyncProcessing";

    UndoManager.NAME = UMName;

    UndoManager.ATTRS = {
        limit: {
            value: 0,
            validator: function( value ){
                return Lang.isNumber( value ) && value >= 0;
            }
        }
    };


    Y.extend( UndoManager, Y.Base, {

        _actions : [],
    
        _undoIndex : 0,
        
        _actionHandle : null,
        
        _processing : false,

    
        initializer : function( cfg ) {
            this._initEvents();
        
            this.after( "limitChange", Y.bind( this._afterLimit, this ) );
        },

    
        destructor : function() {
            this.purgeAll();
        },

    
        _initEvents : function(){
            this.publish( ACTIONADDED );
            this.publish( ACTIONCANCELED );
            this.publish( BEFOREUNDO );
            this.publish( UNDOPERFORMED );
            this.publish( BEFOREREDO );
            this.publish( REDOPERFORMED );
        },
    
    
        add : function( action ){
            var curAction = null, actions, undoIndex, tmp, i;
        
            if( this._processing ){
                return false;
            }

            actions = this._actions;
            undoIndex = this._undoIndex;

            if( undoIndex > 0 ){
                curAction = actions[ undoIndex - 1 ];
            }
        
            for( i = actions.length - 1; i > undoIndex; i-- ){
                tmp = actions.splice( i, 1 )[0];
            
                tmp.cancel();
                this.fire( ACTIONCANCELED, {
                    'action': tmp
                });
            }
        
            if( curAction ){
                if( !curAction.merge( action ) ){
                    actions.push( action );
                }
            } else {
                actions.push( action );
            }
        
            this._limitActions();
            this._undoIndex++;
        
            this.fire( ACTIONADDED, action );
            
            return true;
        },
    

        _limitActions : function( limit ){
            var actions, action,
            halfLimit, actionsLeft, actionsRight, deleteLeft, deleteRight,
            index, i, j;

            if( !limit ){
                limit = this.get( "limit" );
            }
        
            actions = this._actions;

            if( actions.length <= limit ){
                return;
            }
        
            index   = this._undoIndex;

            halfLimit = parseInt( limit / 2, 10 );

            actionsLeft = limit - halfLimit;
            actionsRight = limit - actionsLeft;

            deleteLeft = index - actionsLeft;
            deleteRight = actions.length - index - actionsRight;

            if( deleteLeft < 0 ){
                deleteRight += deleteLeft;
            } else if( deleteRight < 0 ){
                deleteLeft += deleteRight;
            }

            for( i = 0; i < deleteLeft; i++ ){
                this._undoIndex--;
            
                action = actions.splice( 0, 1 )[0];
                action.cancel();
                this.fire( ACTIONCANCELED, {
                    'action': action
                });
            }

            for( i = actions.length - 1, j = 0; j < deleteRight; i--, j++ ){
                action = actions.splice( i, 1 )[0];
                action.cancel();
                this.fire( ACTIONCANCELED, {
                    'action': action
                });
            }
        },
    
    
        _afterLimit : function( params ){
            this._limitActions( params.newVal );
        },
    
    
        undo : function(){
            if( this.canUndo() ){
                this._undoTo( this._undoIndex - 1 );
            }
        },
    
    
        redo : function(){
            if( this.canRedo() ){
                this._redoTo( this._undoIndex + 1 );
            }
        },
    
        canUndo : function(){
            return !this._processing && this._undoIndex > 0;
        },
    
    
        canRedo : function(){
            return !this._processing && this._undoIndex < this._actions.length;
        },
    
    
        getUndoLabel : function(){
            var action;

            if( this.canUndo() ){
                action = this._actions[ this._undoIndex - 1 ];
                return action.get( "label" );
            }
        
            return null;
        },
    
    
        getRedoLabel : function(){
            var action;

            if( this.canRedo() ){
                action = this._actions[ this._undoIndex ];
                return action.get( "label" );
            }
        
            return null;
        },
    
    
        purgeAll : function(){
            var action, i;

            for( i = this._actions.length - 1; i >= 0; i-- ) {
                action = this._actions.splice( i, 1 )[0];

                action.cancel();
                this.fire( ACTIONCANCELED, {
                    'action': action
                });
            }
        
            this._undoIndex = 0;
            this._processing = false;
        },


        processTo : function( undoIndex ){
            if( Lang.isNumber( undoIndex ) && this.canUndo() && this.canRedo() ){
                if( this._undoIndex < undoIndex ){
                    this._redoTo( undoIndex );
                } else if( this._undoIndex > undoIndex ){
                    this._undoTo( undoIndex );
                }
            }
        },
        
        
        _redoTo : function( undoIndex ){
            var action = this._actions[ this._undoIndex ];
                    
            if( !action.get( ASYNCPROCESSING ) ){
                this._processing = true;

                this.fire( BEFOREREDO, action );
                this._undoIndex++;
                
                action.redo();

                this.fire( REDOPERFORMED, action );
                
                if( this._undoIndex < undoIndex ){
                    this._redoTo( undoIndex );
                } else {
                    this._processing = false;
                }
            } else {
                this._processing = true;
                this._actionHandle = action.on( REDOPERFORMED, 
                      Y.bind( this._onAsyncRedoPerformed, this, action, undoIndex ) );

                this.fire( BEFOREREDO, action );
                this._undoIndex++;

                action.redo();
            }
        },
        
        
        _undoTo : function( undoIndex ){
            var action = this._actions[ this._undoIndex - 1 ];

            if( !action.get( ASYNCPROCESSING ) ){
                this._processing = true;

                this.fire( BEFOREUNDO, action );
                this._undoIndex--;

                action.undo();

                this.fire( UNDOPERFORMED, action );

                if( this._undoIndex > undoIndex ){
                    this._undoTo( undoIndex );
                } else {
                    this._processing = false;
                }
            } else {
                this._processing = true;

                action = this._actions[ this._undoIndex - 1 ];
                this._actionHandle = action.on( UNDOPERFORMED, 
                    Y.bind( this._onAsyncUndoPerformed, this, action, undoIndex ) );

                this.fire( BEFOREUNDO, action );
                this._undoIndex--;

                action.undo();
            }
        },
        
        _onAsyncUndoPerformed : function( action, undoIndex ){
            this._actionHandle.detach();
            this._actionHandle = null;
            
            this.fire( UNDOPERFORMED, action );

            if( this._undoIndex > undoIndex ){
                this._undoTo( undoIndex );
            } else {
                this._processing = false;
            }
        },


        _onAsyncRedoPerformed : function( action, undoIndex ){
            this._actionHandle.detach();
            this._actionHandle = null;
            
            this.fire( REDOPERFORMED, action );

            if( this._undoIndex < undoIndex ){
                this._redoTo( undoIndex );
            } else {
                this._processing = false;
            }
        }
    });

    Y.UndoManager = UndoManager;

}());
(function(){

function UndoableAction( config ){
    UndoableAction.superclass.constructor.apply( this, arguments );
}

var Lang = Y.Lang,
    UAName = "UndoableAction",
    LABEL = "label",
    BEFOREUNDO = "beforeUndo",
    UNDOPERFORMED = "undoPerformed",
    BEFOREREDO = "beforeRedo",
    REDOPERFORMED = "redoPerformed";

UndoableAction.NAME = UAName;

UndoableAction.ATTRS = {
    label: {
        value: "",
        validator: Lang.isString
    },
    
    asyncProcessing : {
        value: false,
        validator: Lang.isBoolean
    }
};


Y.extend( UndoableAction, Y.Base, {
    
    _childActions : [],

    initializer : function( cfg ) {
        this._initEvents();
    },

    destructor : function() {
    },

    _initEvents : function(){
        this.publish( BEFOREUNDO );
        this.publish( UNDOPERFORMED );
        this.publish( BEFOREREDO );
        this.publish( REDOPERFORMED );
    },

    undo : function(){
        var childActions, action, i;

        this.fire( BEFOREUNDO );
        
        childActions = this._childActions;

        for( i = childActions.length - 1; i > 0; i-- ){
            action = childActions[i];
            action.undo();
        }

        this.fire( UNDOPERFORMED );
    },
    
    redo : function(){
        var childActions, action, i, length;

        this.fire( BEFOREUNDO );

        childActions = this._childActions;
        length = childActions.length;
        
        for( i = 0; i < length; i++ ){
            action = childActions[i];
            action.redo();
        }

        this.fire( REDOPERFORMED );
    },
        
    
    merge : function( action ){
        return false;
    },
    
    
    toString : function(){
        return this.get( LABEL );
    }
});

Y.UndoableAction = UndoableAction;

}());


}, '@VERSION@' ,{requires:['base','event']});
