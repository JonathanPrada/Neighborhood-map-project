////////////////////////////////////////////
// Set up Data
var model = {
    // Set the current location as empty
    currentLocation: null,
    // Store the locations in an Array of Objects
    locations: [{
            title: 'HMS Belfast',
            location: {
                lat: 51.506559,
                lng: -0.081314
            }
        },
        {
            title: 'London Bridge',
            location: {
                lat: 51.507827,
                lng: -0.087705
            }
        },
        {
            title: 'St Katharine Docks',
            location: {
                lat: 51.506467,
                lng: -0.071531
            }
        },
        {
            title: 'Tower Bridge',
            location: {
                lat: 51.504307,
                lng: -0.076176
            }
        },
        {
            title: 'Millennium Bridge',
            location: {
                lat: 51.509529,
                lng: -0.098543
            }
        },
        {
            title: 'City of London',
            location: {
                lat: 51.512344,
                lng: -0.090985
            }
        },
        {
            title: 'Tower of London',
            location: {
                lat: 51.508091,
                lng: -0.076234
            }
        },
        {
            title: 'Shakespeare Globe',
            location: {
                lat: 51.508053,
                lng: -0.097294
            }
        }
    ],
    // Holds our filtered location markers
    visibleMarkers: []
};

////////////////////////////////////////////

// Google API Map View
var mapView = {

    // Gets called per place
    addGoogleMarkers: function(place, map, largeInfoWindow) {
        var markerOptions = {
            map: map,
            position: place.location,
            title: place.title,
            animation: google.maps.Animation.DROP,
        };

        place.marker = new google.maps.Marker(markerOptions);

        place.marker.addListener('click', function() {
            mapView.addAnimation(place.marker);
        });

        mapView.addInfoWindow(place.marker, largeInfoWindow);

    },

    // Adds animation to each marker
    addAnimation: function(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 1400); // Two bounces each at 700ms
        }
    },

    // Add infoWindow to each marker
    addInfoWindow: function(marker, largeInfowindow) {
        marker.addListener('click', function() {
            mapView.populateInfoWindow(marker, largeInfowindow);
        });
    },

    // Populate the info window of each marker
    populateInfoWindow: function(marker, infowindow) {

        var wikiurl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' +
            marker.title + '&format=json&callback=wikiCallback';

        var wikiRequestTimeout = setTimeout(function() {
            alert("failed to load wikipedia resources");
        }, 8000);

        $.ajax({
            url: wikiurl,
            dataType: "jsonp",

            success: function(response) {
                // Get some info
                var markerWikiInfo = (response[2]);
                // Check to make sure the infowindow is not already opened on this marker.
                if (infowindow.marker != marker) {
                    infowindow.marker = marker;
                    // Insert the info
                    infowindow.setContent('<div>' + markerWikiInfo + '</div>');
                    infowindow.open(map, marker);
                    // Make sure the marker property is cleared if the infowindow is closed.
                    infowindow.addListener('closeclick', function() {
                        infowindow.setMarker = null;
                    });
                }
                clearTimeout(wikiRequestTimeout);
            },
        });
    }
};

////////////////////////////////////////////

// The List viewModel
var listView = {
    visiblePlaces: ko.observableArray(),
    userInput: ko.observable(''),

    init: function() {
        listView.transferMarkers();
        listView.buildMarkers();
        listView.visiblePlacesFirst();
        listView.filterMarkers();
    },

    transferMarkers: function() {
        // For each of the locations in our model
        model.locations.forEach(function(place) {
            //Push into the markers array
            model.visibleMarkers.push(new listView.Place(place));
        });
    },

    // Build the markers based on our visible Markers
    buildMarkers: function() {
        var largeInfoWindow = new google.maps.InfoWindow();

        var map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: 51.505458,
                lng: -0.075280
            },
            zoom: 14
        });

        model.visibleMarkers.forEach(function(place) {
            mapView.addGoogleMarkers(place, map, largeInfoWindow);
        });
    },

    // For each visible marker, push into visible places
    visiblePlacesFirst: function() {
        model.visibleMarkers.forEach(function(place) {
            listView.visiblePlaces.push(place);
        });
    },

    // Filter our visible places list here based on input
    filterMarkers: function() {
        var searchInput = listView.userInput().toLowerCase();

        listView.visiblePlaces.removeAll();

        model.visibleMarkers.forEach(function(place) {
            place.marker.setVisible(false);

            if (place.title.toLowerCase().indexOf(searchInput) !== -1) {
                listView.visiblePlaces.push(place);
            }
        });

        listView.visiblePlaces().forEach(function(place) {
            place.marker.setVisible(true);
        });

    },

    //Gets called at every transferMarkers for each iteration
    Place: function(place) {
        this.title = place.title;
        this.location = place.location;
        this.marker = null;
    }
};

ko.applyBindings(listView);

////////////////////////////////////////////

// Error handling for Google
function googleError() {
    alert("the data can't be loaded");
}

// Start the program, function used for Google API
function initMap() {
    // Call the controller init method
    listView.init();
}

function listClick(data) {
    var infowindow = new google.maps.InfoWindow();
    data.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
        data.marker.setAnimation(null);
    }, 1400);
    mapView.populateInfoWindow(data.marker, infowindow);
};