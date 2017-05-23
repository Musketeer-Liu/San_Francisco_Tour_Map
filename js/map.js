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
