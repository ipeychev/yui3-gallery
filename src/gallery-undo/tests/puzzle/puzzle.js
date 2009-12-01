
YUI().add( 'puzzle', function( Y ){
    function Puzzle( config ){
        Puzzle.superclass.constructor.apply( this, arguments );
    }

    var IMAGE_SELECTOR = '.img-slice',
        IMAGES_DESTNODE = "#images-dest",
        CLIENT_WIDTH = "clientWidth",
        CLIENT_HEIGHT = "clientHeight",
        CLICK = "click",
        DISABLED = "disabled";

    Puzzle.NAME = "Puzzle";

    Puzzle.ATTRS = {

    };

    Y.extend( Puzzle, Y.Base, {

        initializer : function(cfg) {
            this._images = Y.Node.all( IMAGE_SELECTOR );
            this._destNode = Y.get( IMAGES_DESTNODE );
            this._destX = this._destNode.getX();
            this._destY = this._destNode.getY();

            this._destNodeWidth  = this._destNode.get( CLIENT_WIDTH );
            this._destNodeHeight = this._destNode.get( CLIENT_HEIGHT );

            this._imgWidth = this._images.item(0).get( CLIENT_WIDTH );
            this._imgHeight = this._images.item(0).get( CLIENT_HEIGHT );

            this._rows = this._destNodeHeight / this._imgHeight;
            this._cells = this._destNodeWidth / this._imgWidth;

            this._images.each( function(image, k) {
                var ddSource = new Y.DD.Drag({
                    node: image
                });

                ddSource.after( "drag:end", Y.bind( this._afterDragEnd, this, ddSource ) );
            }, this );

            this._shuffleHandler = Y.one( "#btn-shuffle" ).on( CLICK, Y.bind( this._shufflePuzzle, this ) );
            
            this._commandView = Y.Node.getDOMNode( Y.one( "#command-view" ) );
            Y.on( "change", Y.bind( this._onCommandViewSelectionChange, this ), this._commandView );

            this._undoManager = new Y.UndoManager();

            this._undoManager.subscribe( "actionAdded", Y.bind( this._onActionAdded, this ) );
            this._undoManager.subscribe( "undoFinished", Y.bind( this._onUndoFinished, this ) );
            this._undoManager.subscribe( "redoFinished", Y.bind( this._onRedoFinished, this ) );
            this._undoManager.subscribe( "actionCanceled", Y.bind( this._onActionCanceled, this ) );

            this._btnUndo = Y.one( "#btn-undo" );
            this._btnRedo = Y.one( "#btn-redo" );

            this._btnUndoHandler = this._btnUndo.on( CLICK, Y.bind( this._onUndo, this ) );
            this._btnRedoHandler = this._btnRedo.on( CLICK, Y.bind( this._onRedo, this ) );

            this._updateUI();
        },

        destructor : function() {
            this._shuffleHandler.detach();
            this._btnUndoHandler.detach();
            this._btnRedoHandler.detach();

            this._undoManager.destroy();

            this._images.each( function(image, k) {
                image.dd.destroy();
            }, this );
        },

        _shufflePuzzle : function(e){
            var shuffleAction, oldPos = {}, newPos = {},
                row, cell, imgWidth, imgHeight, offsetX, offsetY, map = [],
                i, j, newX, newY, pos;

            this._images.each( function(image, k) {
                 oldPos[ image ] = image.getXY();
            }, this );

            imgWidth = this._imgWidth;
            imgHeight = this._imgHeight;

            offsetX = this._destX + this._destNodeWidth + 10;
            offsetY = this._destY;

            for( i = 0; i < this._cells; i++ ){
                map[i] = [];
                for( j = 0; j < this._rows; j++ ){
                    map[i][j] = false;
                }
            }

            this._images.each( function(image, k) {
                do {
                    cell = Math.floor(Math.random() * this._cells);
                    row = Math.floor(Math.random() * this._rows);
                } while( map[row][cell] );

                map[row][cell] = true;

                newX = cell * imgWidth + offsetX;
                newY = row * imgHeight + offsetY;

                pos = [newX, newY];
                image.setXY( pos );
                newPos[image] = pos;
            }, this );

            shuffleAction = new Y.UndoableAction({
                label: "Shuffling images"
            });
            shuffleAction.undo = Y.bind( this._updateImagesPos, this, oldPos );
            shuffleAction.redo = Y.bind( this._updateImagesPos, this, newPos );

            this._undoManager.add( shuffleAction );
        },


        _afterDragEnd : function( dd, e ){
            var mouseXY, image, row, cell, target, mouseXPos, mouseYPos,
                i = 0, j = 0, imgWidth, imgHeight, destX, destY,
                pos, newX, newY, moveAction;

            mouseXY = dd.mouseXY;
            mouseXPos = mouseXY[0];
            mouseYPos = mouseXY[1];

            destX = this._destX;
            destY = this._destY;

            image = dd.get( "node" );

            if( mouseXPos >= destX && mouseXPos <= destX + this._destNodeWidth &&
                mouseYPos >= destY && mouseYPos <= destY + this._destNodeHeight ){

                imgWidth = this._imgWidth;
                imgHeight = this._imgHeight;

                target = this._getImageTarget( mouseXPos, mouseYPos );
                row = target[0];
                cell = target[1];

                if( cell >= 0 && row >= 0 ){
                    newX = cell * imgWidth + destX;
                    newY = row * imgHeight + destY;

                    pos = [newX, newY];
                    image.setXY( pos );
                }
            } else {
                pos = dd.realXY;
            }

            moveAction = new Y.UndoableAction({
                label: "Move image (id = " + image.get( "id" ) + ")"
            });
            moveAction.undo = Y.bind( this._updateImagePos, this, image, dd.nodeXY );
            moveAction.redo = Y.bind( this._updateImagePos, this, image, pos );

            this._undoManager.add( moveAction );
        },


        _getImageTarget : function( mouseXPos, mouseYPos ){
            var i, j, destX, destY, cell = -1, row = -1, imgWidth, imgHeight;

            imgWidth = this._imgWidth;
            imgHeight = this._imgHeight;
            destX = this._destX;
            destY = this._destY;

            for( i = 0; i < this._cells; i++ ){
                if( mouseXPos <= (i*imgWidth) + imgWidth + destX ){
                    cell = i;
                    break;
                }
            }

            for( j = 0; j < this._rows; j++ ){
                if( mouseYPos <= (j*imgHeight) + imgHeight + destY ){
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

            options = this._commandView.options;
            undoIndex = this._undoManager.get( "undoIndex" );

            options[ undoIndex ].selected = true;
        },

        _updateImagesPos : function( positions ){
            this._images.each( function(image, k) {
                var imagePos = positions[image];

                this._updateImagePos( image, imagePos );
            }, this );
        },

        _updateImagePos : function( image, pos ){
            image.setXY( pos );
        },

        _onActionAdded : function( action ){
            var options, option;
            options = this._commandView.options;

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

        _onCommandViewSelectionChange : function( e ){
            var selectedAction = this._commandView.selectedIndex;

            this._undoManager.processTo( selectedAction );
        },

        _onActionCanceled : function( params ){
            var undoIndex;

            this._commandView.remove( params.index + 1 );

            undoIndex = this._undoManager.get( "undoIndex" );
            this._commandView.options[ undoIndex ].selected = true;
        }
    } );

    Y.Puzzle = Puzzle;

}, '1.0', { requires: [ 'dd-drag', 'gallery-undo' ]} )