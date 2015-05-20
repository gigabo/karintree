var moment = require('moment');
var tree = JSON.parse(require('fs').readFileSync('/dev/stdin').toString());

Object.keys(tree).forEach(function(id){
  ['birt', 'deat'].forEach(function(t){
    var s = tree[id][t+'-date'];
    if (s) {
      tree[id][t+'-epoch'] = moment(s)/1000||null;
    }
  });
});

console.log(JSON.stringify(tree, null, '\t'));
