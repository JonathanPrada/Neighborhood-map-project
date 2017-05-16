////////////////////////////////////////////

//1. Stores Data
var model = {
    //1.1 Set the current location as empty
    currentLocation: null,
    //1.2 Store the locations in an Array of Objects
    locations: [
            {id: 1, title: 'London Bridge', location: {lat: 51.507827, lng: -0.087705}},
            {id: 2, title: 'St Katharine Marina', location: {lat: 51.506467, lng: -0.071531}},
            {id: 3, title: 'Tower of London', location: {lat: 51.508091, lng: -0.076234}},
            {id: 4, title: 'Shakespeare Globe', location: {lat: 51.508053, lng: -0.097294}},
            {id: 5, title: 'Crosse Keys', location: {lat: 51.512624, lng: -0.083912}}
    ],
    //1.3 Holds our map markers
    markers: [],
    //1.4 Column layout
    columns: [{value: 'id'}, {value: 'title'}]
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
        //3.1.1 Point the current location to the hard coded locations
        model.currentLocations = model.locations;
        //3.1.2 Initialize the View: "mapView"
        mapView.init();
    },

    //3.2 Returns all the model locations
    returnLocations: function () {
        return model.locations.slice();
    },

    returnColumns: function () {
        return model.columns;
    },

    //3.3 Adds to the markers array in the model
    addToMarkers: function(marker) {
        model.markers.push(marker)
    },

    //3.4 Returns a copy of locations filtered by search result
    updatedMarkers: function () {

    }

};

////////////////////////////////////////////

//4. Google API Map View
var mapView = {

    //4.1 Initialize the below when called
    init: function () {
        //4.1.1 Render the initial map onto our HTML
        mapView.initMap();
    },

    //4.2 Set the google map up
    initMap: function () {
        //4.2.1 Set up variables for our map
        var map;
        var largeInfowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();

        //4.2.2 Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 51.505458, lng: -0.075280},
            zoom: 14
        });

        //4.2.3 Pass in the map, largeInfowindow to the next method
        mapView.setMarkers(map, largeInfowindow, bounds);

    },

    //4.3 Creates the markers on the map
    setMarkers: function(map, largeInfowindow, bounds) {
        //4.3.1 Ask the controller to return the location data
        var locationData = controller.returnLocations();

        //4.3.2 Loop through every location in our array of objects
        for (var i = 0; i < locationData.length; i++) {
            //4.3.2.1 Get the Latitude and Longitude from the individual model.location[index].property
            var position = locationData[i].location;
            //4.3.2.2 Get the Title from the individual model.location[index].property
            var title = locationData[i].title;
            //4.3.2.3 Create a marker at every iteration
            var marker = new google.maps.Marker({
                map: map,
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                id: i
            });

            //4.3.2.4 Add an animation to each marker
            marker.addListener('click', function() {
                mapView.addAnimation(marker)
            });

            //4.3.2.5 Add to the markers array in the model
            controller.addToMarkers(marker);

            //4.3.2.6 Pass the marker in this iteration to addListener
            mapView.addInfoWindow(marker, largeInfowindow);
        }
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
var locations =  controller.returnLocations();

//5. The List viewModel
var viewModel = {
  locations: ko.observableArray(controller.returnLocations()),
  query: ko.observable(''),

    search: function(value) {
    // remove all the current locations, which removes them from the view
    viewModel.locations.removeAll();

    for(var x in locations) {
      if(locations[x].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        viewModel.locations.push(locations[x]);
      }
    }
  }
};

viewModel.query.subscribe(viewModel.search);

ko.applyBindings(viewModel);
