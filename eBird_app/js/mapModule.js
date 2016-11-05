/** This module controls all functionality dealing with map on the page. It
  * handles the initiation of the map, any click or drag events on the map,
  * adding markers or infoboxes to the map, etc.
  */

var setTheMap = (function(){
  var map;
  var currentZoom;
  var markers = [];

  render();

  /** This function creates a Google map from the geolocation object passed in as an
    * argument. The argument is an object literal with lat and lng properties.
    * The function adds a drag event listener to the map and then publishes the
    * new map center to the pubsub in order to find birds at that new center.
    */
  window.initMap = function(geoObj) {
      var myLatLng = geoObj;

      map = new google.maps.Map(document.getElementById('myMap'), {
        zoom: currentZoom || 12,
        center: myLatLng
      });

      // This event listener finds the map center each time map is dragged
      map.addListener('dragend', function() {
        var newGeoObj = {
          lat: map.getCenter().lat(),
          lng: map.getCenter().lng()
        }
          // console.log(map.getZoom());
          // Publishes new map center
          events.emit('newGeoObj', newGeoObj);


          // Reverse geocoder acts to create and publish a zip code on each drag event
          writeZipCode(newGeoObj);
      });
      // console.log(myLatLng);

      map.addListener('zoom_changed', getMapZoom);
  }

  /** This function uses Google's reverse geocoder API to convert the latLng geoObj
    * to a zipCode, then publish it to the pubsub so that it can be written to
    * the zipCode input element on a map drag event.
    */
  function writeZipCode(geoObj){
    var geocoder = new google.maps.Geocoder;

    geocoder.geocode({'latLng': geoObj}, function(results, status){
      if (status == google.maps.GeocoderStatus.OK) {
        var address = results[0].address_components;
        for (var i = 0; i<address.length; i++){
          // find results that can be coerced to number, and whose length is 5
          if (parseInt(address[i].long_name) && address[i].long_name.length == 5) {
            var zip = address[i].long_name;
            events.emit('zipCodeFromDrag', zip);
          }
        }
      }
    });
  }

  /** This function is invoked when new bird data is found in the pubsub. Its job
    * is to pass in the birdData argument (an array of objects; each object
    * contains data from the eBird API, including the location of the bird sighting
    * and the name of the bird. Using these data, this function creates a marker
    * (and info window for each marker) on the map for each bird sighting, publishing
    * each marker to the pubsub so as to handle click events and write data to the sidebar.
    */
  function plotBirdData(birdData){

    // Loop through bird data.
    for (var i = 0; i<birdData.length; i++){
      // Create a new geoObj with lat and lng properties.
      var myLatLng = {lat: birdData[i].lat, lng: birdData[i].lng}
      // Use the location name as the title of each marker.
      var contentString = birdData[i].locName;

      // Generate a new marker for each item in the birdData array.
      var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
      var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: contentString,
        info: contentString
      });
      markers.push(marker);

      // And generate a new infowindow for each item in the birdData array.
      var infowindow = new google.maps.InfoWindow({
        maxWidth: 200
      });

      // Add a listener for a click event on the marker
      marker.addListener('click', function () {
        // On click, add the location name to the infowindow and open.
        infowindow.setContent(this.info);
        infowindow.open(map, this);
        // Publish the location name to manipulate the sidebar on each click.
        events.emit('currentMarker', this.info);
        });

    //  console.log(marker);
    }
  }

  // This function passes in the map that is generated on load.
  function getOnLoadMap(map){
    return map;
  }

  // Sets the map on all markers in the array.
  function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  function clearMarkers() {
    setMapOnAll(null);
  }

  // Shows any markers currently in the array.
  function showMarkers() {
    setMapOnAll(map);
  }

  // Deletes all markers in the array by removing references to them.
  function deleteMarkers() {
    clearMarkers();
    markers = [];
  }

  // This function gets and publishes map's current zoom.
  function getMapZoom(){
    currentZoom = map.getZoom();
    console.log(currentZoom);
    events.emit('mapZoom', currentZoom);
  }

  /** This is a render function invoked earlier in the module to collect necessary
    * DOM elements on the page and attach event listeners to those DOM elements.
    * It also subscribes to all published data to the pubsub class.
    */
  function render(){
    // Handling all the subscription to the pubsub module below.
    events.on('birdData', plotBirdData);
    events.emit('getMap', map);
    events.on('onLoadMap', getOnLoadMap);
    events.on('resetBtn', deleteMarkers)
  }

})();
