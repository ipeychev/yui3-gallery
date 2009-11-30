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


    cancel : function(){
        
    },
    
    
    toString : function(){
        return this.get( LABEL );
    }
});

Y.UndoableAction = UndoableAction;

}());
