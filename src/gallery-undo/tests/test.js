
YUI({
    combine: false,
    debug: true,
    filter:"RAW"
}).use('gallery-undo', 'test', 'console', function(Y) {
    var that = this;

    var testArray = [];

    this.undoManager = new Y.UndoManager({
        limit: 100
    });

    var console = new Y.Console({
        verbose : false,
        printTimeout: 0,
        newestOnTop : false,

        entryTemplate: '<pre class="{entry_class} {cat_class} {src_class}">'+
                '<span class="{entry_cat_class}">{label}</span>'+
                '<span class="{entry_content_class}">{message}</span>'+
        '</pre>'
    }).render();

    var testAddUndoableAction = new Y.Test.Case({

        name: "Test add undoable edit to UndoManager",

        testAddUndoableAction: function(){
            var undoableAction = new Y.UndoableAction({
              "label" : "0",
              "asyncProcessing" : true
            });

            testArray.push( 4 );

            undoableAction.undo = function(){
                testArray.splice( 0, 1 );
                
                window.setTimeout( function(){
                    undoableAction.fire( "undoPerformed" );
                }, 2000 );
            };

            undoableAction.redo = function(){
                testArray.push( 4 );
                
                window.setTimeout( function(){
                    undoableAction.fire( "redoPerformed" );
                }, 2000 );
            };

            that.undoManager.add( undoableAction );
            that.undoManager.add( undoableAction );
            that.undoManager.add( undoableAction );
            that.undoManager.add( undoableAction );
            that.undoManager.add( undoableAction );
            that.undoManager.add( undoableAction );            
            that.undoManager.add( undoableAction );
            
            that.undoManager.undo();
            that.undoManager.undo();
            that.undoManager.undo();
            that.undoManager.undo();
            that.undoManager.undo();
            that.undoManager.undo();
            that.undoManager.undo();
            
            var canUndo = that.undoManager.canUndo();
            
            
            that.undoManager.redo();
            that.undoManager.redo();
            that.undoManager.redo();
            that.undoManager.redo();
            that.undoManager.redo();
            that.undoManager.redo();
            that.undoManager.redo();
            
            var canRedo = that.undoManager.canRedo();
            
            that.undoManager.processTo( 0 );
            that.undoManager.processTo( 7 );

            var a;
        }
    });


    var testMoveUpDown = new Y.Test.Case({
        testProcessTo : function(){
            that.undoManager.processTo( 6 );

            that.undoManager.processTo( 6 );
        }
    });


    Y.Test.Runner.add(testAddUndoableAction);
    Y.Test.Runner.add(testMoveUpDown);

    Y.Test.Runner.run();
});