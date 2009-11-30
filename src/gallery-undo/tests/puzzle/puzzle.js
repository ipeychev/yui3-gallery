
var Y = new YUI().use( 'dd-drag', 'gallery-undo', function(Y) {
    this._images = Y.Node.all('.img-slice');

    this._destNode = Y.get( "#images-dest" );
    this._destX = this._destNode.getX();
    this._destY = this._destNode.getY();

    this._destNodeWidth  = this._destNode.get( "clientWidth" );
    this._destNodeHeight = this._destNode.get( "clientHeight" );

    this._imgWidth = this._images.item(0).get( "clientWidth" );
    this._imgHeight = this._images.item(0).get( "clientHeight" );

    this._rows = this._destNodeHeight / this._imgHeight;
    this._cells = this._destNodeWidth / this._imgWidth;

    this._images.each( function(image, k) {
        var ddSource = new Y.DD.Drag({
            node: image
        });

        ddSource.after( "drag:end", Y.bind( afterDragEnd, this, ddSource ) );
    }, this );

    Y.one( "#btn-shuffle" ).on( "click", Y.bind( shufflePuzzle, this ) );
    
    this._undoManager = new Y.UndoManager();

    this._btnUndo = Y.one( "#btn-undo" );
    this._btnRedo = Y.one( "#btn-redo" );

    updateUI.call( this );

    this._btnUndo.on( "click", Y.bind( onUndo, this ) );
    this._btnRedo.on( "click", Y.bind( onRedo, this ) );

    function shufflePuzzle(e){
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

        shuffleAction = new Y.UndoableAction();
        shuffleAction.undo = Y.bind( updateImagesPos, this, oldPos );
        shuffleAction.redo = Y.bind( updateImagesPos, this, newPos );

        this._undoManager.add( shuffleAction );
        updateUI.call( this );
    }

    function afterDragEnd( dd, e ){
        var mouseXY, image, row = -1, cell = -1, mouseXPos, mouseYPos,
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

            if( cell >= 0 && row >= 0 ){
                newX = cell * imgWidth + destX;
                newY = row * imgHeight + destY;
                
                pos = [newX, newY];
                image.setXY( pos );
            }
        } else {
            pos = dd.realXY;
        }
        
        moveAction = new Y.UndoableAction();
        moveAction.undo = Y.bind( updateImagePos, this, image, dd.nodeXY );
        moveAction.redo = Y.bind( updateImagePos, this, image, pos );

        this._undoManager.add( moveAction );
        updateUI.call( this );
    }


    function onUndo(e){
        this._undoManager.undo();
        updateUI.call( this );
    }

    function onRedo(e){
        this._undoManager.redo();
        updateUI.call( this );
    }

    function updateUI(){
        this._undoManager.canUndo() ? 
            this._btnUndo.removeAttribute( "disabled" ) :
            this._btnUndo.setAttribute( "disabled", true );

        this._undoManager.canRedo() ?
            this._btnRedo.removeAttribute( "disabled" ) :
            this._btnRedo.setAttribute( "disabled", true );
    }

    function updateImagesPos( positions ){
        this._images.each( function(image, k) {
            var imagePos = positions[image];

            updateImagePos.call( this, image, imagePos );
        }, this );
    }


    function updateImagePos( image, pos ){
        image.setXY( pos );
    }
});