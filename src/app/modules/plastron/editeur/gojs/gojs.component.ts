import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import * as go from 'gojs';
import {
  DataSyncService,
  DiagramComponent,
  PaletteComponent,
} from 'gojs-angular';
import produce from 'immer';
import { getElementByChamp } from 'src/app/functions/tools';
import { Graph, Link, Node, NodeType, Event } from 'src/app/models/vertex/node';
import { NodeService } from 'src/app/services/node.service';

const GREEN = '#45C456';
const RED = '#A41313';

interface GoNode {
  id: string;
  text: string;
  source: string;
  color: string;
  loc: string;
  idOrient:string;
}

interface GoLink {
  from: string;
  to: string;
  color: string;
  key: number;
  fromPort: string;
  toPort: string;
}

@Component({
  selector: 'app-gojs',
  templateUrl: './gojs.component.html',
  styleUrls: ['./gojs.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class GojsComponent {
  public state = {
    // Diagram state props
    diagramNodeData: [
      { id: 'Alpha', text: 'Alpha', color: 'lightblue', loc: '0 0' },
      { id: 'Beta', text: 'Beta', color: 'orange', loc: '100 0' },
      { id: 'Gamma', text: 'Gamma', color: 'lightgreen', loc: '0 100' },
      { id: 'Delta', text: 'Delta', color: 'pink', loc: '100 100' },
    ],
    diagramLinkData: [
      { key: -1, from: 'Alpha', to: 'Beta', fromPort: 'r', toPort: '1' },
      { key: -2, from: 'Alpha', to: 'Gamma', fromPort: 'b', toPort: 't' },
      { key: -3, from: 'Beta', to: 'Beta' },
      { key: -4, from: 'Gamma', to: 'Delta', fromPort: 'r', toPort: 'l' },
      { key: -5, from: 'Delta', to: 'Alpha', fromPort: 't', toPort: 'r' },
    ],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: false,
    selectedNodeData: null, // used by InspectorComponent

    // Palette state props
    paletteNodeData: [
      { key: 'Epsilon', text: 'Epsilon', color: 'red' },
      { key: 'Kappa', text: 'Kappa', color: 'purple' },
    ],
    paletteModelData: { prop: 'val' },
  };
  public diagramDivClassName: string = 'myDiagramDiv';
  public paletteDivClassName = 'myPaletteDiv';
  diagram: go.Diagram;

  _graph!: Graph;
  get graph(): Graph {
    return this._graph;
  }

  @Input() set graph(value: Graph) {
    if (value) {
      this._graph = value;
      if (value.links && value.links.length > 0) this.initModel();
    }
  }

  // myDiagramComponent is a reference to your DiagramComponent
  @ViewChild('diagram', { static: true })
  public diagramComponent: DiagramComponent;


  @Output() updateNodes = new EventEmitter<Node[]>();

  constructor(private cdr: ChangeDetectorRef, private nodeService:NodeService) {}

  public ngOnChanges() {
    // whenever showGrid changes, update the diagram.grid.visible in the child DiagramComponent
    if (
      this.diagramComponent &&
      this.diagramComponent.diagram instanceof go.Diagram
    ) {
      this.diagramComponent.diagram.grid.visible = false;
    }
  }

  initModel() {
    console.log('gojs graph ', this.graph);
    this.diagramComponent.clear();

    let nodes = this.graph.nodes.map((node: Node) => {
      let name = Node.getName(node);
      let label =
        node.type == NodeType.event && (node as Event).template
          ? (node as Event).template.name
          : name;

      return {
        id: node.id,
        text: label,
        source: 'assets/icons/trend.png',
        color: '#ffffff',
        loc: node.localisation,
        idOrient:node.id
      } as GoNode;
    });

    let links = this.graph.links.map(
      (link: Link) =>
        ({
          from: link.from,
          to: link.to,
          color: link?.start ? GREEN : RED,
        } as GoLink)
    );

    console.log('nodes ', nodes);

    console.log('links ', links);

    this.state.diagramNodeData = nodes;
    this.state.diagramLinkData = links;

    // this.diagram.model = new go.GraphLinksModel(nodes, links);
  }

  public ngAfterViewInit() {
    /*     this.diagram = new go.Diagram('myDiagramDiv', {
      // enable Ctrl-Z to undo and Ctrl-Y to redo
      'undoManager.isEnabled': true,
    }); */
  }

  // initialize diagram / templates
  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    const dia = new go.Diagram({
      'undoManager.isEnabled': true,
      model: new go.GraphLinksModel({
        nodeKeyProperty: 'id',
        linkKeyProperty: 'key', // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
      }),
    });

    // define the Node template
    dia.nodeTemplate = $(
      go.Node,
      'Horizontal',
      new go.Binding('background', 'color'),
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      //  onmouseover: (e, obj) => this.nodeChange(obj.part.location,'onmouseover'),
      //   onchange: (e, obj) => nodeChange(obj.part.location,'onchange'),
      $(
        go.Picture,
        { margin: 10, width: 50, height: 50 },
        new go.Binding('source')
      ),
      $(
        go.TextBlock,
        {
          margin: 12,
          editable: true,
          stroke: 'black',
          font: 'bold 16px sans-serif',
        },
        new go.Binding('text').makeTwoWay()
      )
    );

    /*   this.diagram.nodeTemplate = new go.Node(
      'Horizontal',
      // the entire node will have a light-blue background
      { background: '#44CCFF' }
    )
      .add(
        new go.Picture(
          // Pictures should normally have an explicit width and height.
          // This picture has a red background, only visible when there is no source set
          // or when the image is partially transparent.
          { margin: 10, width: 50, height: 50, background: 'red' }
        )
          // Picture.source is data bound to the "source" attribute of the model data
          .bind('source')
      )
      .add(
        new go.TextBlock(
          'Default Text', // the initial value for TextBlock.text
          // some room around the text, a larger font, and a white stroke:
          { margin: 12, stroke: 'white', font: 'bold 16px sans-serif' }
        )
          // TextBlock.text is data bound to the "name" property of the model data
          .bind('text', 'name')
      ); */

    // define a Link template that routes orthogonally, with no arrowhead
    dia.linkTemplate = new go.Link(
      // default routing is go.Link.Normal
      // default corner is 0
      { routing: go.Link.AvoidsNodes, corner: 5 }
    )
      // the link path, a Shape
      .add(new go.Shape({ strokeWidth: 3 }).bind('stroke', 'color'))
      // if we wanted an arrowhead we would also add another Shape with toArrow defined:
      .add(new go.Shape({ toArrow: 'Standard' }).bind('stroke', 'color'));

/*     let saveModel = (event) => {
      console.log('save model ', event);
    };

    dia.addModelChangedListener((e) => {
      if (e.isTransactionFinished) saveModel(e.model);
    }); */

    return dia;
  }

  /**
   * Handle GoJS model changes, which output an object of data changes via Mode.toIncrementalData.
   * This method should iterate over thoe changes and update state to keep in sync with the FoJS model.
   * This can be done with any preferred state management method, as long as immutability is preserved.
   */
  public diagramModelChange = function (changes: go.IncrementalData) {
    console.log('diagramModelChange ', changes);

    let updateNodes = changes.modifiedNodeData.map((goNode:GoNode) =>{
      let node:Node = getElementByChamp<Node>(this.graph.nodes,'id',goNode.idOrient);
      node.localisation = goNode.loc;
      console.log('node ',node)
      this.nodeService.updateNode(node).subscribe((res)=> console.log(res));
      return node;
    })



    this.updateNodes.emit(updateNodes)

    // TODO -> engerister les changements de position des noeuds 
    // see gojs-angular-basic for an example model changed handler that preserves immutability
    // when setting state, be sure to set skipsDiagramUpdate: true since GoJS already has this update
  };

  /* 
  public nodeChange = function (changes:any,origin) {
    console.log("origin ",changes);
    console.log("nodeChange ",changes);
    // see gojs-angular-basic for an example model changed handler that preserves immutability
    // when setting state, be sure to set skipsDiagramUpdate: true since GoJS already has this update
  };
  */
}
