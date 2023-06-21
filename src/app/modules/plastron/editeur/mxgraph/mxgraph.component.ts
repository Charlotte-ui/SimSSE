import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import factory, {
  mxGraph,
  mxGraphModel,
  mxHierarchicalLayout,
  mxRubberband,
  mxEvent,
  mxConnectionHandler,
  mxImage,
  mxVertexHandler,
  mxUtils,
  mxCell,
  mxConstants,
  mxLayoutManager,
  mxRectangle,
  mxPoint,
} from 'mxgraph';
import mx from '../../../../../mxgraph';
import {
  Graph,
  Node,
  NodeType,
  Event,
  Link,
  EventType,
  Trend,
  LinkType,
  Timer,
} from 'src/app/models/vertex/node';
import { NodeService } from 'src/app/services/node.service';
import { getElementByChamp, remove } from 'src/app/functions/tools';
import { Button } from 'src/app/functions/display';
import { VariablePhysioTemplate } from 'src/app/models/vertex/variablePhysio';
import { MatDialog } from '@angular/material/dialog';
import { Action, BioEvent } from 'src/app/models/vertex/event';
import { DialogComponent } from 'src/app/modules/shared/dialog/dialog.component';

const NODE_HEIGTH = 30;
const IMAGE_HEIGTH = 50;

var nodes: Node[] = [];
var variablesTemplate: VariablePhysioTemplate[] = [];

@Component({
  selector: 'app-mxgraph',
  templateUrl: './mxgraph.component.html',
  styleUrls: ['./mxgraph.component.less'],
})
export class MxgraphComponent implements AfterViewInit {
  title = 'ngmxgraph';
  model: mxGraphModel;
  graph: mxGraph;
  parent: mxCell;

  _graphData!: Graph;
  get graphData(): Graph {
    return this._graphData;
  }
  @Input() set graphData(value: Graph) {
    if (value) {
      this._graphData = value;
      nodes = value.nodes;
      if (value.nodes && value.links && this.model) this.updateModel();
    }
  }

  _variablesTemplate!: VariablePhysioTemplate[];
  get variablesTemplate(): VariablePhysioTemplate[] {
    return this._variablesTemplate;
  }
  @Input() set variablesTemplate(value: VariablePhysioTemplate[]) {
    if (value) {
      this._variablesTemplate = value;
      variablesTemplate = value;
    }
  }
  @Input() allBioevents!: BioEvent[];
  @Input() allActions!: Action[];

  @ViewChild('graphContainer') containerElementRef: ElementRef;

  constructor(public nodeService: NodeService, public dialog: MatDialog) {
    mx.mxConnectionHandler.prototype.connectImage = new mx.mxImage(
      '../assets/icons/link.png',
      16,
      16
    );
  }

  get container() {
    return this.containerElementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    if (mx.mxClient.isBrowserSupported()) {
    }
    this.initContainer();
    this.graph = this.initGraph();

    // Enables rubberband selection
    new mx.mxRubberband(this.graph);
    var keyHandler = new mx.mxKeyHandler(this.graph);

    this.model = this.graph.getModel();
    this.parent = this.graph.getDefaultParent();

    this.configureStylesheet();
    this.collapsed(this.graph);
    this.addListeners();
    this.graph.setResizeContainer(true);
  }

  updateModel() {
    this.model.beginUpdate();
    try {
      // add nodes
      this.graphData.nodes.forEach((node: Node) => {
        let type = Node.getType(node);

        console.log(this.model.cells);
        console.log(this.model.cells[node.id]);
        if (this.model.cells[node.id] === undefined) {
          console.log('create node ');
          if (type === NodeType.graph)
            this.createGraphBox(node as Graph, this.parent);
          else this.createNodeBox(node, type, this.parent);
        }
      });

      // add links
      this.createLinks(this.graphData.links);

      /*'entryX=0.25;entryY=0;exitX=1;exitY=1;exitPerimeter=1'
      ); */ // to chose the entry and exit anchor point
      // graph.connectCell(e2,v3,false, mxShape.prototype.constraints[0]);
    } finally {
      this.model.endUpdate();
    }
  }

