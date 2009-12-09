
YUI( {
    combine: false,
    filter: "RAW"
} ).use( 'dd-drag', 'gallery-undo', function( Y ){
    
    /*
     * Puzzle implementation
     */
    function Puzzle( config ){
        Puzzle.superclass.constructor.apply( this, arguments );
    }

    var Lang = Y.Lang,
        Node = Y.Node,
        SLICE_SELECTOR = '.slice',
        TARGET_CONTAINER = "#target-container",
        CLICK = "click",
        DISABLED = "disabled";

    Puzzle.NAME = "Puzzle";

    Puzzle.ATTRS = {
        image : {
            value : "assets/car.png",
            validator : Lang.isString
        },

        partsPerSide : {
            value : 4,
            validator: function( value ){
                return Lang.isNumber(value) && value > 1;
            }
        },

        imageModel : {
            value : "assets/car_model.png",
            validator : Lang.isString
        }
    };

    Y.extend( Puzzle, Y.Base, {

        initializer : function(cfg) {
            var imageModelURI;

            this._destNode = Y.one( TARGET_CONTAINER );
            this._destX = this._destNode.getX();
            this._destY = this._destNode.getY();

            imageModelURI = this.get( "imageModel" );
            this._destNode.setStyle( "background", "url('" + imageModelURI + "')" );

            this._btnShuffle = Y.one( "#btn-shuffle" );
            this._shuffleHandler = this._btnShuffle.on( CLICK, Y.bind( this._shufflePuzzle, this ) );
            
            this._actionView = Y.Node.getDOMNode( Y.one( "#action-view" ) );
            Y.on( "change", Y.bind( this._onActionViewSelectionChange, this ), this._actionView );

            this._initSlices();

            this._undoManager = new Y.UndoManager();

            this._undoManager.subscribe( "actionAdded", Y.bind( this._onActionAdded, this ) );
            this._undoManager.subscribe( "undoFinished", Y.bind( this._onUndoFinished, this ) );
            this._undoManager.subscribe( "redoFinished", Y.bind( this._onRedoFinished, this ) );
            this._undoManager.subscribe( "actionCanceled", Y.bind( this._onActionCanceled, this ) );

            this._btnUndo = Y.one( "#btn-undo" );
            this._btnRedo = Y.one( "#btn-redo" );
            
            this._txtLimit = Y.one( "#txt-setlimit" );
            this._btnLimit = Y.one( "#btn-setlimit" );

            this._btnUndoHandler = this._btnUndo.on( CLICK, Y.bind( this._onUndo, this ) );
            this._btnRedoHandler = this._btnRedo.on( CLICK, Y.bind( this._onRedo, this ) );

            this._btnLimit.on( CLICK, Y.bind( this._onSetLimitClick, this ) );

            this._txtLimit.set( "value", this._undoManager.get( "limit" ) );

            this._updateUI();
        },

        destructor : function() {
            this._shuffleHandler.detach();
            this._btnUndoHandler.detach();
            this._btnRedoHandler.detach();

            this._undoManager.destroy();

            this._slices.each( function(slice, k) {
                slice.dd.destroy();
            }, this );
        },

        _initSlices : function(){
            var imageURI, image;

            imageURI = this.get( "image" );
            image = new Image();
            image.style.visibility = "hidden";

            Y.on( "load", Y.bind( function(){
                var destNode = this._destNode, cells, rows, imageParts, slice,
                    targetSlice, sliceWidth, sliceHeight, i, j, delta, xPos, yPos;

                this._destNodeWidth  = image.width;
                this._destNodeHeight = image.height;

                destNode.setStyle( "width", this._destNodeWidth + "px" );
                destNode.setStyle( "height", this._destNodeHeight + "px" );

                imageParts = this.get( "partsPerSide" );
                this._cells = this._rows = cells = rows = imageParts;
                
                this._sliceWidth  = sliceWidth  = Math.round(image.width  / imageParts);
                this._sliceHeight = sliceHeight = Math.round(image.height / imageParts);

                for( i = 0, j = 0; i < cells; i++ ){
                    for( j = 0; j < rows; j++ ){
                        slice = [
                            '<div class="slice" style="background-image: url(', imageURI, '); ', 
                            'background-position: ', -(j * sliceWidth), 'px ', -(i * sliceHeight), 'px',
                            '"></div>'
                          ].join('');

                        slice = Node.create( slice );

                        targetSlice = Node.create( '<div class="target-container-slice"></div>' );

                        destNode.prepend( targetSlice );
                        destNode.appendChild( slice );

                        delta = targetSlice.get( "offsetWidth" ) - targetSlice.get( "clientWidth" );
                        slice.setStyle( "width", sliceWidth + "px" );
                        targetSlice.setStyle( "width", sliceWidth - delta + "px" );

                        delta = targetSlice.get( "offsetHeight" ) - targetSlice.get( "clientHeight" );
                        slice.setStyle( "height", sliceHeight + "px" );
                        targetSlice.setStyle( "height", sliceHeight - delta + "px" );

                        xPos = this._destX + (j * sliceWidth);
                        yPos = this._destY + (i * sliceHeight);

                        slice.setXY( [xPos, yPos] );
                        targetSlice.setXY( [xPos, yPos] );
                    }
                }
                
                this._slices = Node.all( SLICE_SELECTOR );

                this._slices.each( function(slice, k) {
                    var ddSource = new Y.DD.Drag({
                        node: slice
                    });

                    ddSource.after( "drag:end", Y.bind( this._afterDragEnd, this, ddSource ) );
                }, this );

                this._btnShuffle.removeAttribute( "disabled" );

                Y.later( 0, this, function(){
                    Y.one( "body" ).removeChild( image );
                }, this );
            }, this ), image );

            Y.on( "error", Y.bind( function(){
                alert( 'Image cannot be loaded!' );
            }, this ), image );

            image.setAttribute( "src", imageURI );

            Y.one( "body" ).appendChild( image );
        },

        _shufflePuzzle : function(e){
            var shuffleAction, oldPos = {}, newPos = {},
                row, cell, sliceWidth, sliceHeight, offsetX, offsetY, map = [],
                i, j, newX, newY, pos;

            this._slices.each( function(slice, k) {
                 oldPos[ slice ] = slice.getXY();
            }, this );

            sliceWidth = this._sliceWidth;
            sliceHeight = this._sliceHeight;

            offsetX = this._destX + this._destNodeWidth + 10;
            offsetY = this._destY;

            for( i = 0; i < this._cells; i++ ){
                map[i] = [];
                for( j = 0; j < this._rows; j++ ){
                    map[i][j] = false;
                }
            }

            this._slices.each( function(slice, k) {
                do {
                    cell = Math.floor(Math.random() * this._cells);
                    row = Math.floor(Math.random() * this._rows);
                } while( map[row][cell] );

                map[row][cell] = true;

                newX = cell * sliceWidth + offsetX;
                newY = row * sliceHeight + offsetY;

                pos = [newX, newY];
                slice.setXY( pos );
                newPos[slice] = pos;
            }, this );

            shuffleAction = new Y.Puzzle.ShuffleAction({
                label: "Shuffling slices",
                slices: this._slices,
                oldPositions: oldPos,
                newPositions: newPos
            });

            this._undoManager.add( shuffleAction );
        },


        _afterDragEnd : function( dd, e ){
            var mouseXY, slice, row, cell, target, mouseXPos, mouseYPos,
                i = 0, j = 0, sliceWidth, sliceHeight, destX, destY,
                pos, newX, newY, moveAction;

            mouseXY = dd.mouseXY;
            mouseXPos = mouseXY[0];
            mouseYPos = mouseXY[1];

            destX = this._destX;
            destY = this._destY;

            slice = dd.get( "node" );

            if( mouseXPos >= destX && mouseXPos <= destX + this._destNodeWidth &&
                mouseYPos >= destY && mouseYPos <= destY + this._destNodeHeight ){

                sliceWidth = this._sliceWidth;
                sliceHeight = this._sliceHeight;

                target = this._getSliceTarget( mouseXPos, mouseYPos );
                row = target[0];
                cell = target[1];

                if( cell >= 0 && row >= 0 ){
                    newX = cell * sliceWidth + destX;
                    newY = row * sliceHeight + destY;

                    pos = [newX, newY];
                    slice.setXY( pos );
                }
            } else {
                pos = dd.realXY;
            }

            moveAction = new Y.Puzzle.MoveAction({
                label: "Move slice (id = " + slice.get( "id" ) + ")",
                'slice': slice, 
                oldPos: dd.nodeXY,
                newPos: pos
            } );

            this._undoManager.add( moveAction );
        },


        _getSliceTarget : function( mouseXPos, mouseYPos ){
            var i, j, destX, destY, cell = -1, row = -1, sliceWidth, sliceHeight;

            sliceWidth = this._sliceWidth;
            sliceHeight = this._sliceHeight;
            destX = this._destX;
            destY = this._destY;

            for( i = 0; i < this._cells; i++ ){
                if( mouseXPos <= (i*sliceWidth) + sliceWidth + destX ){
                    cell = i;
                    break;
                }
            }

            for( j = 0; j < this._rows; j++ ){
                if( mouseYPos <= (j*sliceHeight) + sliceHeight + destY ){
                    row = j;
                    break;
                }
            }

            return [row, cell];
        },

        _onUndo : function(e){
            this._undoManager.undo();
        },

        _onRedo : function(e){
            this._undoManager.redo();
        },

        _updateUI : function(){
            var options, undoIndex;

            this._undoManager.canUndo() ?
                this._btnUndo.removeAttribute( DISABLED ) :
                this._btnUndo.setAttribute( DISABLED, true );

            this._undoManager.canRedo() ?
                this._btnRedo.removeAttribute( DISABLED ) :
                this._btnRedo.setAttribute( DISABLED, true );

            options = this._actionView.options;
            undoIndex = this._undoManager.get( "undoIndex" );

            options[ undoIndex ].selected = true;
        },

        _onActionAdded : function( action ){
            var options, option;
            options = this._actionView.options;

            option = document.createElement( "option" );
            option.text = action.get( "label" );
            option.value = options.length;
            option.setAttribute( "selected", "true" );
            options.add( option );

            this._updateUI();
        },

        _onUndoFinished : function(){
            this._updateUI();
        },

        _onRedoFinished : function(){
            this._updateUI();
        },

        _onActionViewSelectionChange : function( e ){
            var selectedAction = this._actionView.selectedIndex;

            this._undoManager.processTo( selectedAction );
        },

        _onActionCanceled : function( params ){
            var undoIndex;

            this._actionView.remove( params.index + 1 );

            undoIndex = this._undoManager.get( "undoIndex" );
            this._actionView.options[ undoIndex ].selected = true;
        },

        _onSetLimitClick : function( e ){
            this._undoManager.set( "limit", parseInt( this._txtLimit.get( "value" ), 10 ) );
        }
    } );

    Y.Puzzle = Puzzle;


    /*
     * Puzzle MoveAction implementation
     */
    var NEWPOS = "newPos",
        SLICE  = "slice";

    function MoveAction(config){
        MoveAction.superclass.constructor.apply( this, arguments );
    }

    MoveAction.NAME = "MoveAction";

    MoveAction.ATTRS = {
        slice : {
            value : null,
            validator : function( value ){
                return value instanceof Y.Node;
            }
        },

        oldPos : {
            value : null,
            validator : Lang.isArray
        },

        newPos : {
            value : null,
            validator : Lang.isArray
        }

    };

    
    Y.extend( MoveAction, Y.UndoableAction, {

        initializer : function( config ){
        },

        undo : function(){
            var oldPos = this.get( "oldPos" );

            this._updateSlicePos( oldPos );
        },

        redo : function() {
            var newPos = this.get( NEWPOS );

            this._updateSlicePos( newPos );
        },

        merge : function( newAction ) {
            var oldSlice, newSlice, newPos;

            if( newAction instanceof MoveAction ){
                newSlice = newAction.get( SLICE );
                oldSlice = this.get( SLICE );
                
                if( oldSlice === newSlice ){
                    newPos = newAction.get( NEWPOS );
                    this.set( NEWPOS, newPos );
                    return true;
                }
            }

            return false;
        },

        _updateSlicePos : function( pos ){
            var slice = this.get( SLICE );

            slice.setXY( pos );
        }
    } );

    Y.Puzzle.MoveAction = MoveAction;
    
    
    
    /*
     * Puzzle ShuffleAction implementation
     */
    
    function ShuffleAction(config){
        ShuffleAction.superclass.constructor.apply( this, arguments );
    }

    ShuffleAction.NAME = "ShuffleAction";

    ShuffleAction.ATTRS = {
        slices: {
            value: null,
            validator: function( value ){
                return value instanceof Y.NodeList;
            }
        },

        oldPositions: {
            value: null,
            validator: Lang.isObject
        },
        
        newPositions: {
            value: null,
            validator: Lang.isObject
        }
    };

    
    Y.extend( ShuffleAction, Y.UndoableAction, {

        initializer : function( config ){
        },

        undo : function(){
            var oldPositions = this.get( "oldPositions" );
            
            this._updateSlicesPos( oldPositions );
        },

        redo : function() {
            var newPositions = this.get( "newPositions" );
            
            this._updateSlicesPos( newPositions );
        },

        _updateSlicesPos : function( positions ){
            var slices = this.get( "slices" );

            slices.each( function(slice, k) {
                var slicePos = positions[slice];
                
                slice.setXY( slicePos );
            }, this );
        }
    } );

    Y.Puzzle.ShuffleAction = ShuffleAction;


    /*
     * Instantiate the Puzzle
     */
    var puzzle = new Y.Puzzle({
        partsPerSide : 4
    });
});
