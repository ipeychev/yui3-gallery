
var Y = new YUI().use( 'dd-drag', function(Y) {
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

    Y.one( "#btn-start" ).on( "click", Y.bind( startPuzzle, this ) );


    function startPuzzle(e){
        var row, cell, imgWidth, imgHeight, offsetX, map = [], i, j;

        imgWidth = this._imgWidth;
        imgHeight = this._imgHeight;

        offsetX = this._destX + this._destNodeWidth + 10;

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

            image.setStyle( "left", cell * imgWidth + offsetX + "px" );
            image.setStyle( "top",  row * imgHeight + "px" );
        }, this );
    }

    function afterDragEnd( dd, e ){
        var mouseXY, node, row = -1, cell = -1, mouseXPos, mouseYPos,
            i = 0, j = 0, imgWidth, imgHeight, destX, destY;

        mouseXY = dd.mouseXY;
        mouseXPos = mouseXY[0];
        mouseYPos = mouseXY[1];

        destX = this._destX;
        destY = this._destY;

        if( mouseXPos >= destX && mouseXPos <= destX + this._destNodeWidth &&
            mouseYPos >= destY && mouseYPos <= destY + this._destNodeHeight ){

            imgWidth = this._imgWidth;
            imgHeight = this._imgHeight;
            node = dd.get( "node" );

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
                node.setStyle( "left", cell * imgWidth + "px" );
                node.setStyle( "top",  row * imgHeight + "px" );
            }
        }
    }
});