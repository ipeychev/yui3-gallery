YUI().use( 'gallery-undo', function(Y) {

    var Lang = Y.Lang,
        Node = Y.Node,
        CLICK = "click",
        DISABLED = "disabled",
        GMAPS = google.maps;

    function Drawing( config ){
        Drawing.superclass.constructor.apply( this, arguments );
    }

    Drawing.NAME = "Google drawing";

    Y.extend( Drawing, Y.Base, {
        initializer: function( config ){
            var varnaBGPos = new GMAPS.LatLng( 43.210806,27.912397 );

            this._map = new GMAPS.Map( Node.getDOMNode(Y.one("#map")), {
                mapTypeId: GMAPS.MapTypeId.HYBRID,
                center: varnaBGPos,
                zoom: 14

            });

            this._undoManager = new Y.UndoManager();

            this._undoManager.subscribe( "actionAdded", Y.bind( this._onActionAdded, this ) );
            this._undoManager.subscribe( "undoFinished", Y.bind( this._onUndoFinished, this ) );
            this._undoManager.subscribe( "redoFinished", Y.bind( this._onRedoFinished, this ) );

            this._btnUndo = Y.one( "#btn-undo" );
            this._btnRedo = Y.one( "#btn-redo" );

            this._btnUndoHandler = this._btnUndo.on( CLICK, Y.bind( this._onUndo, this ) );
            this._btnRedoHandler = this._btnRedo.on( CLICK, Y.bind( this._onRedo, this ) );

            this._updateUI();

            this._polyline = new GMAPS.Polyline({
              path: [],
              strokeColor: "#FF0000",
              strokeOpacity: 1.0,
              strokeWeight: 2
            });

            this._polyline.setMap( this._map );

            GMAPS.event.addListener( this._map, 'click', Y.bind( this._addPoint, this ));
        },

        _addPoint : function( e ){
            var drawAction, path, curIndex;

            path = this._polyline.getPath();
            curIndex = path.getLength();
            path.insertAt( curIndex, e.latLng );

            var marker = new GMAPS.Marker({
                position: e.latLng,
                map: this._map,
                title: e.latLng.toString()
            });

            drawAction = new DrawAction({
                label : "Point added at: " + e.latLng,
                asyncProcessing: true,
                map : this._map,
                zoomLevel : this._map.getZoom(),
                center : this._map.getCenter(),
                'path': path,
                'marker' : marker,
                index: curIndex,
                position: e.latLng
            });

            this._undoManager.add( drawAction );
        },

        _onUndo : function(e){
            this._btnUndo.set( "disabled", true );
            this._btnRedo.set( "disabled", true );

            this._undoManager.undo();
        },

        _onRedo : function(e){
            this._btnUndo.set( "disabled", true );
            this._btnRedo.set( "disabled", true );

            this._undoManager.redo();
        },

        _updateUI : function(){
            this._undoManager.canUndo() ?
                this._btnUndo.removeAttribute( DISABLED ) :
                this._btnUndo.setAttribute( DISABLED, true );

            this._undoManager.canRedo() ?
                this._btnRedo.removeAttribute( DISABLED ) :
                this._btnRedo.setAttribute( DISABLED, true );
        },

        _onActionAdded : function( action ){
            this._updateUI();
        },

        _onUndoFinished : function(){
            this._updateUI();
        },

        _onRedoFinished : function(){
            this._updateUI();
        }
    });

    Y.Drawing = Drawing;


    /*
     * Add polyline action implementation
     */

    function DrawAction(config){
        DrawAction.superclass.constructor.apply( this, arguments );
    }

    DrawAction.NAME = "DrawAction";

    DrawAction.ATTRS = {
        map : {
            value : null,
            validator: function( value ){
                return value instanceof GMAPS.Map;
            }
        },

        center : {
            value : null,
            validator : function(value){
                return value instanceof GMAPS.LatLng;
            }
        },

        zoomLevel : {
            value : null,
            validator : Lang.isNumber
        },

        path: {
            value : null,
            validator: function( value ){
                return value instanceof GMAPS.MVCArray;
            }
        },

        marker: {
            value : null,
            validator : function(value){
                return value instanceof GMAPS.Marker;
            }
        },

        index : {
            value : null,
            validator : Lang.isNumber
        },

        position : {
            value : null,
            validator : function(value){
                return value instanceof GMAPS.LatLng;
            }
        }
    };


    Y.extend( DrawAction, Y.UndoableAction, {

        initializer : function( config ){
        },

        undo : function(){
            var map, index, zoomLevel, path, center, marker;

            map = this.get( "map" );
            index = this.get( "index" );
            path = this.get( "path" );
            zoomLevel = this.get( "zoomLevel" );
            center = this.get( "center" );
            marker = this.get( "marker" );

            path.removeAt( index );
            marker.setMap( null );

            if( map.getCenter().equals( center ) && map.getZoom() === zoomLevel ){
                /*
                 * Google Maps API3 will not fire any event in this situation, so we should fire undoFinished event manually
                 */
                this.fire( "undoFinished" );
            } else {
                this._idleHandler = GMAPS.event.addListener( map, 'idle', Y.bind( function(){
                    GMAPS.event.removeListener( this._idleHandler );
                    this.fire( "undoFinished" );
                }, this ) );

                map.setCenter( center );
                map.setZoom( zoomLevel );
            }
        },

        redo : function() {
            var map, index, zoomLevel, path, center, marker, position;

            map = this.get( "map" );
            index = this.get( "index" );
            path = this.get( "path" );
            zoomLevel = this.get( "zoomLevel" );
            center = this.get( "center" );
            marker = this.get( "marker" );
            position = this.get( "position" );

            path.insertAt( index, position );
            marker.setMap( map );

            if( map.getCenter().equals( center ) && map.getZoom() === zoomLevel ){
                /*
                 * Google Maps API3 will not fire any event in this situation, so we should fire undoFinished event manually
                 */
                this.fire( "redoFinished" );
            } else {
                this._idleHandler = GMAPS.event.addListener( map, 'idle', Y.bind( function(){
                    GMAPS.event.removeListener( this._idleHandler );
                    this.fire( "redoFinished" );
                }, this ) );

                map.setCenter( center );
                map.setZoom( zoomLevel );
            }
        }
    } );

    Y.Drawing.DrawAction = DrawAction;

    var googleDrawing = new Drawing();
});
