import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import factory, {
  mxGraph,
  mxGraphModel,
  mxHierarchicalLayout,
  mxRubberband,
  mxEvent,
  mxConnectionHandler,
  mxImage,
  mxVertexHandler,
} from 'mxgraph';
import mx from '../../../../../mxgraph';

@Component({
  selector: 'app-mxgraph',
  templateUrl: './mxgraph.component.html',
  styleUrls: ['./mxgraph.component.less'],
})
export class MxgraphComponent implements AfterViewInit {
  title = 'ngmxgraph';

  @ViewChild('graphContainer') containerElementRef: ElementRef;

  get container() {
    return this.containerElementRef.nativeElement;
  }

  ngAfterViewInit(): void {
    if (mx.mxClient.isBrowserSupported()) {
      console.log('Yes! Yes!');
    }

    // this.contexticons();
    this.createControls();

    // Enables guides
    mx.mxGraphHandler.prototype.guidesEnabled = true;

    // Alt disables guides
/*     mx.mxGuide.prototype.isEnabledForEvent = function (evt) {
      return !mxEvent.isAltDown(evt);
    };
 */
    // Enables snapping waypoints to terminals
    mx.mxEdgeHandler.prototype.snapToTerminals = true;

    const graph: mxGraph = new mx.mxGraph(this.container);
    graph.setPanning(true);
    graph.setConnectable(true);
    //  this.defineConnectionPoints(graph);

    // Enables connect preview for the default edge style
    graph.connectionHandler.createEdgeState = function (me) {
      var edge = graph.createEdge(null, null, null, null, null);

      return new mx.mxCellState(
        this.graph.view,
        edge,
        this.graph.getCellStyle(edge)
      );
    };

    graph.connectionHandler.createTarget = true;

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

    const model: mxGraphModel = graph.getModel();
    // Enables rubberband selection
    new mx.mxRubberband(graph);
    graph.connectableEdges = true;
    graph.allowDanglingEdges = false;

    var parent = graph.getDefaultParent();

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

    this.style(graph);
    this.collapsed(graph);

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
				var ds = mx.mxUtils.makeDraggable(img, graph, this.insertNode, dragElt, null, null, graph.autoScroll, true);
				
				// Redirects feature to global switch. Note that this feature should only be used
				// if the the x and y arguments are used in funct to insert the cell.
				ds.isGuidesEnabled = function()
				{
					return graph.graphHandler.guidesEnabled;
				};
				
				// Restores original drag icon while outside of graph
				ds.createDragElement = mx.mxDragSource.prototype.createDragElement;

    model.beginUpdate();
    try {
      var v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
      var v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
      var e1 = graph.insertEdge(
        parent,
        null,
        '',
        v1,
        v2,
        'entryX=0.25;entryY=0;exitX=1;exitY=1;exitPerimeter=1'
      ); // to chose the entry and exit anchor point
      // graph.connectCell(e2,v3,false, mxShape.prototype.constraints[0]);

      var v3 = graph.insertVertex(
        parent,
        null,
        'Container',
        20,
        20,
        200,
        200,
        'shape=swimlane;startSize=20;'
      );
      v3.geometry.alternateBounds = new mx.mxRectangle(0, 0, 110, 70);
      var v31 = graph.insertVertex(v3, null, 'Hello,', 10, 40, 120, 80);
    } finally {
      model.endUpdate();
    }

    graph.centerZoom = false;

    document.body.appendChild(
      mx.mxUtils.button('Zoom In', function () {
        graph.zoomIn();
      })
    );

    document.body.appendChild(
      mx.mxUtils.button('Zoom Out', function () {
        graph.zoomOut();
      })
    );

    // Uncomment the following if you want the container
    // to fit the size of the graph
    //graph.setResizeContainer(true);

    // graph.selectedModel(() => {});
  }

  /*   zoomIn() {
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
  } */

  addListeners(graph) {
    graph.addListener(mx.mxEvent.CELLS_MOVED, function (sender, evt) {
      console.log('__________________________');

      var cell = evt.getProperties('cell');
      console.log(cell.cells[0].geometry.x); //Show the new x_geometry
    });

    graph.addListener(mx.mxEvent.LABEL_CHANGED, function (sender, evt) {
      var cell = evt.getProperty('cell');
      console.log(cell.value);
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
  style(graph: mxGraph) {
    var vertexStyle = graph.getStylesheet().getDefaultVertexStyle();
    vertexStyle[mx.mxConstants.STYLE_ROUNDED] = true;
    vertexStyle[mx.mxConstants.DEFAULT_HOTSPOT] = 1;
    //vertexStyle[mx.mxConstants.HIGHLIGHT_COLOR] = null;

    // vertexStyle[mx.mxConstants.STYLE_SHAPE] = mx.mxConstants.SHAPE_IMAGE;
    // vertexStyle[mx.mxConstants.STYLE_IMAGE] =
    //   'https://cdn4.iconfinder.com/data/icons/doodle-3/167/trend-down-square-512.png';

    var edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
    edgeStyle[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.TopToBottom;
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
}
