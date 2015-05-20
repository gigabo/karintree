import sys
import json
import requests

tree = json.load(sys.stdin)

cache = {}
base = 'https://www.walkscore.com/auth/score/get-data'
def geocode(s):
  if s not in cache:
    cache[s] = requests.get(base, params={'q':s, 'req':'gd'}).json().get('gd') or {}
  if 'lat' in cache[s]:
    return [cache[s].get('lat'), cache[s].get('lng')]

for node in tree.values():
  for t in ['birt', 'deat']:
    s = node.get(t+'-plac')
    if s:
      node[t+'-ll'] = geocode(s)

print json.dumps(tree, indent=4)
