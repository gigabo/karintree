require('readline').createInterface({input: process.stdin}).on('line', slurp);
process.stdin.on('end', spit);

var byId = {}
,   lvl  = null
,   fam  = null
,   cur  = null
,   sta  = null

function slurp(line){
  lvl = line[0]

  if (0 == lvl){
    cur = fam = sta = null;
    var tup = (line.match(/@\w(.+?)@\s+(\w+)\s*$/)||[]);
    if ('INDI' == tup[2]){
      byId[tup[1]] = cur = {id: tup[1], p: []};
    } else if ('FAM' == tup[2]){
      fam = [];
    }
  }
  if (cur) doCur(line);
  if (fam) doFam(line);

}

function doCur(line){
  if (1 == lvl){
    sta = null;
    proc({
      NAME : setProp('name'),
      SEX  : setProp('sex'),
      BIRT : setStat('birt'),
      DEAT : setStat('deat'),
    })(line);
  }
  if (!sta) return;

  if (2 == lvl){
    if ('birt' == sta || 'deat' == sta){
      proc({
        PLAC : setProp(sta+'-plac'),
        DATE : setProp(sta+'-date'),
      })(line);
    }
  }
}

function doFam(line){
  proc({
    HUSB: setParent(0),
    WIFE: setParent(1),
    CHIL: setChild,
  })(line);
}

function setParent(i){ return function(v){ fam[i] = v.match(/(\d+)/)[1] } }
function setChild (v){ byId[v.match(/(\d+)/)[1]].p = fam.slice() }

function proc(map){
  return function(line){
    var tup = line.match(/\d\s+(\w+)\s*(.*)$/)||[];
    if (!tup) return;
    (map[tup[1]]||function(){})(tup[2]);
  }
}

function setProp(prop){ return function(value){ cur[prop] = value } }
function setStat(stat){ return function(     ){ sta       = stat  } }

function spit(){ console.log(JSON.stringify(byId, null, '\t')) }
