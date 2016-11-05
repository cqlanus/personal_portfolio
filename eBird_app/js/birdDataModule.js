/** This module controls the getting of bird data and writing it to the page
  * via the sidebar. It also controls all functionality of the sidebar, like
  * toggling details, highlighting text, and indicating birds at specific
  * locations.
  */
var findTheBirds = (function(){

  // Declare variables that will be manipulated within the module.
  var birdData;
  var daysAgo;
  var newRadius;
  render();

  // This function clears the sidebar.
  function clearBox(){
    output.innerHTML = '';
  }

  /** This is the major function the makes the AJAX request to the eBird API
    * It takes a geolocation object (with a latitude and longitude) as an
    * argument, and passes that as well as the daysAgo input value into the
    * AJAX request URL.
    *
    * After successful AJAX request, it parses the data, publishes it to the
    * pub/sub class, and writes the data to the page.
    */
  function findNearbyBirds(geoObj){
    var theRadius = newRadius || 7
    var myLatLng = geoObj;
    clearBox();
    var xhr = new XMLHttpRequest();

    xhr.open("GET",'http://ebird.org/ws1.1/data/obs/geo/recent?lng='+myLatLng.lng+'&lat='+myLatLng.lat+'&dist='+theRadius+'&back='+daysAgo.value+'&maxResults=500&locale=en_US&fmt=json',true);

    xhr.send();

    // set up a listener for the response
    xhr.onreadystatechange=function(){
      if (this.readyState==4 && this.status==200){
        birdData = JSON.parse(this.response);
        // console.log(birdData);
        events.emit('birdData', birdData)
        writeBirdData(birdData);
        console.log('findNearbyBirds')
      }
    }
  }

  /** This function is supposed to make an AJAX request to the eBird API to look
    * for nearby sightings of a specific species. At this point, it is able to pass
    * in a normalized scientific bird name from the autcomplete input, as well as the
    * daysAgo input value, into the AJAX request URL. Then parses through the JSON
    * data and writes it to the page.
    */
  function findBirdsBySpecies(geoObj){
    var theRadius = newRadius || 7
    var myLatLng = geoObj;
    var speciesName = theSciName;
    var speciesNameArray = splitName(speciesName);
    clearBox();
    var xhr = new XMLHttpRequest();

    xhr.open("GET",'http://ebird.org/ws1.1/data/obs/geo_spp/recent?lng='+myLatLng.lng+'&lat='+myLatLng.lat+' &sci='+speciesNameArray[0]+'%20'+speciesNameArray[1]+'&dist='+theRadius+'&back='+daysAgo.value+'&maxResults=500&locale=en_US&fmt=json&includeProvisional=true',true);

    xhr.send();

    // set up a listener for the response
    xhr.onreadystatechange=function(){
      if (this.readyState==4 && this.status==200){
        birdData = JSON.parse(this.response);
        // console.log(birdData);
        events.emit('birdData', birdData)
        writeBirdData(birdData);
        console.log('findBirdsBySpecies')
      }
    }
  }

  /** This function checks if the species filter checkbox has been checked. If so,
    * findBirdsBySpecies will run, otherwise, findNearbyBirds will run.
    */
  function checkSearchCriteria(speciesFilter){
    if (speciesFilter == false){
      events.on('getLocation', findNearbyBirds);
      events.off('getLocation', findBirdsBySpecies);
      events.on('newGeoObj', findNearbyBirds);
      events.off('newGeoObj', findBirdsBySpecies);

      console.log('findNearbyBirds should work. speciesFilter = '+ speciesFilter)
    }
    else{
      events.on('getLocation', findBirdsBySpecies);
      events.off('getLocation', findNearbyBirds);
      events.on('newGeoObj', findBirdsBySpecies);
      events.off('newGeoObj', findNearbyBirds);

      console.log('findBirdsBySpecies should work. speciesFilter = '+ speciesFilter)

    }
  }


  /** This function checks if the filter by species checkbox is checked.
    */
  var speciesFilterOn;
  function checkSpeciesFilter(speciesFilter){
    if (speciesFilter == true){
      speciesFilterOn = true
      return speciesFilterOn;
    }
    else {
      speciesFilterOn = false;
      return speciesFilterOn;
    }
  }


  /** This function writes all bird data to page. It creates DOM elements
    * based on the birdData passed into the function as an argument. It writes the
    * name of the bird as one element and the bird details as a separate element.
    * The bird details are hidden via CSS.
    */
  function writeBirdData(birdData){

    if(birdData.length == 0){
      var noBirds = `<div class='panel panel-primary'>
                      <div class='panel-heading'>
                        <h3 class='panel-title'>No birds found in this area!</h3>
                      </div>
                    </div>`
      createTextNode('DIV', noBirds)
    }
    else{
      for (var i = 0; i<birdData.length; i++){
        // Normalize names for links
        var latinString = normalizeName(birdData[i].sciName);
        var commString = normalizeName(birdData[i].comName);

        // Create text nodes with most bird info
        var text = `<li class='list-group-item'><span class='listTitle'>Common name:</span> <a href="https://www.allaboutbirds.org/guide/${commString}">${birdData[i].comName}</a></li>
        <li class='list-group-item'><span class='listTitle'>Latin name:</span> <a href="https://en.wikipedia.org/wiki/${latinString}">${birdData[i].sciName}</a></li>
        <li class='list-group-item'><span class='listTitle'>How many:</span> ${birdData[i].howMany}</li>
        <li class='list-group-item'><span class='listTitle'>Location:</span> ${birdData[i].locName}</li>
        <li class='list-group-item'><span class='listTitle'>Date:</span> ${birdData[i].obsDt}</li>`;


        // Handle if finding birds by by species (then write location to name)
        // or by location (write bird names to page)
        if(speciesFilterOn == true){
          var message = `<div class='panel panel-primary'>
                          <div class='panel-heading'>
                            <h3 class='panel-title' id='${i}'>${i+1}.  ${birdData[i].locName}</h3>
                          </div>
                          <div class='panel-body birdDetails hidden' id='${i}birdDetails>
                            <p>${text}</p>
                          </div>
                        </div> `;
          var div1 = createTextNode('DIV', message);
        }
        else {
          var message = `<div class='panel panel-primary'>
                          <div class='panel-heading bird' id='${i}bird'>
                            <h3 class='panel-title' id='${i}'>${i+1}.  ${birdData[i].comName}</h3>
                          </div>
                          <ul class='panel-body birdDetails hidden list-group' id='${i}birdDetails'>
                            ${text}
                          </ul>
                        </div> `;
          var div1 = createTextNode('DIV', message);
        }
      }
    }
  }

  // This function defines how textNodes are created on the page.
  // It takes an element name (string) and a message (string) as arguments.
  function createTextNode(el, msg){
    var div = document.createElement(el);
    var t = document.createTextNode(msg);
    div.innerHTML = msg;
    output.appendChild(div);
    return div;
  }


  /** This function allows user to toggle visibility of birdDetails
    * by manipulating the class name of the element. It takes an event as
    * an argument.
    */
  function toggleBirdDetails(e){
    var index = parseInt(e.target.id);
    // console.log(index);
    var element = document.getElementById(index+'birdDetails');
    if ($(element).hasClass('hidden')){
      $(element).removeClass('hidden');
    }
    else {
      $(element).addClass('hidden');
    }

  }

  /** This function uses the location of a map marker (published to the pub/sub)
    * as an argument and changes the styles of the bird element if it matches.
    */
  function findBirdsByLocation(birdLoc){
    var birdDivs = document.getElementsByClassName('bird');
    for (var i = 0; i < birdData.length; i++){
      birdDivs[i].style.borderStyle = "";
      birdDivs[i].style.borderColor = "#337ab7";
      birdDivs[i].style.backgroundColor = "#337ab7";

      if (birdData[i].locName == birdLoc){
        birdDivs[i].style.borderStyle = "solid";
        birdDivs[i].style.borderColor = "#f0ad4e";
        birdDivs[i].style.backgroundColor = "#f0ad4e";
      }
    }
  }

  /** This function takes the map's current zoom as an argument, then adjusts the
    * the radius value, to be passed into the eBird AJAX request. The limits on
    * the radius value are a response to the eBird radius limits.
    */
  function setSearchRadius(currentZoom){
    var startZoom = 12;
    var newZoom = currentZoom;
    var zoomDiff = (newZoom - startZoom);
    var startRadius = 7;
    newRadius = (startRadius - (2*zoomDiff));
    if (newRadius < 1){
      newRadius = 1;
    }
    else if (newRadius > 50){
      newRadius = 50;
    }
    console.log(newRadius);
    return newRadius;
  }

  /** This function normalizes bird names to be used in URLs.
    */
  function normalizeName(birdDataObj){
    var splitTheName = splitName(birdDataObj);
    // Joins the array with underscore
    var combinedName = splitTheName.join('_');
    // console.locombinedNameg(combinedName);
    return combinedName;
  }

  /** This function takes a bird name as a string, removes apostrophes, then
    * splits the string into an array of strings.
    */
  function splitName(birdDataObj){
    // Removes apostrophes
    var theName = birdDataObj.replace("'", "");
    // Splits into an array
    var splitTheName = theName.split(' ');
    return splitTheName;
  }

  /** This function will be called upon to return the scientific name published
    * by the autocomplete module. This module will use the sciName in the ebird
    * AJAX request to find birds by species.
    */
  var theSciName = "test";
  function getSciName(sciName){
    theSciName = sciName
    console.log(theSciName);
    return theSciName;
  }

  /** This is a render function invoked earlier in the module to collect necessary
    * DOM elements on the page and attach event listeners to those DOM elements.
    * It also subscribes to all published data to the pubsub class.
    */
  function render(){
    // Access DOM elements;
    var output = document.getElementById('output');
    daysAgo = document.getElementById('date');
    var species = document.getElementById('species');
    var birdNames = document.getElementsByClassName('bird');

    // Attach event listeners
    daysAgo.addEventListener('change', function(){
      daysAgoValue = this.value;
    })

    $("#output").click(toggleBirdDetails);

    // Subscribe to necessary published data
    events.on('getLocation', findNearbyBirds);
    events.on('newGeoObj', findNearbyBirds);
    events.on('currentMarker', findBirdsByLocation);
    events.on('resetBtn', clearBox);
    events.on('mapZoom', setSearchRadius);
    events.on('speciesFilter', checkSearchCriteria);
    events.on('speciesFilter', checkSpeciesFilter);
    events.on('theSciName', getSciName)
  }

})();
