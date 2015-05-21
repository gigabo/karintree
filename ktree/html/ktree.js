var map, data, bounds, iw, maxGen;
var places = {};

function googleReady(){
  fetchData();
  initMap();
}

function fetchData(){
  $.ajax({
    url     : '/data.json',
    success : receiveData,
  })
}

function initMap(){
  map = new google.maps.Map(document.getElementById('map'), {
    styles: getStyle()
  });
  bounds = new google.maps.LatLngBounds();
  iw = new google.maps.InfoWindow();
  google.maps.event.addListener(map, 'click', function(){
    iw.close();
  });
}

function receiveData(d){
  data = d;
  dive(1);
  Object.keys(places).forEach(function(k){ places[k].init() });
  map.fitBounds(bounds);
}

function cleanName(name){
  return (name||'').split(', ').filter(function(v){ return v }).join(', ');
}

function dive(id, gen){
  if (!id) return;

  gen || (gen = 0);

  var node = data[id]
  ,   ll   = node['birt-ll']
  ,   pnam = cleanName(node['birt-plac'])
  ,   pl   = (ll||[]).join('_')

  if (!ll) return;

  node.pl = pl

  ll = new google.maps.LatLng(ll[0], ll[1]);

  bounds.extend(ll);

  if (!places[pl]){
    var init = function(){
      var marker = new google.maps.Marker({
        position : ll,
        map      : map,
        icon     : {
          path         : google.maps.SymbolPath.CIRCLE,
          fillColor    : color(places[pl].maxGen),
          fillOpacity  : 1,
          strokeWeight : 1,
          scale        : 4+places[pl].people.length,
        },
      });
      google.maps.event.addListener(marker, 'mouseover', function(){
        if (!places[pl].didSort){
          places[pl].didSort = true;
          places[pl].people.sort(function(a, b){
            return a['birt-epoch'] - b['birt-epoch'];
          });
        }
        iw.setContent(
          '<h3>'+pnam+'</h3><table>'+places[pl].people.map(function(person){
            return (
              '<tr><td class="name">'+person.name+
              '</td><td class="date">'+(person['birt-date']||'unknown')+
              '</td><td class="gen">'+person.generation+
              '</td></tr>'
            )
          }).join('')+'</table>'
        );
        iw.setPosition(ll);
        iw.open(map);
      });
    }
    places[pl] = {
      people : [],
      init   : init,
    };
  }

  node.generation = gen;

  places[pl].people.push(node);

  places[pl].maxGen = Math.max((places[pl].maxGen||0), gen);
             maxGen = Math.max((           maxGen||0), gen);

  (node.p||[]).forEach(function(id){
    var pnt = dive(id, gen+1);
    if (!pnt || node.pl == data[id].pl) return;
    new google.maps.Polyline({
      map           : map,
      path          : [pnt, ll],
      geodesic      : true,
      strokeColor   : '#000000',
      strokeOpacity : 1.0,
      strokeWeight  : 1,
      icons         : [{
        offset : '50%',
        icon   : {
          path         : google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale        : 2,
          strokeWeight : 1,
          fillOpacity  : 1,
        },
      }]
    })
  });

  return ll;
}

function color(gen){
  if (0 == gen)
    return '#BB47F1';
  var r = (255*(gen/maxGen))|0
  ,   g = 255-r
  return 'rgb('+r+','+g+',0)'
}

function getStyle(){
  // From https://snazzymaps.com/style/15/subtle-grayscale
  return [
    {
      "featureType": "landscape",
      "stylers": [
        { "saturation": -100 },
        { "lightness": 65 },
        { "visibility": "on" }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        { "saturation": -100 },
        { "lightness": 51 },
        { "visibility": "simplified" }
      ]
    },
    {
      "featureType": "road.highway",
      "stylers": [
        { "saturation": -100 },
        { "visibility": "simplified" }
      ]
    },
    {
      "featureType": "road.arterial",
      "stylers": [
        { "saturation": -100 },
        { "lightness": 30 },
        { "visibility": "on" }
      ]
    },
    {
      "featureType": "road.local",
      "stylers": [
        { "saturation": -100 },
        { "lightness": 40 },
        { "visibility": "on" }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        { "saturation": -100 },
        { "visibility": "simplified" }
      ]
    },
    {
      "featureType": "administrative.province",
      "stylers": [
        { "visibility": "off" }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels",
      "stylers": [
        { "visibility": "on" },
        { "lightness": -25 },
        { "saturation": -100 }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        { "hue": "#ffff00" },
        { "lightness": -25 },
        { "saturation": -97 }
      ]
    }
  ]
}