  createNodeBox(node: Node, type: string, source: mxCell): mxCell {
    let name = Node.getName(node);
    let nodeWidth = 50 + name.length * 8;

    let nodeBox = this.graph.insertVertex(
      source,
      node.id,
      name,
      node.x,
      node.y,
      nodeWidth,
      (type === NodeType.timer || type === EventType.start)? IMAGE_HEIGTH:NODE_HEIGTH,
      type
    );

    nodeBox.geometry.alternateBounds = new mx.mxRectangle(0, 0, nodeWidth, 200);

    //var v31 = this.graph.insertVertex(nodeTitle, null, 'Hello,', 0,nodeHeigth,nodeWidth, 200-nodeHeigth,'open');
    if (source === this.parent) nodeBox.setConnectable(true);
    else nodeBox.setConnectable(false);
    nodeBox.collapsed = true;
    return nodeBox;
  }

  createGraphBox(graph: Graph, source: mxCell) {
    let graphBox = this.createNodeBox(graph, NodeType.graph, source);
    graph.nodes.forEach((node) => {
      let type = Node.getType(node);
      if (type === NodeType.graph) this.createGraphBox(node as Graph, graphBox);
      else this.createNodeBox(node, type, graphBox);
    });
    this.createLinks(graph.links);
  }

  createLinks(links: Link[]) {
    links.forEach((link: Link) => {
      let edge = this.graph.insertEdge(
        this.parent,
        link.id,
        Link.getIcon(link),
        this.model.cells[link?.out],
        this.model.cells[link?.in],
        `strokeColor=${Link.getColor(link)}`
      );
      edge.setConnectable(false);
    });
  }

  zoomIn() {
    this.graph.zoomIn();
  }

  zoomOut() {
    this.graph.zoomOut();
  }

  actual() {
    this.graph.zoomActual();
  }

  fit() {
    this.graph.center();
  }

  initContainer() {
    // Disables the built-in context menu
    mx.mxEvent.disableContextMenu(this.container);

    // Enables crisp rendering of rectangles in SVG
    mx.mxConstants.ENTITY_SEGMENT = 20;
  }

