function setupGlobe(organizeFun, colorFun) {
  // Where to put the globe?
  var container = document.getElementById( 'globe' );

  // Make the globe
  var globe = new DAT.Globe( container, { imgDir: 'img/', colorFn: colorFun } );

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
          globe.addData( organizeFun(data), {format: 'magnitude'} );

          // Create the geometry
          globe.createPoints();

          // Begin animation
          globe.animate();

      }

  };

  // Begin request
  xhr.send( null );
}

// Perform necessary DOM manipulation for transition to new globe
function navTo(id) {
  $('nav .active').removeClass('active');
  $(id).addClass('active');
}

function organizeAverage(chatData, prop) {
  var organized = [];
  var maxVal = 1;
  
  _.each(chatData, function(chat) {
    // Skip any chat items that didn't record the property
    if(!chat[prop]) {
      return;
    }
    
    // Look for an existing entry for the latitude and longitude of the current chat item. If we've already recorded
    // data for that location, simply update that entry
    var entry = _.find(organized, function(orgEntry) {
      return chat.latitude === orgEntry.latitude && chat.longitude === orgEntry.longitude;
    })
    
    if(maxVal < chat[prop]) {
      maxVal = chat[prop];
    }
    
    if(entry) {
      entry.total_score += chat[prop];
      entry.total_elements++;
    }
    else {
      organized.push({ latitude: chat.latitude, longitude: chat.longitude, total_score: chat[prop], total_elements: 1 });
    }
  });
  
  
  var ret = _.flatten(_.map(organized, function(entry) {
    // We divide by maxVal here in order to normalize the data and get it to fit better in the globe visualization
    return [entry.latitude, entry.longitude, entry.total_score / (maxVal * entry.total_elements)]
  }));
  return ret;
}

// Organizes data for the globe according to the survey scores submitted
function organizeSurveyData(chatData) {
  return organizeAverage(chatData, 'survey_score');
}

// Colors data accordingly for survey data
function surveyColorFunction(data) {
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

function gotoSurvey() {
  navTo('#nav-survey');
  setupGlobe(organizeSurveyData, surveyColorFunction);
}

function organizeWaitData(chatData) {
  return organizeAverage(chatData, 'chat_waittime');
}

function gotoWaitTime() {
  navTo('#nav-wait');
  setupGlobe(organizeWaitData);
}

function organizeDurationData(chatData) {
  return organizeAverage(chatData, 'chat_duration');
}

function gotoDuration() {
  navTo('#nav-duration');
  setupGlobe(organizeDurationData);
}

function organizeMessageData(chatData) {
  var organized = [];
  var maxVal = 1;
  
  _.each(chatData, function(chat) {
    // Skip any chat items that didn't record the property
    if(!chat.transcript) {
      return;
    }
    
    // Look for an existing entry for the latitude and longitude of the current chat item. If we've already recorded
    // data for that location, simply update that entry
    var entry = _.find(organized, function(orgEntry) {
      return chat.latitude === orgEntry.latitude && chat.longitude === orgEntry.longitude;
    })
    
    if(entry) {
      entry.total_score += chat.transcript.length;
      
      if(maxVal < entry.total_score) {
          maxVal = entry.total_score;
      }
    }
    else {
      organized.push({ latitude: chat.latitude, longitude: chat.longitude, total_score: chat.transcript.length, total_elements: 1 });
      
      if(maxVal < chat.transcript.length) {
          maxVal = chat.transcript.length;
      }
    }
  });
  
  
  var ret = _.flatten(_.map(organized, function(entry) {
    // We divide by maxVal here in order to normalize the data and get it to fit better in the globe visualization
    return [entry.latitude, entry.longitude, entry.total_score / (maxVal * entry.total_elements)]
  }));
  return ret;
}

function gotoTranscripts() {
    navTo('#nav-transcripts');
    setupGlobe(organizeMessageData);
}

gotoSurvey();
