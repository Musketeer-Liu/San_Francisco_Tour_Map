// ----Model----
// Initiate Site Data via place_id
var initialSites = [
    "EipHb2xkZW4gR2F0ZSBCcmlkZ2UsIFNhbiBGcmFuY2lzY28sIENBLCBVU0E",
    "ChIJAQAAQIyAhYARRN3yIQG4hd4",
    "ChIJueOuefqAhYARapAU-YtbztA",
    "ChIJRb6WFtWGhYARLN9EOlXR2JI",
    "ChIJ_T25cNd_j4ARehGmHe0pT84",
    "ChIJmRyMs_mAhYARpViaf6JEWNE",
    "ChIJSU5pvf2FhYARuDOFwnkMzfM",
    "ChIJt3HwrOJ9j4ARbW6uAcmhz7I",
    "ChIJY_dFYHKHhYARMKc772iLvnE",
    "ChIJY-bqepmAhYARSk9Xg_9tcLI"
];

// Model for each single site
var Site = function(data) {
    this.placeId = data.place_id;
    this.name = data.name;
    this.address = data.formatted_address;
    this.url = data.website;

    this.marker = new google.maps.Marker({
        map: map,
        title: data.name,
        position: data.geometry.location;
        animation: google.maps.Animation.BOUNCE
    });

    this.viewText = "";
    this.viewUrl = "";
    this.wikiText = "";
    this.wikiUrl = "";
    this.nytText = "";
    this.nytUrl = "";
}


// ----ViewModel----
var ViewModel = function() {
    var self = this

    // --Build infowindows and components--
    // Build infowindow layout template
    var windowLayout = '<div id="info"'
                     + 'data-bind="template: { '
                         + 'name: \'window-model\', '
                         + 'data: currentSite '
                     + '}">'
                     + '</div>';
    this.infowindow = new google.maps.InfoWindow({
        content: windowLayout
    });

    // Bind infowindow to Knockout
    var loaded = false;
    google.maps.event.addListener(this.infowindow,
                                  'domready',
                                  function() {
        if(!loaded) {
            ko.applyBindings(self, $('#info')[0]);
            loaded = true;
        }
    });
    this.site = ko.observableArray();
    this.currentSite = ko.observable(this.sites()[0]);

    // --Retrieve details--
    // Geo Data from google maps places library
    initialSites.forEach(function(placeId) {
        var query = new google.maps.places.PlacesService(map);
        query.getDetails({
            placeId: placeId
        }, function(place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                var newSite = new Site(place);

                // Google streetview image
                $.ajax({
                    url: "http://maps.googleapis.com/maps/api/streetview?",
                    data: {
                        "size": "400x200",
                        "location": newSite.name
                    },
                    dataType: 'jsonp',
                    success: function(result) {
                        newSite.viewUrl = result[1][0];
                    },
                    error: function(error) {
                        newSite.viewText = "Cannot achieve streetview"
                    }
                });

                // Wikipedia info with link
                $.ajax({
                    url: "https://en.wikipedia.org/w/api.php?",
                    data: {
                        "action": "opensearch",
                        "format": "json",
                        "search": newSite.name
                    },
                    dataType: 'jsonp',
                    success: function(result) {
                        newSite.wikiText = result[2][0];
                        newSite.wikiUrl = result[3][0];
                    },
                    error: function(error) {
                        newSite.wikiText = "Cannot reach Wikipedia"
                    }
                });

                // NY Times news with link
                $.ajax({
                    url: "http://api.nytimes.com/svc/search/v2/"
                         + "articlesearch.json?",
                    data: {
                        "api-key"="a1f0af3853034860b76d8402243cefd7",
                        "q": newSite.name
                    },
                    dataType: 'jsonp',
                    success: function(result) {
                        newSite.nytText = result[5][0];
                        newSite.nytUrl = result[6][0];
                    },
                    error: function(error) {
                        newSite.nytText = "Cannot reach NY Times"
                    }
                });

                newSite.marker.addListener('click', function() {
                    self.handleClick(newSite);
                });

                self.sites.push(newSite);
            } else {
                alert("Site List is messed");
            }
        });
    });


    // --Filter site with connected marker--
    this.filter = ko.observable("");
    this.selectedSites = ko.computed(function() {
        var select = self.filter().toLowerCase();
        if (!select) {
            // Set all site visible with no input
            self.sites().forEach(function(site) {
                return site.marker.setVisible(true);
            });
            return self.sites().filter(function(site) {
                var selected = site.name
                .toLowerCase()
                .indexOf(select) >= 0;
                site.marker.setVisible(selected);
                return selected;
            });
        }
    });


    // --Event Handle--
    //Setup current site, infowindow and marker
    this.handleClick = function(site) {
        map.panTo(site.marker.getPosition());
        self.currentSite(site);
        self.changeColor(site.marker);
        self.openInfo(site.marker, self.infowindow);
    }

    // Change current maker color upon click
    this.changeColor = function(marker) {
        var color = 'https://www.google.com/mapfiles/marker_purple.png'
        marker.setIcon(color);
        setTimeout(function() {
            marker.setIcon(null)
        }, 3500);
    }

    // Bind current infowindow to marker
    this.openInfo = function(marker, window) {
        if (window.marker != marker) {
            window.marker = marker;
            window.open(map, marker);
        }
    }

    // Open detail panel
    this.openDetail = ko.observable();
    this.detail = function() {
        var detail = self.openDetail(!self.openDetail());
        return detail;
    }
}