  initGraph(): mxGraph {
    const graph: mxGraph = new mx.mxGraph(this.container);
    graph.setPanning(true);
    graph.setConnectable(true);
    graph.setDropEnabled(true);
    graph.setHtmlLabels(true);
    graph.setTooltips(true);

    graph.connectableEdges = true;

    // Disables global features
    graph.collapseToPreferredSize = false;
    graph.constrainChildren = false;
    graph.cellsSelectable = true;
    graph.extendParentsOnAdd = false;
    graph.extendParents = false;
    graph.border = 10;
    graph.edgeLabelsMovable = false;
    graph.allowDanglingEdges = false;

    // Enables connect preview for the default edge style
    graph.connectionHandler.createEdgeState = function (me) {
      var edge = graph.createEdge(null, null, null, null, null);

      return new mx.mxCellState(
        this.graph.view,
        edge,
        this.graph.getCellStyle(edge)
      );
    };

    // Specifies the default edge style
    graph.getStylesheet().getDefaultEdgeStyle()['edgeStyle'] =
      'orthogonalEdgeStyle';

    // Installs a custom tooltip for cells
    graph.getTooltipForCell = function (cell) {
      console.log(cell);
      let tt = undefined;

      let node = getElementByChamp<Node>(nodes, 'id', cell.id);
      if (node.type == NodeType.trend) {
        tt =
          getElementByChamp<VariablePhysioTemplate>(
            variablesTemplate,
            'id',
            (node as Trend).target
          ).name +
          ', ' +
          (node as Trend).parameter;
      }

      if(node.type === NodeType.timer){
        tt = (node as Timer).duration + ' min'
      }
      return tt;

      /* if (this.model.isEdge(cell))
					{
						return this.convertValueToString(this.model.getTerminal(cell, true)) + ' => ' +
							this.convertValueToString(this.model.getTerminal(cell, false))
					}

					return mxGraph.prototype.getTooltipForCell.apply(this, arguments); */
    };

    // Defines the tolerance before removing the icons
    var iconTolerance = 20;

    // Shows icons if the mouse is over a cell
    /*     graph.addMouseListener({
      currentState: null,
      currentIconSet: null,
      mouseDown: function (sender, me) {
        // Hides icons on mouse down
        if (this.currentState != null) {
          this.dragLeave(me.getEvent(), this.currentState);
          this.currentState = null;
        }
      },
      mouseMove: function (sender, me) {
        if (
          this.currentState != null &&
          (me.getState() == this.currentState || me.getState() == null)
        ) {
          var tol = iconTolerance;
          var tmp = new mx.mxRectangle(
            me.getGraphX() - tol,
            me.getGraphY() - tol,
            2 * tol,
            2 * tol
          );

          if (mx.mxUtils.intersects(tmp, this.currentState)) {
            return;
          }
        }

        var tmp2 = graph.view.getState(me.getCell());

        // Ignores everything but vertices
        if (
          graph.isMouseDown ||
          (tmp2 != null && !graph.getModel().isVertex(tmp2.cell))
        ) {
          tmp2 = null;
        }

        if (tmp2 != this.currentState) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
          }

          this.currentState = tmp2;

          if (this.currentState != null) {
            this.dragEnter(me.getEvent(), this.currentState);
          }
        }
      },
      mouseUp: function (sender, me) {},
      dragEnter: function (evt, state) {
        if (this.currentIconSet == null) {
          this.currentIconSet = mxIconSet(state);
        }
      },
      dragLeave: function (evt, state) {
        if (this.currentIconSet != null) {
          mxIconSetDestroy(this.currentIconSet);
          //this.currentIconSet.destroy();
          this.currentIconSet = null;
        }
      },
    }); */

    return graph;
  }

