
var outdoorMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var greyScaleMap =  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  })
  //.addTo(earthQuakeMap);

var faultLines = {};
var earthquakes = {};

d3.json(DATA_URL, data => {
  earthquakes = L.geoJson(data, {
    pointToLayer: function (feature, latLong) {
      var color = deriveColor(feature.properties.mag.toFixed(3))
      var currentMarkerProperties = {
        radius: 5 * feature.properties.mag,
        fillColor: color,
        color: "black",
        weight: 1,
        fillOpacity: 0.7
    };
      return L.circleMarker(latLong, currentMarkerProperties);
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup(createPopup(feature.properties));
    }
    })

    d3.json(TECTONIC_PLATES_URL, data => {
      faultLines = L.geoJson(data, {
         color: "#ffa500"
      })     
      createMap();
    });

});

function deriveColor(magnitude) {
  return magnitude >= 5 ? '#EF3E3E' :
         magnitude >= 4 ? '#EF863E' :
         magnitude >= 3 ? '#EFD93E' :
         magnitude >= 2 ? '#E2EF3E' :
         magnitude >= 1 ? '#BAEF3E' :
         magnitude >= 0 ? '#8FEF3E' :
                          '#ffffff';
}

function createPopup(details) {
  return `
  <h4>${details.title}</h4>
  <b>Code: </b>${details.code}<br>  
  <b>Time: </b>${new Date(details.time).toLocaleString()}<br>
  <b>Magnitude: </b>${details.mag}<br>
  <a href="${details.url}" target="_blank">More details</a>
  `;
}

function addLegend(earthQuakeMap) {
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {
  
    var div = L.DomUtil.create('legend', 'legend'),
        labels= ["0-1","1-2","2-3","3-4","4-5","5+"];
  
    div.innerHTML += `<b> Magnitude</b><br>`;
    // loop through our density intervals and generate a label with a colored square for each interval  
    const totalLegends = 6
    for (var i = 0; i < totalLegends; i++) {
        div.innerHTML += '<div><i style="background:' + deriveColor(i) + '"> </i>' + labels[i] + '</div><br>';
    }
    return div;
  }  
  legend.addTo(earthQuakeMap);
}

function createMap() {
//define baseMap object to hold base layers
var baseMaps = {
  "Satellite": satelliteMap,
  "GreyScale": greyScaleMap,
  "Outdoor" : outdoorMap
}  

// create overlayObject to hold our overlay layer
var overlayMaps = {
  "Fault Line": faultLines,
  "Earthquakes" : earthquakes
}

// Create a map object
var defaultMap = L.map("map", {
  center: [37.0902, -95.7129],
  zoom: 5,
  layers: [outdoorMap, faultLines, earthquakes]
});

addLegend(defaultMap);

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(defaultMap);
}
