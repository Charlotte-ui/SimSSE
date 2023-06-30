import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
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
  mxUndoManager,
  mxEditor,
  mxGraphSelectionModel,
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
import {
  getElementByChamp,
  getElementByChampMap,
  getLinkByID,
  getNodeByID,
  remove,
  shade,
} from 'src/app/functions/tools';
import { Button } from 'src/app/functions/display';
import { VariablePhysioTemplate } from 'src/app/models/vertex/variablePhysio';
import { MatDialog } from '@angular/material/dialog';
import { Action, BioEvent } from 'src/app/models/vertex/event';
import { DialogComponent } from 'src/app/modules/shared/dialog/dialog.component';
import { GraphDialogComponent } from '../graph-dialog/graph-dialog.component';
import { GraphEditeurDialogComponent } from './graph-editeur-dialog/graph-editeur-dialog.component';
import { Groupe } from 'src/app/models/vertex/groupe';

const NODE_HEIGTH = 30;
const IMAGE_HEIGTH = 50;
const MIN_NODE_WIDTH = 50;
const FONT_SIZE = 16;
const FONT_RATIO = 0.7;

var DATA: Graph;
var variablesTemplate: VariablePhysioTemplate[] = [];
var undoManager: mxUndoManager;

@Component({
  selector: 'app-mxgraph',
  templateUrl: './mxgraph.component.html',
  styleUrls: ['./mxgraph.component.less'],
})
export class MxgraphComponent implements AfterViewInit {
  model: mxGraphModel;
  editor: mxEditor;
  parent: mxCell;

  _graphData!: Graph;
  get graphData(): Graph {
    return this._graphData;
  }
  @Input() set graphData(value: Graph) {
    if (value) {
      this._graphData = value;
      DATA = value;
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

  @Input() set draw(value: any[]) {
    DATA = this.graphData;
    if (this.model) this.updateModel();
  }

  @ViewChild('graphContainer') containerElementRef: ElementRef;

  @Output() updateGraphData = new EventEmitter<Node | Link>();

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
      this.initContainer();
      this.editor = new mx.mxEditor();
      this.editor.graph = this.initGraph();

      // Enables rubberband selection
      new mx.mxRubberband(this.editor.graph);
      var keyHandler = new mx.mxKeyHandler(this.editor.graph);

      this.model = this.editor.graph.getModel();
      this.parent = this.editor.graph.getDefaultParent();

      this.configureStylesheet();
      this.configureUndoRedo();
      this.addListeners();
      this.editor.graph.setResizeContainer(true);
    }
  }