  addListeners() {
    /**
     * quand un node bouge, on mets à jour la bdd
     */
    this.graph.addListener(mx.mxEvent.CELLS_MOVED, (sender, evt) => {
      var cell = evt.getProperties('cell');
      cell.cells.forEach((element) => {
        let node = getElementByChamp<Node>(
          this.graphData.nodes,
          'id',
          element.id
        );
        if (node) {
          node.x = element.geometry.x;
          node.y = element.geometry.y;
          this.nodeService
            .updateNode(node, ['x', 'y'])
            .subscribe((res) => console.log(res));
        }
      });
    });

    this.graph.addListener(mx.mxEvent.LABEL_CHANGED, (sender, evt) => {
      var cell: mxCell = evt.getProperty('cell');
      console.log(cell);
      cell.geometry.width = 50 + cell.value.length * 8;
      let node = getElementByChamp<Node>(this.graphData.nodes, 'id', cell.id);

      if (node.type == NodeType.trend) {
        (node as Trend).name = cell.value;
        this.nodeService
          .updateNode(node, ['name'])
          .subscribe((res) => console.log(res));
      }
    });

    this.graph.addListener(mx.mxEvent.DOUBLE_CLICK, (sender, evt) => {
      var cell: mxCell = evt.getProperty('cell');
      console.log('DOUBLE CLICK');
      console.log(cell);
      let node = getElementByChamp<Node>(this.graphData.nodes, 'id', cell.id);
      if (node === undefined) {
        let link = getElementByChamp<Link>(this.graphData.links, 'id', cell.id);
        this.onEdgeClick(link, cell);
        return;
      }

      let dialogRef;

      let category: string =
        node.type == NodeType.event ? (node as Event).typeEvent : node.type;

      switch (category) {
        case NodeType.graph:
          //
          break;
        case EventType.bio:
          dialogRef = this.dialog.open(DialogComponent, {
            data: [node, Event, this.allBioevents, true, ['template']],
          });
          break;
        case EventType.action:
          dialogRef = this.dialog.open(DialogComponent, {
            data: [node, Event, Action.getListByCategory(), true, ['template']],
          });
          break;
        case NodeType.trend:
          dialogRef = this.dialog.open(DialogComponent, {
            data: [node, Trend, this.variablesTemplate, true],
          });
          break;
        case NodeType.timer:
        dialogRef = this.dialog.open(DialogComponent, {
          data: [node,Timer, [], true],
        });
      }

      if (dialogRef)
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            if (result.delete) {
              remove<Node>(this.graphData.nodes, node);
              this.graph.removeCells([cell]);
              // delete all the links link to the deleted node
              this.graphData.links.forEach((link) => {
                if (link.in == node.id || link.out == node.id)
                  remove<Link>(this.graphData.links, link);
              });
              this.graph.removeCells([cell]);
              this.nodeService.deleteNode(node).subscribe();
            } else {
              let updatableParameters = Node.getUpdatables(node);
              let updatedParameters = [];

              updatableParameters.forEach((parameter) => {
                if (node[parameter] != result[parameter]) {
                  node[parameter] = result[parameter];
                  updatedParameters.push(parameter);
                }
              });
              if(node.type == NodeType.event) (node as Event).template = getElementByChamp<Action>(
                this.allActions,
                'id',
                (node as Event).event
              );

              cell.value = Node.getName(node);
              cell.geometry.width = 50 + cell.value.length * 8;
              this.graph.refresh(cell);
              this.nodeService.updateNode(node, updatedParameters).subscribe();
            }
          }
        });
    });

    mx.mxEvent.addListener(this.container, 'dragover', function (evt) {
      if (this.graph.isEnabled()) {
        evt.stopPropagation();
        evt.preventDefault();
      }
    });

    this.graph.model.addListener(mx.mxEvent.CHANGE, (sender, evt) => {
      console.log(
        '--------------------------------------------------------------------------------'
      );
      var changes = evt.getProperty('edit').changes;
      for (var i = 0; i < changes.length; i++) {
        if (changes[i].constructor.name == 'mxTerminalChange') {
          console.log(i);
          if (changes[i].cell.edge && !changes[i].cell.value) {
            this.createEdge(changes[i].cell);
            break;
          }

          console.log(changes[i]);
        }
      }
    });

    mx.mxEvent.addListener(this.container, 'drop', function (evt) {
      if (this.graph.isEnabled()) {
        evt.stopPropagation();
        evt.preventDefault();

        // Gets drop location point for vertex
        var pt = mx.mxUtils.convertPoint(
          this.graph.container,
          mxEvent.getClientX(evt),
          mxEvent.getClientY(evt)
        );
        var tr = this.graph.view.translate;
        var scale = this.graph.view.scale;
        var x = pt.x / scale - tr.x;
        var y = pt.y / scale - tr.y;

        // Converts local images to data urls
        var filesArray = evt.dataTransfer.files;

        for (var i = 0; i < filesArray.length; i++) {
          this.handleDrop(this.graph, filesArray[i], x + i * 10, y + i * 10);
        }
      }
    });
  }

  createEdge(cell: mxCell) {
    let boxes = cell.parent.children;
    let source = cell.source;
    let target = cell.target;
    let inBox;
    let outBox;

    console.log('boxes ', boxes);

    console.log('target ', target);

    let outNode = getElementByChamp<Node>(
      this.graphData.nodes,
      'id',
      source.id
    );
    let inNode = getElementByChamp<Node>(this.graphData.nodes, 'id', target.id);

    console.log('outNode ', outNode);
    console.log('inNode ', inNode);

    console.log('createEdge ', cell);
    let link: Link = new Link({ out: '#' + outNode.id, in: '#' + inNode.id });

    const dialogRef = this.dialog.open(DialogComponent, {
      data: [link, Link, this.graphData.nodes, false],
    });

    dialogRef.afterClosed().subscribe((result: Link) => {
      if (result) {
        //this.newElement.emit(result);
        console.log('res ', result);
        console.log('model ', this.model);

        this.nodeService
          .createLink(result.in, result.out, result.trigger)
          .subscribe((newLink: Link) => {
            this.graphData.links.push(newLink);
            cell.id = newLink.id;
          });
        cell.style = `strokeColor=${Link.getColor(result)}`;
        cell.value = Link.getIcon(result);
        this.graph.refresh(cell);
      }
    });
  }

  onEdgeClick(link: Link, cell: mxCell) {
    let dialogRef = this.dialog.open(DialogComponent, {
      data: [link, Link, this.graphData.nodes, true],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.delete) {
          remove<Link>(this.graphData.links, link);
          this.graph.removeCells([cell]);
          this.nodeService.deleteLink(link).subscribe();
        } else {
          link.trigger = result.trigger;
          cell.style = `strokeColor=${Link.getColor(link)}`;
          cell.value = Link.getIcon(link);
          this.graph.refresh(cell);
          this.nodeService.updateLink(link).subscribe();
        }
      }
    });
  }

  drag(graph: mxGraph) {
    // Creates a DOM node that acts as the drag source
    var img = mx.mxUtils.createImage('assets/icons/start.png');
    img.style.width = '48px';
    img.style.height = '48px';
    document.body.appendChild(img);

    // Creates the element that is being for the actual preview.
    var dragElt = document.createElement('div');
    dragElt.style.border = 'dashed black 1px';
    dragElt.style.width = '120px';
    dragElt.style.height = '40px';

    // Drag source is configured to use dragElt for preview and as drag icon
    // if scalePreview (last) argument is true. Dx and dy are null to force
    // the use of the defaults. Note that dx and dy are only used for the
    // drag icon but not for the preview.
    var ds = mx.mxUtils.makeDraggable(
      img,
      graph,
      this.insertNode,
      dragElt,
      null,
      null,
      graph.autoScroll,
      true
    );

    // Redirects feature to global switch. Note that this feature should only be used
    // if the the x and y arguments are used in funct to insert the cell.
    ds.isGuidesEnabled = function () {
      return graph.graphHandler.guidesEnabled;
    };

    // Restores original drag icon while outside of graph
    ds.createDragElement = mx.mxDragSource.prototype.createDragElement;
  }

  /**
   * Create a new graph model with a root cell and a default layer (first child)
   *
   * The graph model has the following properties:
   * - The root element of the graph contains the layers. The parent of each layer is the root element.
   * - A layer may contain elements of the graph model, namely vertices, edges and groups.
   * - Groups may contain elements of the graph model, recursively.
   *
   * The graph and structural information is stored in the cells, as well as the user objects, which are used to store the value associated with the cells (aka business objects).
   */
  createGraphModel(): mxGraphModel {
    var root = new mx.mxCell();
    root.insert(new mx.mxCell());
    return new mx.mxGraphModel(root);
  }

  /**
   * Modify the default styles for vertices and edges in an existing graph
   * The appearance of the cells in a graph is defined by the stylesheet, which is an instance of mxStylesheet. The stylesheet maps from stylenames to styles. A style is an array of key, value pairs to be used with the cells. The keys are defined in mxConstants and the values may be strings and numbers or JavaScript objects or functions.
   */
  configureStylesheet() {
    var vertexStyle = this.graph.getStylesheet().getDefaultVertexStyle();
    vertexStyle[mx.mxConstants.STYLE_ROUNDED] = false;
    vertexStyle[mx.mxConstants.DEFAULT_HOTSPOT] = 1;
    vertexStyle[mx.mxConstants.STYLE_STARTSIZE] = 30;
    //vertexStyle[mx.mxConstants.HIGHLIGHT_COLOR] = null;
    // 'https://cdn4.iconfinder.com/data/icons/doodle-3/167/trend-down-square-512.png';

    var edgeStyle = this.graph.getStylesheet().getDefaultEdgeStyle();
    edgeStyle[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.scalePointArray; // EntityRelation ?
    edgeStyle[mx.mxConstants.STYLE_PERIMETER_SPACING] = 0;
    edgeStyle[mx.mxConstants.STYLE_STROKEWIDTH] = 3;
    edgeStyle[mx.mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
    edgeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#00000';
    edgeStyle[mx.mxConstants.STYLE_ROUNDED] = true;
    edgeStyle[mx.mxConstants.STYLE_IMAGE] = `../assets/icons/start.png`;

    // create styles
    var nodeStyle = new Object();
    nodeStyle[mx.mxConstants.STYLE_PERIMETER] =
      mx.mxPerimeter.RectanglePerimeter;
    nodeStyle[mx.mxConstants.STYLE_ALIGN] = mx.mxConstants.ALIGN_LEFT;
    nodeStyle[mx.mxConstants.STYLE_IMAGE_ALIGN] = mx.mxConstants.ALIGN_RIGHT;
    nodeStyle[mx.mxConstants.STYLE_SPACING_LEFT] = '5';
    nodeStyle[mx.mxConstants.STYLE_SPACING_RIGHT] = '15';
    nodeStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_LABEL;
    vertexStyle[mx.mxConstants.STYLE_ROUNDED] = true;
    nodeStyle[mx.mxConstants.STYLE_STROKECOLOR] = '#000000';
    nodeStyle[mx.mxConstants.STYLE_VERTICAL_ALIGN] =
      mx.mxConstants.ALIGN_MIDDLE;
    nodeStyle[mx.mxConstants.STYLE_IMAGE_VERTICAL_ALIGN] =
      mx.mxConstants.ALIGN_MIDDLE;
    nodeStyle[mx.mxConstants.STYLE_IMAGE_WIDTH] = '16';
    nodeStyle[mx.mxConstants.STYLE_IMAGE_HEIGHT] = '16';
    nodeStyle[mx.mxConstants.STYLE_SPACING] = '5';
    nodeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#00000';
    nodeStyle[mx.mxConstants.STYLE_FONTSIZE] = '14';
    nodeStyle[mx.mxConstants.STYLE_FONTFAMILY] = 'verdana';
    nodeStyle[mx.mxConstants.STYLE_SHADOW] = true;

    let stylesTypes = [
      NodeType.trend,
      EventType.action,
      EventType.bio,
   //   EventType.start,
    ];

    stylesTypes.forEach((styleType) => {
      let style = mx.mxUtils.clone(nodeStyle);
      style[mx.mxConstants.STYLE_FILLCOLOR] =
        Button.getButtonByType(styleType).color;
      style[mx.mxConstants.STYLE_IMAGE] = `../assets/icons/${styleType}.png`;
      this.graph.getStylesheet().putCellStyle(styleType, style);
    });

    let graphStyle = mx.mxUtils.clone(nodeStyle);
    graphStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_SWIMLANE;
    graphStyle[mx.mxConstants.STYLE_FILLCOLOR] = Button.getButtonByType(
      NodeType.graph
    ).color;
    graphStyle[
      mx.mxConstants.STYLE_IMAGE
    ] = `../assets/icons/${NodeType.graph}.png`;
    graphStyle[mx.mxConstants.STYLE_STARTSIZE] = NODE_HEIGTH;
    graphStyle[mx.mxConstants.STYLE_SHADOW] = false;
    graphStyle[mx.mxConstants.STYLE_SPACING_LEFT] = '15';
    this.graph.getStylesheet().putCellStyle(NodeType.graph, graphStyle);

    let imageStyle = new Object();
    imageStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_IMAGE;
    imageStyle[mx.mxConstants.STYLE_PERIMETER] =
      mx.mxPerimeter.RectanglePerimeter;
    imageStyle[mx.mxConstants.STYLE_IMAGE_WIDTH] = '50';
    imageStyle[mx.mxConstants.STYLE_IMAGE_HEIGHT] = '50';


    let startStyle = mx.mxUtils.clone(imageStyle);
    startStyle[mx.mxConstants.STYLE_IMAGE] = '../assets/icons/start.png';
    this.graph.getStylesheet().putCellStyle('start', startStyle);

    let timerStyle = mx.mxUtils.clone(imageStyle);
    timerStyle[mx.mxConstants.STYLE_IMAGE] = '../assets/icons/timer.png';
    this.graph.getStylesheet().putCellStyle('timer', timerStyle);

    let portStyle = new Object();
    portStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_IMAGE;
    portStyle[mx.mxConstants.STYLE_FONTCOLOR] = 'white';
    portStyle[mx.mxConstants.STYLE_PERIMETER] =
      mx.mxPerimeter.RectanglePerimeter;
    portStyle[mx.mxConstants.STYLE_PERIMETER_SPACING] = '6';
    portStyle[mx.mxConstants.STYLE_ALIGN] = mx.mxConstants.ALIGN_LEFT;
    portStyle[mx.mxConstants.STYLE_VERTICAL_ALIGN] =
      mx.mxConstants.ALIGN_MIDDLE;
    portStyle[mx.mxConstants.STYLE_FONTSIZE] = '10';
    portStyle[mx.mxConstants.STYLE_FONTSTYLE] = 2;
    portStyle[mx.mxConstants.STYLE_IMAGE_WIDTH] = '16';
    portStyle[mx.mxConstants.STYLE_IMAGE_HEIGHT] = '16';
    this.graph.getStylesheet().putCellStyle('port', portStyle);
  }

  // Extends mxGraphModel.getStyle to show an image when collapsed
  collapsed(graph) {
    var modelGetStyle = graph.model.getStyle;
    graph.model.getStyle = function (cell) {
      if (cell != null) {
        var style = modelGetStyle.apply(this, arguments);

        if (this.isCollapsed(cell)) {
          //	style = style + ';shape=image;image=http://www.jgraph.com/images/mxgraph.gif;' +
          //		'noLabel=1;imageBackground=#C3D9FF;imageBorder=#6482B9';
          style = style;
        }

        return style;
      }

      return null;
    };
  }

  // Defines a subclass for mxVertexHandler that adds a set of clickable
  // icons to every selected vertex.
  mxVertexToolHandler(state) {
    mx.mxVertexHandler.apply(this, arguments);
  }

  // Inserts a cell at the given location
  insertNode = function (graph, evt, target, x, y) {
    var cell = new mx.mxCell('Test', new mx.mxGeometry(0, 0, 120, 40));
    cell.vertex = true;
    var cells = graph.importCells([cell], x, y, target);

    if (cells != null && cells.length > 0) {
      graph.scrollCellToVisible(cells[0]);
      graph.setSelectionCells(cells);
    }
  };

  // Handles each file as a separate insert for simplicity.
  // Use barrier to handle multiple files as a single insert.
  handleDrop(graph, file, x, y) {
    if (file.type.substring(0, 5) == 'image') {
      var reader = new FileReader();

      reader.onload = function (e) {
        // Gets size of image for vertex
        var data = e.target.result;

        // SVG needs special handling to add viewbox if missing and
        // find initial size from SVG attributes (only for IE11)
        if (file.type.substring(0, 9) == 'image/svg') {
          /* 	var comma = 1//data.indexOf(',');
              var svgText = atob(data.substring(comma + 1));
              var root = mxUtils.parseXml(svgText);
            	
              // Parses SVG to find width and height
              if (root != null)
              {
                var svgs = root.getElementsByTagName('svg');
              	
                if (svgs.length > 0)
                {
                  var svgRoot = svgs[0];
                  var w = parseFloat(svgRoot.getAttribute('width'));
                  var h = parseFloat(svgRoot.getAttribute('height'));
                	
                  // Check if viewBox attribute already exists
                  var vb = svgRoot.getAttribute('viewBox');
                	
                  if (vb == null || vb.length == 0)
                  {
                    svgRoot.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
                  }
                  // Uses width and height from viewbox for
                  // missing width and height attributes
                  else if (isNaN(w) || isNaN(h))
                  {
                    var tokens = vb.split(' ');
                  	
                    if (tokens.length > 3)
                    {
                      w = parseFloat(tokens[2]);
                      h = parseFloat(tokens[3]);
                    }
                  }
                	
                          w = Math.max(1, Math.round(w));
                          h = Math.max(1, Math.round(h));
                	
                  data = 'data:image/svg+xml,' + btoa(mxUtils.getXml(svgs[0], '\n'));
                  graph.insertVertex(null, null, '', x, y, w, h, 'shape=image;image=' + data + ';');
                }
              } */
        } else {
          /* var img = new Image();
                    	
                      img.onload = function()
                      {
                        var w = Math.max(1, img.width);
                        var h = Math.max(1, img.height);
                      	
                        // Converts format of data url to cell style value for use in vertex
                  var semi = data.indexOf(';');
                	
                  if (semi > 0)
                  {
                    data = data.substring(0, semi) + data.substring(data.indexOf(',', semi + 1));
                  }

                  graph.insertVertex(null, null, '', x, y, w, h, 'shape=image;image=' + data + ';');
                      };
                    	
                      img.src = data; */
        }
      };

      reader.readAsDataURL(file);
    }
  }
}

// Defines a new class for all icons
let mxIconSet = (state) => {
  let images = [];
  var graph = state.view.graph;

  // Icon1
  var img = mx.mxUtils.createImage('../assets/icons/start.png');
  img.setAttribute('title', 'Démarrer');
  img.style.position = 'absolute';
  img.style.cursor = 'pointer';
  img.style.width = '16px';
  img.style.height = '16px';
  img.style.left = state.x + state.width / 3 + 'px'; //(state.x + state.width) + 'px';
  img.style.top = state.y - 18 + 'px'; //(state.y + state.height) + 'px';

  mx.mxEvent.addGestureListeners(
    img,
    mx.mxUtils.bind(this, function (evt) {
      var s = graph.gridSize;
      graph.setSelectionCells(graph.moveCells([state.cell], s, s, true));
      mx.mxEvent.consume(evt);
      this.destroy();
    })
  );

  state.view.graph.container.appendChild(img);
  images.push(img);

  // Delete
  var img = mx.mxUtils.createImage('../assets/icons/pause.png');
  img.setAttribute('title', 'Pause');
  img.style.position = 'absolute';
  img.style.cursor = 'pointer';
  img.style.width = '16px';
  img.style.height = '16px';
  img.style.left = state.x + (2 * state.width) / 3 + 'px'; //(state.x + state.width) + 'px';
  img.style.top = state.y - 18 + 'px'; //(state.y - 16) + 'px';

  mx.mxEvent.addGestureListeners(
    img,
    mx.mxUtils.bind(this, function (evt) {
      // Disables dragging the image
      mx.mxEvent.consume(evt);
    })
  );

  mx.mxEvent.addListener(
    img,
    'click',
    mx.mxUtils.bind(this, function (evt) {
      graph.removeCells([state.cell]);
      mx.mxEvent.consume(evt);
      this.destroy();
    })
  );

  state.view.graph.container.appendChild(img);
  images.push(img);

  return images;
};

let mxIconSetDestroy = (images) => {
  if (images != null) {
    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      img.parentNode.removeChild(img);
    }
  }

  images = null;
};
