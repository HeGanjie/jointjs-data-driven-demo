import React, { useState, useEffect, useRef, useContext } from 'react';
import * as joint from "jointjs";
import _ from 'lodash'

const GraphContext = React.createContext(null);

function Graph(props) {
  const [graph, setGraph] = useState(null);
  const [idDict, setIdDict] = useState({});
  const elRef = useRef(null);
  useEffect(() => {
    let graph = new joint.dia.Graph;
    let paper = new joint.dia.Paper({
      el: elRef.current,
      model: graph,
      ...props
    });
    setGraph(graph);
  }, []);
  return (
    <GraphContext.Provider value={{graph, idDict, setIdDict}}>
      <div ref={elRef}>
      </div>
      {props.children}
    </GraphContext.Provider>
  )
}

function Rectangle(props) {
  const {graph, setIdDict} = useContext(GraphContext) || {};
  useEffect(() => {
    if (graph) {
      let rect = new joint.shapes.standard.Rectangle();
      rect.position(...props.position);
      rect.resize(...props.size);
      rect.attr(props.attr);
      rect.addTo(graph);
      setIdDict(prev => ({...prev, [props.id]: rect}))
    }
  }, [graph]);
  return null
}

function Link(props) {
  const {graph, idDict} = useContext(GraphContext) || {};
  useEffect(() => {
    if (graph && idDict[props.source] && idDict[props.target]) {
      let link = new joint.shapes.standard.Link();
      link.source(idDict[props.source]);
      link.target(idDict[props.target]);
      link.addTo(graph);
    }
  }, [graph, _.size(idDict)]);
  return null
}

function Chart(props) {
  return (
    <Graph
      width={800}
      height={600}
      gridSize={1}
    >
      <Rectangle
        id="a"
        position={[100, 30]}
        size={[100, 40]}
        attr={{
          body: {
            fill: 'blue'
          },
          label: {
            text: 'Hello',
            fill: 'white'
          }
        }}
      />
      <Rectangle
        id="b"
        position={[400, 30]}
        size={[100, 40]}
        attr={{
          body: {
            fill: 'blue'
          },
          label: {
            text: 'World!',
            fill: 'white'
          }
        }}
      />
      <Link
        source="a"
        target="b"
      />
    </Graph>
  )
}

export default function App(props) {
  return (
    <div>
      <Chart
        opts={{

        }}
      />
    </div>
  )
}
