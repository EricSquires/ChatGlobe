function organizeData(chatData) {
  var organized = [];
  
  for( var i = 0; i < chatData.length; i++ ) {
    organized.push(chatData[i].latitude);
    organized.push(chatData[i].longitude);
    organized.push(1);
  }
  
  return organized;
}

// Where to put the globe?
var container = document.getElementById( 'globe' );

// Make the globe
var globe = new DAT.Globe( container );

// We're going to ask a file for the JSON data.
var xhr = new XMLHttpRequest();

// Where do we get the data?
xhr.open( 'GET', 'sample-chat-data.json', true );

// What do we do when we have it?
xhr.onreadystatechange = function() {

    // If we've received the data
    if ( xhr.readyState === 4 && xhr.status === 200 ) {

        // Parse the JSON
        var data = JSON.parse( xhr.responseText );

        // Tell the globe about your JSON data
        globe.addData( organizeData(data), {format: 'magnitude'} );

        // Create the geometry
        globe.createPoints();

        // Begin animation
        globe.animate();

    }

};

// Begin request
xhr.send( null );