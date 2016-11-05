/** This module leverages the Google Geocoding API to transform a zip code
  * into latitude and longitude data. It is subscribed to the form module.
  * It publishes its location data to pass to Google Maps and eBird APIs.
  */
var getTheLocation = (function(){

  // Declare variables.
  var myLocation = {};

  render();

  // Makes the AJAX request to convert Zip (from a published form object) to lat/lng.
  function getGeo(newForm){
    // make and send an XmlHttpRequest
    var xhr = new XMLHttpRequest();
    xhr.open("GET","http://maps.googleapis.com/maps/api/geocode/json?address="+newForm.zipCode, true);
    xhr.send();

    // set up a listener for the response
    xhr.onreadystatechange=function(){
      if (this.readyState==4 && this.status==200){
        var l = JSON.parse(this.response).results[0].geometry.location;
        if (l.lat) {
          myLocation.lat = l.lat;
        }
        if (l.lng) {
          myLocation.lng = l.lng;
        }
        // Publish geolocation object to pubsub.
        events.emit('getLocation', myLocation);
      }
    }
  }

  /** This function is called on click of the page's get current location button.
    * It uses JavaScript's .getCurrentPosition method to get the current location
    * of the user, if allowed.
  */
  function getLocation(){
    if(navigator.geolocation){
       // timeout at 60000 milliseconds (60 seconds)
       var options = {timeout:60000};
       navigator.geolocation.getCurrentPosition(getPosition, errorHandler, options);
    }

    else{
       alert("Sorry, browser does not support geolocation!");
    }
  }

  /** This function converts the position returned in the reverse geocoder into
    * a latLng geoObject and passes that into the writeZipCode function.
    */
  function getPosition(position){
    console.log(position);
    var currentLoc = {lat: position.coords.latitude, lng: position.coords.longitude};
    events.emit('newGeoObj', currentLoc);

    writeZipCode(currentLoc);
  }


  /** This function uses Google's reverse geocoder API to convert the map's
    * current latLng geoObject into a zipcode and publish that to the zip code.
    */
  function writeZipCode(geoObj){
    var geocoder = new google.maps.Geocoder;

    geocoder.geocode({'latLng': geoObj}, function(results, status){
      if (status == google.maps.GeocoderStatus.OK) {
        var address = results[0].address_components;
        for (var i = 0; i<address.length; i++){
          // find results that can be coerced to number, and whose length is 5
          // AKA find a zipcode in the address components.
          if (parseInt(address[i].long_name) && address[i].long_name.length == 5) {
            var zip = address[i].long_name;
            events.emit('zipCodeFromDrag', zip);
          }
        }
      }
    });
  }

  // Use this function as an argument in the getLocation function.
  function errorHandler(err) {
            if(err.code == 1) {
               console.log("Error: Access is denied!");
            }

            else if( err.code == 2) {
               console.log("Error: Position is unavailable!");
            }
         }

   /** This is a render function invoked earlier in the module to collect necessary
     * DOM elements on the page and attach event listeners to those DOM elements.
     * It also subscribes to all published data to the pubsub class.
     */
  function render(){
    // Access DOM elements.
    var submit = document.getElementById('submit');
    var logLocation = document.getElementById('logLocation');
    logLocation.addEventListener('click', getLocation)

    // Subscribe to pubsub data.
    events.on('getFormData', getGeo);
  }


})();
