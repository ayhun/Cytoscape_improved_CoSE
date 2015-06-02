$(function(){ // on dom ready

var cy = cytoscape({
  container: document.getElementById('cy'),
  
  style: [
    {
      selector: 'node',
      css: {
        'content': 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center'
      }
    },
    {
      selector: '$node > node',
      css: {
        'padding-top': '10px',
        'padding-left': '10px',
        'padding-bottom': '10px',
        'padding-right': '10px',
        'text-valign': 'top',
        'text-halign': 'center'
      }
    },
    {
      selector: 'edge',
      css: {
        'target-arrow-shape': 'triangle'
      }
    },
    {
      selector: ':selected',
      css: {
        'background-color': 'black',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black'
      }
    }
  ],
  
  elements: {
    nodes: [
      { data: { id: 'a', parent: 'b' }, position : { x: 0, y: 0} },
      { data: { id: 'b' }, position : { x: 0, y: 0} },
      { data: { id: 'c', parent: 'b' }, position : { x: 0, y: 0} },
      { data: { id: 'd' }, position : { x: 0, y: 0} },
      { data: { id: 'e' }, position : { x: 0, y: 0} },
      { data: { id: 'f', parent: 'e' }, position : { x: 0, y: 0} }
    ],
    edges: [
      { data: { id: 'ad', source: 'b', target: 'd' } },
      { data: { id: 'eb', source: 'e', target: 'b' } },
      { data: { id: 'cd', source: 'c', target: 'd' } }
      
    ]
  },
  
  layout: {
    name: 'cose2',
    padding: 5
  }
});

}); // on dom ready