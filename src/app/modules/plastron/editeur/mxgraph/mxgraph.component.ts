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
} from 'src/app/models/vertex/node';
import { NodeService } from 'src/app/services/node.service';
import { getElementByChamp } from 'src/app/functions/tools';
import { Button } from 'src/app/functions/display';
import { VariablePhysioTemplate } from 'src/app/models/vertex/variablePhysio';
import { MatDialog } from '@angular/material/dialog';
import { Action, BioEvent } from 'src/app/models/vertex/event';
import { DialogComponent } from 'src/app/modules/shared/dialog/dialog.component';

@Component({
  selector: 'app-mxgraph',
  templateUrl: './mxgraph.component.html',
  styleUrls: ['./mxgraph.component.less'],
})
export class MxgraphComponent implements AfterViewInit {
  title = 'ngmxgraph';
  actionByCategories;

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
      if (value.nodes && value.links && this.model) this.updateModel();
    }
  }

  @Input() variablesTemplate: VariablePhysioTemplate[];
  @Input() allBioevents!: BioEvent[];
  @Input() allActions!: Action[];

  @ViewChild('graphContainer') containerElementRef: ElementRef;

  constructor(public nodeService: NodeService, public dialog: MatDialog) {}

  get container() {
    return this.containerElementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    if (mx.mxClient.isBrowserSupported()) {
      console.log('Yes! Yes!');
    }
    // Enables guides
    mx.mxGraphHandler.prototype.guidesEnabled = true;

    // Enables snapping waypoints to terminals
    mx.mxEdgeHandler.prototype.snapToTerminals = true;

    this.initContainer();

    this.graph = this.initGraph();

    // Enables rubberband selection
    new mx.mxRubberband(this.graph);
    var keyHandler = new mx.mxKeyHandler(this.graph);

    this.model = this.graph.getModel();
    this.parent = this.graph.getDefaultParent();

    this.configureStylesheet();
    // this.configureLayout();
    this.collapsed(this.graph);
    this.addListeners();
    this.graph.setResizeContainer(true);
  }

  updateModel() {
    this.model.beginUpdate();
    try {
      console.log(this.graphData);
      this.graphData.nodes.forEach((node: Node) => {
        let name = Node.getName(node);
        let label =
          node.type == NodeType.event && (node as Event).template
            ? (node as Event).template.name
            : name;
        let nodeWidth = 50 + label.length * 8;
        let nodeHeigth = 30;
        let style =
          node.type == NodeType.event
            ? (node as Event).typeEvent == EventType.start
              ? 'image'
              : (node as Event).typeEvent
            : node.type;

        let nodeTitle = this.graph.insertVertex(
          this.parent,
          node.id,
          label,
          node.x,
          node.y,
          nodeWidth,
          nodeHeigth,
          style
        );

        nodeTitle.geometry.alternateBounds = new mx.mxRectangle(
          0,
          0,
          nodeWidth,
          200
        );

        //var v31 = this.graph.insertVertex(nodeTitle, null, 'Hello,', 0,nodeHeigth,nodeWidth, 200-nodeHeigth,'open');
        nodeTitle.collapsed = true;

        if (node.type == NodeType.trend) {
          nodeTitle['tooltip'] =
            getElementByChamp<VariablePhysioTemplate>(
              this.variablesTemplate,
              'id',
              (node as Trend).target
            ).name +
            ', ' +
            (node as Trend).parameter;
        }
      });

      this.graphData.links.forEach((link: Link) => {
        let color = link.start ? 'green' : 'red';
        this.graph.insertEdge(
          this.parent,
          link.id,
          link.start,
          this.model.cells[link?.out],
          this.model.cells[link?.in],
          `strokeColor=${color}`
        );
      });

      console.log(this.graph);

      /* var e1 = this.graph.insertEdge(
        this.parent,
        null,
        '',
        v1,
        v2,
        'entryX=0.25;entryY=0;exitX=1;exitY=1;exitPerimeter=1'
      ); */ // to chose the entry and exit anchor point
      // graph.connectCell(e2,v3,false, mxShape.prototype.constraints[0]);

      /*  var v3 = this.graph.insertVertex(
        this.parent,
        null,
        'Container',
        20,
        20,
        200,
        200,
        'shape=swimlane;startSize=20;'
      );
      v3.geometry.alternateBounds = new mx.mxRectangle(0, 0, 110, 70);
      var v31 = this.graph.insertVertex(v3, null, 'Hello,', 10, 40, 120, 80); */
    } finally {
      this.model.endUpdate();
    }
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

    // Disables global features
    graph.collapseToPreferredSize = false;
    graph.constrainChildren = false;
    graph.cellsSelectable = false;
    graph.extendParentsOnAdd = false;
    graph.extendParents = false;
    graph.border = 10;
    graph.edgeLabelsMovable = false;

    // Enables connect preview for the default edge style
    graph.connectionHandler.createEdgeState = function (me) {
      var edge = graph.createEdge(null, null, null, null, null);

      return new mx.mxCellState(
        this.graph.view,
        edge,
        this.graph.getCellStyle(edge)
      );
    };

    //  graph.connectionHandler.createTarget = true;
    graph.centerZoom = true;

    /*     graph.createHandler = function(state)
				{
					if (state != null &&
						this.model.isVertex(state.cell))
					{
						return new mx.mxVertexToolHandler(state);
					}

					return mxGraph.prototype.createHandler.apply(this, arguments);
				}; */

    // Specifies the default edge style
    graph.getStylesheet().getDefaultEdgeStyle()['edgeStyle'] =
      'orthogonalEdgeStyle';

    graph.connectableEdges = true;
    graph.allowDanglingEdges = false;

    // Installs a custom tooltip for cells
    graph.getTooltipForCell = function (cell) {
      console.log(cell);
      return cell['tooltip'];
    };

    return graph;
  }

  initConnectionHandler(graph: mxGraph) {
    let connectionHandlerStart: mxConnectionHandler =
      new mx.mxConnectionHandler(graph, function (source, target, style) {
        let edge = new mx.mxCell('', new mx.mxGeometry());
        edge.setEdge(true);
        edge.setStyle(style);
        edge.geometry.relative = true;
        return edge;
      });

    connectionHandlerStart.connectImage = new mx.mxImage(
      'assets/icons/start.png',
      14,
      14
    );

    let connectionHandlerStop: mxConnectionHandler = new mx.mxConnectionHandler(
      graph,
      function (source, target, style) {
        let edge = new mx.mxCell('', new mx.mxGeometry());
        edge.setEdge(true);
        edge.setStyle(style);
        edge.geometry.relative = true;
        return edge;
      }
    );

    connectionHandlerStop.connectImage = new mx.mxImage(
      'assets/icons/stop.png',
      14,
      14
    );
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
        node.x = element.geometry.x;
        node.y = element.geometry.y;
        this.nodeService
          .updateNode(node, ['x', 'y'])
          .subscribe((res) => console.log(res));
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
      console.log(cell);
      let node = getElementByChamp<Node>(this.graphData.nodes, 'id', cell.id);

      this.actionByCategories = Action.getListByCategory();

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
            data: [node, Event, this.actionByCategories, true, ['template']],
          });
          break;
        case NodeType.trend:
          dialogRef = this.dialog.open(DialogComponent, {
            data: [node, Trend, this.variablesTemplate, true],
          });
          break;
        case NodeType.timer:
        //
      }

      if (dialogRef)
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            if (result.delete) {
              /*   let deletedNode = this.graphData.nodes.splice(index, 1)[0];
            this.graphData.splice(index, 1);
            let ref = deletedNode.id ;

            console.log("deletedNode ",deletedNode)
            
            if (deletedNode.type == NodeType.event) ref = (deletedNode as Event).event;
            console.log("ref ",ref)
            result.ref = ref;
            this.updateNode.emit([result, index]); */
            } else {
              console.log('result ', result);
              console.log('cell ', cell);
              console.log('node ', node);
              node = result;
              if (node.type == NodeType.trend) cell.value = result['name'];
              // this.updateModel(); -> diff de initModel
              this.model.beginUpdate();
              try {
                if (node.type == NodeType.trend) {
                  cell.value = result['name'];
                  cell.geometry.width = 50 + cell.value.length * 8;
                }
              } finally {
                this.model.endUpdate();
              }
            }

            //    this.updateChart();
          }
        });
    });

    mx.mxEvent.addListener(this.container, 'dragover', function (evt) {
      if (this.graph.isEnabled()) {
        evt.stopPropagation();
        evt.preventDefault();
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

    let trendStyle = mx.mxUtils.clone(nodeStyle);
    trendStyle[mx.mxConstants.STYLE_FILLCOLOR] = Button.getButtonByType(
      NodeType.trend
    ).color;
    trendStyle[mx.mxConstants.STYLE_IMAGE] = '../assets/icons/trend.png';
    this.graph.getStylesheet().putCellStyle(NodeType.trend, trendStyle);

    let eventStyle = mx.mxUtils.clone(nodeStyle);
    eventStyle[mx.mxConstants.STYLE_FILLCOLOR] = Button.getButtonByType(
      EventType.action
    ).color;
    eventStyle[mx.mxConstants.STYLE_IMAGE] = '../assets/icons/event.png';
    this.graph.getStylesheet().putCellStyle(EventType.action, eventStyle);

    let openStyle = new Object();
    openStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_RECTANGLE;
    openStyle[mx.mxConstants.STYLE_STARTSIZE] = 20;
    openStyle[mx.mxConstants.STYLE_STROKECOLOR] = 'white';
    openStyle[mx.mxConstants.STYLE_FILLCOLOR] = 'white';
    openStyle[mx.mxConstants.STYLE_FOLDABLE] = false;
    this.graph.getStylesheet().putCellStyle('open', openStyle);

    let imageStyle = new Object();
    imageStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_IMAGE;
    imageStyle[mx.mxConstants.STYLE_PERIMETER] =
      mx.mxPerimeter.RectanglePerimeter;
    imageStyle[mx.mxConstants.STYLE_IMAGE] = '../assets/icons/start.png';
    imageStyle[mx.mxConstants.STYLE_FONTCOLOR] = 'white';
    this.graph.getStylesheet().putCellStyle('image', imageStyle);
  }

  // Installs auto layout for all levels
  configureLayout() {
    var layout = new mx.mxStackLayout(this.graph, true);
    layout.border = this.graph.border;
    var layoutMgr: mxLayoutManager = new mx.mxLayoutManager(this.graph);
    layoutMgr.getLayout = function (cell) {
      if (!cell.collapsed) {
        if (cell.parent != this.graph.model.root) {
          layout.resizeParent = true;
          layout.horizontal = false;
          layout.spacing = 10;
        } else {
          layout.resizeParent = true;
          layout.horizontal = true;
          layout.spacing = 40;
        }

        return layout;
      }

      return null;
    };
  }

  // Overridden to define per-shape connection points
  // Defines the default constraints for all shapes
  defineConnectionPoints(graph) {
    graph.getAllConnectionConstraints = function (terminal, source) {
      if (terminal != null && terminal.shape != null) {
        if (terminal.shape.stencil != null) {
          if (terminal.shape.stencil.constraints != null) {
            return terminal.shape.stencil.constraints;
          }
        } else if (terminal.shape.constraints != null) {
          return terminal.shape.constraints;
        }
      }

      return null;
    };

    mx.mxShape.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 1), true),
    ];

    // Edges have no connection points
    mx.mxPolyline.constraints = null;
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
  /* 
  contexticons(){
    this.mxVertexToolHandler.prototype = new mx.mxVertexHandler();
		this.mxVertexToolHandler.prototype.constructor = this.mxVertexToolHandler;

		this.mxVertexToolHandler.prototype.domNode = null;

		this.mxVertexToolHandler.prototype.init = function()
		{
			mxVertexHandler.prototype.init.apply(this, arguments);

			// In this example we force the use of DIVs for images in IE. This
			// handles transparency in PNG images properly in IE and fixes the
			// problem that IE routes all mouse events for a gesture via the
			// initial IMG node, which means the target vertices 
			this.domNode = document.createElement('div');
			this.domNode.style.position = 'absolute';
			this.domNode.style.whiteSpace = 'nowrap';
			
			function createImage(src)
			{
				return mx.mxUtils.createImage(src);
			};

			// Delete
			var img = createImage('images/delete2.png');
			img.setAttribute('title', 'Delete');
			img.style.cursor = 'pointer';
			img.style.width = '16px';
			img.style.height = '16px';
			mxEvent.addGestureListeners(img,
				mx.mxUtils.bind(this, function(evt)
				{
					// Disables dragging the image
					mxEvent.consume(evt);
				})
			);
			mxEvent.addListener(img, 'click',
				mx.mxUtils.bind(this, function(evt)
				{
					this.graph.removeCells([this.state.cell]);
					mxEvent.consume(evt);
				})
			);
			this.domNode.appendChild(img);

			// Size
			var img = createImage('images/fit_to_size.png');
			img.setAttribute('title', 'Resize');
			img.style.cursor = 'se-resize';
			img.style.width = '16px';
			img.style.height = '16px';
			mxEvent.addGestureListeners(img,
				mx.mxUtils.bind(this, function(evt)
				{
					this.start(mxEvent.getClientX(evt), mxEvent.getClientY(evt), 7);
					this.graph.isMouseDown = true;
					this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
					mxEvent.consume(evt);
				})
			);
			this.domNode.appendChild(img);

			// Move
			var img = createImage('images/plus.png');
			img.setAttribute('title', 'Move');
			img.style.cursor = 'move';
			img.style.width = '16px';
			img.style.height = '16px';
			mxEvent.addGestureListeners(img,
				mx.mxUtils.bind(this, function(evt)
				{
					this.graph.graphHandler.start(this.state.cell,
						mxEvent.getClientX(evt), mxEvent.getClientY(evt));
					this.graph.graphHandler.cellWasClicked = true;
					this.graph.isMouseDown = true;
					this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
					mxEvent.consume(evt);
				})
			);
			this.domNode.appendChild(img);

			// Connect
			var img = createImage('images/check.png');
			img.setAttribute('title', 'Connect');
			img.style.cursor = 'pointer';
			img.style.width = '16px';
			img.style.height = '16px';
			mxEvent.addGestureListeners(img,
				mx.mxUtils.bind(this, function(evt)
				{
					var pt = mx.mxUtils.convertPoint(this.graph.container,
							mxEvent.getClientX(evt), mxEvent.getClientY(evt));
					this.graph.connectionHandler.start(this.state, pt.x, pt.y);
					this.graph.isMouseDown = true;
					this.graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
					mxEvent.consume(evt);
				})
			);
			this.domNode.appendChild(img);
			
			this.graph.container.appendChild(this.domNode);
			this.redrawTools();
		};

		this.mxVertexToolHandler.prototype.redraw = function()
		{
			mx.mxVertexHandler.prototype.redraw.apply(this);
			this.redrawTools();
		};

		this.mxVertexToolHandler.prototype.redrawTools = function()
		{
			if (this.state != null && this.domNode != null)
			{
				var dy = (mx.mxClient.IS_VML && document.compatMode == 'CSS1Compat') ? 20 : 4;
				this.domNode.style.left = (this.state.x + this.state.width - 56) + 'px';
				this.domNode.style.top = (this.state.y + this.state.height + dy) + 'px';
			}
		};
		
		this.mxVertexToolHandler.prototype.destroy = function(sender, me)
		{
			mx.mxVertexHandler.prototype.destroy.apply(this, arguments);

			if (this.domNode != null)
			{
				this.domNode.parentNode.removeChild(this.domNode);
				this.domNode = null;
			}
		};
  } */

  createControls() {
    // Specifies the URL and size of the new control
    var startImage = new mx.mxImage('assets/icons/start.png', 16, 16);

    // Overridden to add an additional control to the state at creation time
    mx.mxCellRendererCreateControl = mx.mxCellRenderer.prototype.createControl;
    mx.mxCellRenderer.prototype.createControl = function (state) {
      mx.mxCellRendererCreateControl.apply(this, arguments);

      var graph = state.view.graph;

      if (graph.getModel().isVertex(state.cell)) {
        if (state.deleteControl == null) {
          var b = new mx.mxRectangle(0, 0, startImage.width, startImage.height);
          state.deleteControl = new mx.mxImageShape(b, startImage.src);
          state.deleteControl.dialect = graph.dialect;
          state.deleteControl.preserveImageAspect = false;

          this.initControl(state, state.deleteControl, false, function (evt) {
            if (graph.isEnabled()) {
              graph.removeCells([state.cell]);
              mxEvent.consume(evt);
            }
          });
        }
      } else if (state.deleteControl != null) {
        state.deleteControl.destroy();
        state.deleteControl = null;
      }
    };

    // Helper function to compute the bounds of the control
    var getDeleteControlBounds = function (state) {
      if (state.deleteControl != null) {
        var oldScale = state.deleteControl.scale;
        var w = state.deleteControl.bounds.width / oldScale;
        var h = state.deleteControl.bounds.height / oldScale;
        var s = state.view.scale;

        return state.view.graph.getModel().isEdge(state.cell)
          ? new mx.mxRectangle(
              state.x + state.width / 2 - (w / 2) * s,
              state.y + state.height / 2 - (h / 2) * s,
              w * s,
              h * s
            )
          : new mx.mxRectangle(
              state.x + state.width - w * s,
              state.y,
              w * s,
              h * s
            );
      }

      return null;
    };

    // Overridden to update the scale and bounds of the control
    mx.mxCellRendererRedrawControl = mx.mxCellRenderer.prototype.redrawControl;
    mx.mxCellRenderer.prototype.redrawControl = function (state) {
      mx.mxCellRendererRedrawControl.apply(this, arguments);

      if (state.deleteControl != null) {
        var bounds = getDeleteControlBounds(state);
        var s = state.view.scale;

        if (
          state.deleteControl.scale != s ||
          !state.deleteControl.bounds.equals(bounds)
        ) {
          state.deleteControl.bounds = bounds;
          state.deleteControl.scale = s;
          state.deleteControl.redraw();
        }
      }
    };

    // Overridden to remove the control if the state is destroyed
    mx.mxCellRendererDestroy = mx.mxCellRenderer.prototype.destroy;
    mx.mxCellRenderer.prototype.destroy = function (state) {
      mx.mxCellRendererDestroy.apply(this, arguments);

      if (state.deleteControl != null) {
        state.deleteControl.destroy();
        state.deleteControl = null;
      }
    };
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
