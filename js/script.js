
    var map;
    var markers = [];

     var locations = [
            {id: 1, title: 'London Bridge', location: {lat: 51.507827, lng: -0.087705}},
            {id: 2, title: 'St Katharine Marina', location: {lat: 51.506467, lng: -0.071531}},
            {id: 3, title: 'Tower of London', location: {lat: 51.508091, lng: -0.076234}},
            {id: 4, title: 'Shakespeare Globe', location: {lat: 51.508053, lng: -0.097294}},
            {id: 5, title: 'Crosse Keys', location: {lat: 51.512624, lng: -0.083912}}
    ];


    var columns = [{
    value: 'id'
}, {
    value: 'title'
}];

var GoogleMarkers = [];

var Filtering = function (locations, columns) {
    var self = this;

    // Observe the locations array
    self.items = ko.observableArray(locations);
    // Observer the columns array
    self.columns = ko.observableArray(columns);
    // Set the filter field as an observable
    self.filter = ko.observable();

    // This is the filtered result
    self.filteredItems = ko.computed(function () {
        // Filter is equal to an observable
        var filter = self.filter();
        // If filter not true
        if (!filter) {
            // Returns all the items
            return self.items();
        } else {
            return ko.utils.arrayFilter(self.items(), function (item) {
                //console.log('Filtering on Item');
                var result = ko.utils.arrayFilter(self.columns(), function (c) {
                    var val = item[c.value];
                    if (typeof val === 'number') {
                        val = val.toString();
                    }
                    //console.log('Filtering on Column');
                    var sub_result = val.toLowerCase().indexOf(filter.toLowerCase()) > -1;
                    return sub_result;
                });
                // returns true
                //updatedGoogleLocations(result);
                return !!result.length;
            });
        }
    });
    console.log(self.filteredItems);

    };

    ko.applyBindings(new Filtering(locations, columns));

    function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 51.505458, lng: -0.075280},
        zoom: 13
        });

        var largeInfowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();

        for (var i = 0; i < locations.length; i++) {
            // Get the position from the location array.
            var position = locations[i].location;
            var title = locations[i].title;
            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
            });
            marker.addListener('click', function() {
                toggleBounce(this)
            });

            // Push the marker to our array of markers.
            markers.push(marker);
            // Create an onclick event to open an infowindow at each marker.
            marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            });
            bounds.extend(markers[i].position);
            }
        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);

        // This function populates the infowindow when the marker is clicked. We'll only allow
        // one infowindow which will open at the marker that is clicked, and populate based
        // on that markers position.
        function populateInfoWindow(marker, infowindow) {
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

        //Animate marker
        function toggleBounce(marker) {
            if (marker.getAnimation() !== null) {
              marker.setAnimation(null);
            } else {
              marker.setAnimation(google.maps.Animation.BOUNCE);
              setTimeout(function(){marker.setAnimation(null)}, 2000);
            }
      }
    }