  updateModel() {
    this.model.beginUpdate();
    try {
      // add nodes
      this.graphData.nodes.forEach((node: Node) => {
        let type = Node.getType(node);
        if (this.model.cells[node.id] === undefined) {
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

  createNodeBox(
    node: Node,
    type: string,
    source: mxCell,
    alternateX?: number,
    alternateY?: number
  ): mxCell {
    let name = Node.getName(node);
    let nodeWidth = MIN_NODE_WIDTH + name.length * FONT_SIZE * FONT_RATIO;
    let sizeFactor = 1;

    if (name === EventType.start) {
      name = '';
      node.x = 0;
      node.y = 0;
      nodeWidth = IMAGE_HEIGTH;

      if (source !== this.parent) {
        node.x = -10;
        node.y = NODE_HEIGTH - 10;
        sizeFactor = 0.7;
      }
    }

    if (type === NodeType.timer) {
      name = '';
      nodeWidth = IMAGE_HEIGTH;
    }

    let nodeBox = this.editor.graph.insertVertex(
      source,
      node.id,
      name,
      node.x,
      node.y,
      nodeWidth * sizeFactor,
      type === NodeType.timer || type === EventType.start
        ? IMAGE_HEIGTH * sizeFactor
        : NODE_HEIGTH,
      type
    );

    if (alternateX)
      nodeBox.geometry.alternateBounds = new mx.mxRectangle(
        0,
        0,
        alternateX,
        alternateY
      ); // TODO ; change 500 and 200

    //var v31 = this.editor.graph.insertVertex(nodeTitle, null, 'Hello,', 0,nodeHeigth,nodeWidth, 200-nodeHeigth,'open');
    //  if (source === this.parent) nodeBox.setConnectable(true);
    //  else nodeBox.setConnectable(false);
    nodeBox.collapsed = true;
    return nodeBox;
  }

  createGraphBox(graph: Graph, source: mxCell) {
    let width = this.maxCoordinate(graph.nodes, 'x');
    let height = this.maxCoordinate(graph.nodes, 'y');
    let graphBox = this.createNodeBox(
      graph,
      NodeType.graph,
      source,
      width,
      height
    );
    graph.nodes.forEach((node) => {
      let type = Node.getType(node);
      if (type === NodeType.graph) this.createGraphBox(node as Graph, graphBox);
      else this.createNodeBox(node, type, graphBox);
    });
    this.createLinks(graph.links);
  }

  createLinks(links: Map<string, Link>) {
    links.forEach((link: Link) => {
      if (this.model.cells[link.id] === undefined) {
        let edge = this.editor.graph.insertEdge(
          this.parent,
          link.id,
          Link.getIcon(link),
          this.model.cells[link?.out],
          this.model.cells[link?.in],
          `strokeColor=${Link.getColor(link)}`
        );
        edge.setConnectable(false);
      }
    });
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
    graph.setCellsEditable(false);

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

    // Installs a custom tooltip for cells
    graph.getTooltipForCell = function (cell) {
      let tt = undefined;
      let node = getNodeByID(DATA, cell.id);
      if (node && node.type == NodeType.trend) {
        tt =
          'Variable cible : ' +
          getElementByChamp<VariablePhysioTemplate>(
            variablesTemplate,
            'id',
            (node as Trend).target
          ).name +
          '\n Paramètre : ' +
          (node as Trend).parameter;
      }

      if (node.type === NodeType.timer) {
        tt = (node as Timer).duration + ' min';
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

    // override the isCellMovable method in mxGraph to make start cells unmovable
    graph.isCellMovable = function (cell: mxCell) {
      return cell.style !== EventType.start;
    };

    return graph;
  }

  addListeners() {
    /**
     * quand un node bouge, on mets à jour la bdd
     */
    this.editor.graph.addListener(mx.mxEvent.CELLS_MOVED, (sender, evt) => {
      var cell = evt.getProperties('cell');
      cell.cells.forEach((element) => {
        let node = getNodeByID(this.graphData, element.id);

        if (node) {
          node.x = element.geometry.x;
          node.y = element.geometry.y;
          this.nodeService
            .updateNode(structuredClone(node), ['x', 'y'])
            .subscribe();
        }
      });
    });

    /*    this.editor.addListener(mx.mxEvent.ROOT, (sender, evt) => {
      var cell = evt.getProperties('cell');
      console.log('mx.mxEvent.GROUP_CELLS ');
    });
 */

    this.editor.graph.addListener(mx.mxEvent.DOUBLE_CLICK, (sender, evt) => {
      var cell: mxCell = evt.getProperty('cell');
      console.log('DOUBLE CLICK');
      let node = getNodeByID(this.graphData, cell.id);
      if (node === undefined) {
        let link = getLinkByID(this.graphData, cell.id);
        if (link) this.onEdgeClick(link, cell);
        return;
      } else if (node.type === NodeType.graph)
        this.onGroupClick(node as Graph, cell);
      else this.onNodeClick(node, cell);
    });

    mx.mxEvent.addListener(this.container, 'dragover', function (evt) {
      if (this.editor.graph.isEnabled()) {
        evt.stopPropagation();
        evt.preventDefault();
      }
    });

    this.editor.graph.model.addListener(mx.mxEvent.CHANGE, (sender, evt) => {
      console.log(
        'CHANGE --------------------------------------------------------------------------'
      );
      var changes = evt.getProperty('edit').changes;
      console.log('changes ', changes);
      for (var i = 0; i < changes.length; i++) {
        if (changes[i].constructor.name == 'mxTerminalChange') {
          if (changes[i].cell.edge && !changes[i].cell.value) {
            this.createEdge(changes[i].cell);
            break;
          }
        }

        if (changes[i].constructor.name == 'mxGeometryChange') {
          if (
            changes[i].cell.vertex &&
            changes[i].cell.children &&
            !changes[i].cell.id.includes(':') &&
            changes[i].cell.value == ''
          ) {
            this.onGroup(changes[i].cell);
            break;
          }
        }

        if (changes[i].constructor.name == 'mxChildChange') {
          if (
            changes[i].child.vertex &&
            changes[i].child.style === NodeType.graph &&
            changes[i].index === undefined &&
            changes[i].parent === null
          ) {
            let group = getNodeByID(this.graphData, changes[i].child) as Graph;
            if (group) this.onUngroup(changes[i].child, group);
            break;
          }
        }

        if (changes[i].constructor.name == 'mxCollapseChange') {
                    let cell = changes[i].cell

          let group = getNodeByID(this.graphData, cell.id) as Graph;
          console.log("groupe ",group)
          console.log("isCollapsed ",cell.isCollapsed())
          // TODO move the node beside when open
          this.onCollapse(cell,group,cell.isCollapsed())
          
         
            break;
          
        }


      }
    });

    this.editor.graph.model.addListener(mx.mxEvent.RESIZE, (sender, evt) => {
      console.log('RESIZE -------------------');
      var changes = evt.getProperty('edit').changes;
      console.log('evt ', evt);
    });

    mx.mxEvent.addListener(this.container, 'drop', function (evt) {
      if (this.editor.graph.isEnabled()) {
        evt.stopPropagation();
        evt.preventDefault();

        // Gets drop location point for vertex
        var pt = mx.mxUtils.convertPoint(
          this.editor.graph.container,
          mxEvent.getClientX(evt),
          mxEvent.getClientY(evt)
        );
        var tr = this.editor.graph.view.translate;
        var scale = this.editor.graph.view.scale;
        var x = pt.x / scale - tr.x;
        var y = pt.y / scale - tr.y;

        // Converts local images to data urls
        var filesArray = evt.dataTransfer.files;

        for (var i = 0; i < filesArray.length; i++) {
          this.handleDrop(
            this.editor.graph,
            filesArray[i],
            x + i * 10,
            y + i * 10
          );
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

    let outNode = getNodeByID(this.graphData, source.id);
    let inNode = getNodeByID(this.graphData, target.id);

    let link: Link = new Link({ out: '#' + outNode.id, in: '#' + inNode.id });

    const dialogRef = this.dialog.open(DialogComponent, {
      data: [link, Link, this.graphData.nodes, false],
    });

    dialogRef.afterClosed().subscribe((result: Link) => {
      if (result) {
        console.log('createEdge result ', result);

        this.nodeService
          .createLink(result.in, result.out, result.trigger)
          .subscribe((newLink: Link) => {
            console.log('createEdge newLink ', newLink);
            if (cell.parent === this.parent)
              this.graphData.links.set(newLink.id, newLink);
            else
              (getNodeByID(this.graphData, cell.parent.id) as Graph).links.set(
                newLink.id,
                newLink
              );

            cell.id = newLink.id;
            console.log('cell ', cell);
            console.log('model ', this.model);
            this.updateGraphData.emit(link);
          });
        cell.style = `strokeColor=${Link.getColor(result)}`;
        cell.value = Link.getIcon(result);
        this.editor.graph.refresh(cell);
      } else {
        this.editor.graph.removeCells([cell]);
      }
    });
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
    var vertexStyle = this.editor.graph.getStylesheet().getDefaultVertexStyle();
    vertexStyle[mx.mxConstants.DEFAULT_HOTSPOT] = 1;
    vertexStyle[mx.mxConstants.STYLE_STARTSIZE] = 30;
    //vertexStyle[mx.mxConstants.HIGHLIGHT_COLOR] = null;
    // 'https://cdn4.iconfinder.com/data/icons/doodle-3/167/trend-down-square-512.png';

    var edgeStyle = this.editor.graph.getStylesheet().getDefaultEdgeStyle();
    edgeStyle[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.scalePointArray; // EntityRelation ?
    edgeStyle[mx.mxConstants.STYLE_PERIMETER_SPACING] = 0;
    edgeStyle[mx.mxConstants.STYLE_STROKEWIDTH] = 3;
    edgeStyle[mx.mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
    edgeStyle[mx.mxConstants.STYLE_FONTCOLOR] = '#00000';
    edgeStyle[mx.mxConstants.STYLE_ROUNDED] = true;

    // create styles
    var nodeStyle = new Object();
    nodeStyle[mx.mxConstants.STYLE_PERIMETER] =
      mx.mxPerimeter.RectanglePerimeter;
    nodeStyle[mx.mxConstants.STYLE_ALIGN] = mx.mxConstants.ALIGN_CENTER;
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
    nodeStyle[mx.mxConstants.STYLE_FONTSIZE] = FONT_SIZE;
    nodeStyle[mx.mxConstants.STYLE_FONTSTYLE] = 0;
    nodeStyle[mx.mxConstants.STYLE_FONTFAMILY] = 'verdana';
    nodeStyle[mx.mxConstants.STYLE_SHADOW] = 1;

    let stylesTypes = [
      NodeType.trend,
      EventType.action,
      EventType.bio,
      //   EventType.start,
    ];

    stylesTypes.forEach((styleType) => {
      let style = mx.mxUtils.clone(nodeStyle);
      let color = Button.getButtonByType(styleType).color;
      style[mx.mxConstants.STYLE_FILLCOLOR] = color;
      style[mx.mxConstants.STYLE_GRADIENTCOLOR] = shade(color, 0.5);
      style[mx.mxConstants.STYLE_IMAGE] = `../assets/icons/${styleType}.png`;
      style[mx.mxConstants.STYLE_STROKECOLOR] = shade(color, -0.5);
      this.editor.graph.getStylesheet().putCellStyle(styleType, style);
    });

    let graphStyle = mx.mxUtils.clone(nodeStyle);
    let color = Button.getButtonByType(NodeType.graph).color;
    graphStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_SWIMLANE;
    graphStyle[mx.mxConstants.STYLE_FILLCOLOR] = color;
    graphStyle[
      mx.mxConstants.STYLE_IMAGE
    ] = `../assets/icons/${NodeType.graph}.png`;
    graphStyle[mx.mxConstants.STYLE_STARTSIZE] = NODE_HEIGTH;
    // graphStyle[mx.mxConstants.STYLE_SHADOW] = false;
    graphStyle[mx.mxConstants.STYLE_SPACING_LEFT] = '14';
    graphStyle[mx.mxConstants.STYLE_SWIMLANE_FILLCOLOR] = '#ffffff';
    graphStyle[mx.mxConstants.STYLE_GRADIENTCOLOR] = shade(color, 0.5);
    graphStyle[mx.mxConstants.STYLE_STROKECOLOR] = shade(color, -0.5);

    graphStyle[mx.mxConstants.STYLE_ROUNDED] = true;
    this.editor.graph.getStylesheet().putCellStyle(NodeType.graph, graphStyle);

    let imageStyle = new Object();
    imageStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_IMAGE;
    imageStyle[mx.mxConstants.STYLE_PERIMETER] =
      mx.mxPerimeter.RectanglePerimeter;
    imageStyle[mx.mxConstants.STYLE_IMAGE_WIDTH] = '50';
    imageStyle[mx.mxConstants.STYLE_IMAGE_HEIGHT] = '50';

    let startStyle = mx.mxUtils.clone(imageStyle);
    startStyle[mx.mxConstants.STYLE_IMAGE] = '../assets/icons/start.png';
    this.editor.graph.getStylesheet().putCellStyle('start', startStyle);

    let timerStyle = mx.mxUtils.clone(imageStyle);
    timerStyle[mx.mxConstants.STYLE_IMAGE] = '../assets/icons/timer.png';
    this.editor.graph.getStylesheet().putCellStyle('timer', timerStyle);

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
    this.editor.graph.getStylesheet().putCellStyle('port', portStyle);
  }

  configureUndoRedo() {
    undoManager = new mx.mxUndoManager();
    var listener = function (sender, evt) {
      undoManager.undoableEditHappened(evt.getProperty('edit'));
    };
    this.editor.graph.getModel().addListener(mx.mxEvent.UNDO, listener);
    this.editor.graph.getView().addListener(mx.mxEvent.UNDO, listener);
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

  /**
   * EVENTS HANDLERS
   */

  /**
   * event trigger when double-click on an edge
   * @param link
   * @param cell
   */
  onEdgeClick(link: Link, cell: mxCell) {
    let dialogRef = this.dialog.open(DialogComponent, {
      data: [link, Link, this.graphData.nodes, true],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.delete) {
          this.graphData.links.delete(link.id);
          this.editor.graph.removeCells([cell]);
          this.nodeService.deleteLink(link).subscribe();
          this.updateGraphData.emit(undefined);
        } else {
          link.trigger = result.trigger;
          cell.style = `strokeColor=${Link.getColor(link)}`;
          cell.value = Link.getIcon(link);
          this.editor.graph.refresh(cell);
          this.nodeService.updateLink(link).subscribe();
          this.updateGraphData.emit(link);
        }
      }
    });
  }

  /**
   * event trigger when double-click on a node
   * @param node
   * @param cell
   */
  onNodeClick(node: Node, cell: mxCell) {
    let dialogRef;

    let category: string =
      node.type == NodeType.event ? (node as Event).typeEvent : node.type;

    switch (category) {
      case NodeType.graph:
        //
        break;
      case EventType.bio:
        dialogRef = this.dialog.open(DialogComponent, {
          data: [node, Event, BioEvent.bioevents, true, ['template']],
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
          data: [node, Timer, [], true],
        });
    }

    if (dialogRef)
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result.delete) {
            this.graphData.nodes.delete(node.id);
            this.editor.graph.removeCells([cell]);
            // delete all the links link to the deleted node
            this.graphData.links.forEach((link) => {
              if (link.in == node.id || link.out == node.id)
                this.graphData.links.delete(link.id);
            });
            this.editor.graph.removeCells([cell]);
            this.nodeService.deleteNode(node).subscribe();
            this.updateGraphData.emit(undefined);
          } else {
            let updatableParameters = Node.getUpdatables(node);
            let updatedParameters = [];

            updatableParameters.forEach((parameter) => {
              if (node[parameter] != result[parameter]) {
                node[parameter] = result[parameter];
                updatedParameters.push(parameter);
              }
            });

            if (node.type == NodeType.event)
              (node as Event).template = Action.getActionById(
                (node as Event).event
              );

            cell.value = Node.getName(node);
            cell.geometry.width =
              MIN_NODE_WIDTH + cell.value.length * FONT_SIZE * FONT_RATIO;
            this.editor.graph.refresh(cell);
            this.nodeService.updateNode(node, updatedParameters).subscribe();
            this.updateGraphData.emit(node);
          }
        }
      });
  }

  /**
   * event trigger when double-click on a group
   * @param group
   * @param cell
   */
  onGroupClick(group: Graph, cell: mxCell) {
    let dialogRef = this.dialog.open(DialogComponent, {
      data: [group, Graph, [], true, ['template']],
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('onGroupClick ', result);

      if (result) {
        if (result.delete) {
          this.nodeService.deleteGraph(group).subscribe((res) => {
            this.graphData.nodes.delete(group.id);
            this.editor.graph.removeCells([cell]);
          });
          this.updateGraphData.emit(undefined);
        } else {
          group.name = result.name;
          cell.value = result.name;
          cell.geometry.width =
            MIN_NODE_WIDTH + cell.value.length * FONT_SIZE * FONT_RATIO;
          this.editor.graph.refresh(cell);
          this.nodeService
            .updateNode(structuredClone(group), ['name'])
            .subscribe();
          // this.updateGraphData.emit(group); NO UPDATE BECAUSE NAME DOESN'T IMPACT ANYTHING
        }
      }
    });
  }

  onGroup(cell: mxCell) {
    console.log('onGroup ', cell);
    let group = new Graph();

    cell.children.map((cell: mxCell) => {
      let node = getNodeByID(this.graphData, cell.id);
      if (node) {
        group.nodes.set(cell.id, node);
      }
    });

    group.x = cell.geometry.x;
    group.y = cell.geometry.y;
    console.log("goupX ",group.x," groupY ",group.y)

    let idNodesInGroup = Array.from(group.nodes.keys());

    let linksIllegal = new Map(
      [...this.graphData.links].filter(
        ([key, link]) =>
          (idNodesInGroup.includes(link.in) &&
            !idNodesInGroup.includes(link.out)) ||
          (!idNodesInGroup.includes(link.in) &&
            idNodesInGroup.includes(link.out))
      )
    );

    let dialogRef = this.dialog.open(GraphEditeurDialogComponent, {
      data: [group, variablesTemplate],
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.delete) {
          this.editor.execute('ungroup');
        } else {
          group.name = result.name;

          console.log('onGroup result ', result);
          console.log('onGroup group ', group);

          if (result.template) {
            // ADD LINK TO THE GRAPH IF TEMPLATE
            this.nodeService
              .copyGraph(structuredClone(group), true)
              .subscribe((res) => {
                Graph.graphs.set(res.id, result);
              });
          }

          group.template = false;

          this.nodeService
            .groupNodes(group, this.graphData, linksIllegal)
            .subscribe((indexes: string[]) => {
              console.log('CELL ', cell);
              this.editor.graph.removeCells(cell.children);
              this.editor.graph.removeCells([cell]);
              group.id = indexes[0];
              let groupStart = Event.createStart();
              groupStart.id = indexes[1];
              group.nodes.set(groupStart.id, groupStart);

              linksIllegal.forEach((link: Link) =>
                this.graphData.links.delete(link.id)
              );
              group.nodes.forEach((node: Node) =>
                this.graphData.nodes.delete(node.id)
              );
              this.graphData.nodes.set(group.id, group);
              this.updateGraphData.emit(group);
              console.log("this.graphData ",this.graphData)
            });
        }
      }
    });
  }

  onUngroup(cell: mxCell, group: Graph) {
    console.log('onUngroup ', cell);

    let start = getElementByChampMap<Node>(
      group.nodes,
      'event',
      EventType.start
    );

    console.log('group ', group);

    this.nodeService
      .ungroupNodes(group as Graph, this.graphData)
      .subscribe(() => {
        console.log('UNGROUP');
        console.log('CELL START ', this.editor.graph.model.cells[start.id]);
        this.editor.graph.removeCells([
          this.editor.graph.model.cells[start.id],
        ]);
        group.nodes.forEach((node: Node) =>
          this.graphData.nodes.set(node.id, node)
        );
        this.graphData.nodes.delete(group.id);
        //DATA = this.graphData;
        console.log('this.graphData ', this.graphData);
        this.updateGraphData.emit(undefined);
        this.editor.graph.refresh(cell);
      });
  }

  onCollapse(cell:mxCell,group:Graph,collapsed:boolean){
    console.log(cell)
    console.log(Array.from(this.editor.graph.model.cells))
    this.graphData.nodes.forEach((node:Node)=>{
      if(node.id !== group.id && Node.getName(node) !== EventType.start){
        let cellToMove:mxCell = this.editor.graph.model.cells[node.id]
        if (cellToMove.geometry.x+cellToMove.geometry.width > cell.geometry.x && cellToMove.geometry.x < cell.geometry.x+cell.geometry.width){
          console.log("cellToMove ",cellToMove)
          if(!collapsed){
            cellToMove.geometry.y += cell.geometry.height;
          }
          else {
            cellToMove.geometry.y = node.y;

          }
          console.log("cellToMove ",cellToMove.geometry.y)
          this.editor.graph.refresh(cellToMove);
        }
      }
    })
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
   * TOOLBAR
   */

  zoomIn() {
    this.editor.graph.zoomIn();
  }

  zoomOut() {
    this.editor.graph.zoomOut();
  }

  actual() {
    this.editor.graph.zoomActual();
  }

  fit() {
    this.editor.graph.center();
  }

  undo() {
    undoManager.undo();
  }

  redo() {
    undoManager.redo();
  }

  group() {
    this.editor.execute('group');
  }

  ungroup() {
    console.log('ungroup');
    this.editor.execute('ungroup');
  }

  groupDisabled() {
    return this.editor.graph.getSelectionModel()['cells'].length < 2;
  }

  ungroupDisabled() {
    if (this.editor.graph.getSelectionModel()['cells'].length != 1) return true;
    let cell: mxCell = this.editor.graph.getSelectionModel()['cells'][0];
    if (cell.style === NodeType.graph) return false;
    return true;
  }

  /**
   * UTILS
   */

  /**
   * get the maximum of the wanted coordinate of the list of nodes
   * @param nodes
   * @param coordinate
   * @returns number
   */
  private maxCoordinate(nodes: Map<string, Node>, coordinate): number {
    let max = 20;
    nodes.forEach((node) => {
      let value = node[coordinate];
      if (coordinate === 'x')
        value +=
          MIN_NODE_WIDTH + Node.getName(node).length * FONT_SIZE * FONT_RATIO;
      else value += NODE_HEIGTH;
      if (value > max) max = value;
    });
    return max + 10;
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
