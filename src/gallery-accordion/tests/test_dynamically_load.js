
// Create new YUI instance, and populate it with the required modules
YUI({
    combine: false,
    debug: true,
    filter:"RAW"
}).use("gallery-accordion", 'test', 'console', 'event-simulate', function(Y) {
    this.accordion1 = new Y.Accordion( {
        boundingBox: "#bb1",
        contentBox: "#acc1",
        useAnimation: true,
        collapseOthersOnExpand: true
    });

    this.accordion1.render();

    this.accordion1.on( "beforeItemExpand", function( attrs ){
        var item = attrs.item;

        if( item.get('contentBox').get('id') === "item1" &&
            item.getStdModNode('body').get('children').size() === 0 ){
            item.set( "bodyContent", "<div>Loading, please wait...</div>" );

            Y.later(1000, this, function(){
                item.set( "bodyContent", "<div>Loading finished successfully!<br>This is the new content of the item.</div>" );
            });
        }
    }, this );
});

//////////////////////////////////////////////////////////////////////////////////////////
