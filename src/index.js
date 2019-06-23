import * as joint from 'jointjs'
import 'jointjs/dist/joint.css'
import _ from 'lodash'

console.log(joint)

var graph = new joint.dia.Graph;

var paper = new joint.dia.Paper({
  el: document.getElementById('myholder'),
  model: graph,
  width: 1080,
  height: 720,
  gridSize: 1,
  // drawGrid: true,
  background: {
    color: 'rgba(0,0,0,0.05)'
  }
});

window.graph = graph;

const diagramInfo = {
  tables: [
    {
      name: 'orders',
      fields: [
        {field: 'id', keyType: 'pk', type: 'string'},
        {field: 'customer_id', keyType: 'fk', type: 'string'},
        {field: 'product_id', keyType: 'fk', type: 'string'},
        {field: 'amount', type: 'number', checked: true},
      ]
    },
    {
      name: 'users',
      fields: [
        {field: 'id', keyType: 'pk', type: 'string'},
        {field: 'name', type: 'string', checked: true},
      ]
    },
    {
      name: 'products',
      fields: [
        {field: 'id', keyType: 'pk', type: 'string'},
        {field: 'name', type: 'string', checked: true},
      ]
    }
  ],
  joinLinks: [
    {
      source: 'orders/customer_id',
      target: 'users/id',
      type: 'innerJoin'
    },
    {
      source: 'orders/product_id',
      target: 'products/id',
      type: 'innerJoin'
    }
  ]
}

const cellWidth = 200;
let cellSets = diagramInfo.tables.map((t, i) => {
  let rowIdx = Math.floor(i / 3), colIdx = i % 3;
  let rootX = 50 + 300 * colIdx, rootY = 10 + 300 * rowIdx;

  let headeredRectangle = new joint.shapes.standard.HeaderedRectangle();
  headeredRectangle.resize(cellWidth, 30 + Math.max(30, _.size(t.fields) * 30));
  headeredRectangle.position(rootX, rootY);
  headeredRectangle.attr({
    root: { title: 'joint.shapes.standard.HeaderedRectangle' },
    header: { fill: 'lightgray' },
    headerText: { text: t.name },
    bodyText: { text: '' }
  });
  let fieldCells = t.fields.map((f, fi) => {
    let {field, keyType, type, checked} = f;
    let fieldCell;
    if (!keyType) {
      fieldCell = new joint.shapes.basic.Rect({
        position: {x: rootX, y: rootY + fi * 30 + 30},
        size: {width: cellWidth, height: 30},
        attrs: {
          rect: {fill: '#fff'},
          text: {text: field}
        }
      });
    } else {
      fieldCell = new joint.shapes.devs.Model({
        position: {x: rootX, y: rootY + fi * 30 + 30},
        size: { width: cellWidth, height: 30 },
        inPorts: keyType === 'pk' ? ['in'] : [],
        outPorts: keyType === 'fk' ? ['out'] : [],
        ports: {
          groups: {
            'in': {
              attrs: {
                '.port-body': { fill: '#16A085' }
              }
            },
            'out': {
              attrs: {
                '.port-body': { fill: '#E74C3C' }
              }
            }
          }
        },
        attrs: {
          '.label': { text: field, fontSize: 13 /*'ref-x': .5, 'ref-y': .2*/ },
          rect: { fill: '#fff' }
        }
      });
    }
    headeredRectangle.embed(fieldCell);
    return fieldCell
  })

  return [headeredRectangle, ...fieldCells]
})

cellSets.forEach(cs => {
  graph.addCells(cs)
})

function connect(source, sourcePort, target, targetPort) {
  var link = new joint.shapes.devs.Link({
    source: {
      id: source.id,
      port: sourcePort
    },
    target: {
      id: target.id,
      port: targetPort
    }
  });

  link.addTo(graph).reparent();
};


diagramInfo.joinLinks.forEach(jl => {
  let {source, target, type} = jl
  let [sTable, sField] = source.split('/')
  let [tTable, tField] = target.split('/')
  let sTableIdx = _.findIndex(diagramInfo.tables, t => t.name === sTable)
  let sFieldIdx = _.findIndex(diagramInfo.tables[sTableIdx].fields, f => f.field === sField)
  let tTableIdx = _.findIndex(diagramInfo.tables, t => t.name === tTable)
  let tFieldIdx = _.findIndex(diagramInfo.tables[tTableIdx].fields, f => f.field === tField)

  let from = cellSets[sTableIdx][sFieldIdx + 1];
  let to = cellSets[tTableIdx][tFieldIdx + 1];
  connect(from, 'out', to, 'in')
})