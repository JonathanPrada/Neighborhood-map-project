////////////////////////////////////////////

//1. Stores Data
var model = {
    //1.1 Set the current location as empty
    currentLocation: null,
    //1.2 Store the locations in an Array of Objects
    locations: [
            {title: 'Crosse Keys', location: {lat: 51.512624, lng: -0.083912}},
            {title: 'London Bridge', location: {lat: 51.507827, lng: -0.087705}},
            {title: 'St Katharine Marina', location: {lat: 51.506467, lng: -0.071531}},
            {title: 'Tower of London', location: {lat: 51.508091, lng: -0.076234}},
            {title: 'Shakespeare Globe', location: {lat: 51.508053, lng: -0.097294}}
    ],
    //1.3 Holds our map markers
    markers: [],
    //1.4 Holds our filtered location markers
    visibleMarkers: []
};

////////////////////////////////////////////

//2. Start the program, function used for Google API
function initMap() {
    //2.1 Call the controller init method
    controller.init();
}

////////////////////////////////////////////

//3. Start all of the code, coordinate model to the views communication
var controller = {

    //3.1 Initialize the below when called
    init: function() {
        //3.1.2 Initialize the View: "mapView"
        //mapView.init();
        //3.1.1 Point the current location to the hard coded locations
        listView.init();

    },

    //3.2 Returns all the model locations
    returnLocations: function () {
         return model.locations.slice();
    },

    //3.3 Adds to the markers array in the model
    addToMarkers: function(marker) {
        model.markers.push(marker)
    }

};

////////////////////////////////////////////

//4. Google API Map View
var mapView = {

    //Gets called per place
    addGoogleMarkers: function(place, map, largeInfoWindow) {
        var markerOptions = {
            map: map,
            position: place.location,
            title: place.title,
            animation: google.maps.Animation.DROP,
        };

        place.marker = new google.maps.Marker(markerOptions);

        place.marker.addListener('click', function(){
            mapView.addAnimation(place.marker);
        });

        mapView.addInfoWindow(place.marker, largeInfoWindow);

    },

    //4.4 Adds animation to each marker
    addAnimation: function(marker){
        if (marker.getAnimation() !== null) {
          marker.setAnimation(null);
        } else {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){marker.setAnimation(null)}, 2000);
        }
    },

    //4.5 Add infoWindow to each marker
    addInfoWindow: function(marker, largeInfowindow) {
        marker.addListener('click', function() {
            mapView.populateInfoWindow(marker, largeInfowindow);
        });
    },

    //4.6 Populate the info window of each marker
    populateInfoWindow: function (marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick',function(){
            infowindow.setMarker = null;
            });
        }
    }
};

////////////////////////////////////////////

//5. The List viewModel
var listView = {
    visiblePlaces: ko.observableArray(),
    userInput: ko.observable(),

    init: function () {
      listView.transferMarkers();
      listView.buildMarkers();
      listView.visiblePlacesFirst();
      listView.filterMarkers();
     },

    transferMarkers: function () {
        //For each of the locations in our model
        model.locations.forEach(function (place) {
                //Push into the markers array
                model.visibleMarkers.push(new listView.Place(place))
        });
    },

    //Build the markers based on our visible Markers
    buildMarkers: function () {
        var largeInfoWindow = new google.maps.InfoWindow();

        var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 51.505458, lng: -0.075280},
            zoom: 14
        });

        model.visibleMarkers.forEach(function (place) {
            //console.log(place);
            mapView.addGoogleMarkers(place, map, largeInfoWindow);
        })
    },

    visiblePlacesFirst: function(){
        model.visibleMarkers.forEach(function (place) {
            listView.visiblePlaces.push(place);
        })
    },

    filterMarkers: function () {
      var searchInput = listView.userInput().toLowerCase();

      listView.visiblePlaces.removeAll();

      model.visibleMarkers.forEach(function (place) {
          place.marker.setVisible(false);

          if(place.title.toLowerCase().indexOf(searchInput) !== -1){
              listView.visiblePlaces.push(place);
          }
      });

      listView.visiblePlaces().forEach(function (place) {
          place.marker.setVisible(true);
      });

    },

    //Gets called at every transferMarkers for each iteration
    Place: function (place) {
        this.title = place.title;
        this.location = place.location;
        this.marker = null;
    }
};

ko.applyBindings(listView);