function organizeSurveyData(chatData) {
  var organized = [];
  
  _.each(chatData, function(chat) {
    if(!chat.survey_score) {
      return;
    }
    
    var entry = _.find(organized, function(orgEntry) {
      return chat.latitude === orgEntry.latitude && chat.longitude === orgEntry.longitude;
    })
    
    if(entry) {
      entry.total_score += chat.survey_score;
      entry.total_elements++;
    }
    else {
      organized.push({ latitude: chat.latitude, longitude: chat.longitude, total_score: chat.survey_score, total_elements: 1 });
    }
  });
  
  var ret = _.flatten(_.map(organized, function(entry) { return [entry.latitude, entry.longitude, entry.total_score / (100 * entry.total_elements)] }));
  console.log(ret);
  return ret;
}

function colorFunction(data) {
  if(data >= .75) {
    return new THREE.Color(0x55FF55);
  }
  
  if(data >= .5) {
    return new THREE.Color(0xDDFFAA);
  }
  
  if(data >= .25) {
    return new THREE.Color(0xFF5555);
  }
  
  return new THREE.Color(0xFF0000);
}

// Where to put the globe?
var container = document.getElementById( 'globe' );

// Make the globe
var globe = new DAT.Globe( container, { imgDir: 'img/', colorFn: colorFunction } );

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
        globe.addData( organizeSurveyData(data), {format: 'magnitude'} );

        // Create the geometry
        globe.createPoints();

        // Begin animation
        globe.animate();

    }

};

// Begin request
xhr.send( null );