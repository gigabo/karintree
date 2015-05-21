var map, data, bounds, iw;
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
    mapTypeId : google.maps.MapTypeId.ROADMAP,
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

function dive(id){
  if (!id) return;

  var node = data[id]
  ,   ll   = node['birt-ll']
  ,   pnam = node['birt-plac']
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
          fillColor    : 'red',
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

  places[pl].people.push(node);

  (node.p||[]).forEach(function(id){
    var pnt = dive(id);
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
