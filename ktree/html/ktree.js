var map, data;

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
    mapTypeId : google.maps.MapTypeId.ROADMAP,
    center    : {lat: 42.5292597, lng: -71.3495046},
    zoom      : 3,
  });
}

function receiveData(d){
  data = d;
  dive(1);
}

function dive(id){
  if (!id) return;

  var node = data[id]
  ,   ll   = node['birt-ll']

  if (!ll) return;

  ll = new google.maps.LatLng(ll[0], ll[1]);

  new google.maps.Marker({
    position : ll,
    map      : map,
    icon     : {
      path         : google.maps.SymbolPath.CIRCLE,
      fillColor    : 'red',
      fillOpacity  : 1,
      strokeWeight : 0,
      scale        : 8,
    },
  });

  (node.p||[]).forEach(function(id){
    dive(id)
  });

  return ll;
}
