import { Component, OnInit, Inject, Input } from '@angular/core';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';
import { Trend,Event, Link } from 'src/app/modules/core/models/node';

@Component({
  selector: 'app-editeur-graphe-nodal',
  templateUrl: './editeur-graphe-nodal.component.html',
  styleUrls: ['./editeur-graphe-nodal.component.less']
})
export class EditeurGrapheNodalComponent implements OnInit {

  echartsInstance ;

  mergeOptions = {};

  @Input() nodes!:  (Event | Trend)[];
  @Input() links!:  Link[];


  graphData = [
    {
      name: 'Tendance 1',
      x: 300,
      y: 300,
    },
    {
      name: 'Tendance 2',
      x: 800,
      y: 300
    },
    {
      name: 'Event 1',
      x: 550,
      y: 100
    },
  ]

  graphLink =  [
    {
      source: 0,
      target: 1,
      symbolSize: [5, 20],
      label: {
        show: true
      },
      lineStyle: {
        width: 5,
        curveness: 0.2
      }
    },
    {
      source: 'Node 2',
      target: 'Node 1',
      label: {
        show: true
      },
      lineStyle: {
        curveness: 0.2
      }
    },
    {
      source: 'Node 1',
      target: 'Node 3'
    },
    {
      source: 'Node 2',
      target: 'Node 3'
    }
  ]

  initialChartOption: EChartsOption = {
    title: {
      text: 'Basic Graph'
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'none',
        symbolSize: 50,
        roam: true,
        label: {
          show: true
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 20
        },
        data: this.graphData,
        // links: [],
        links: this.graphLink,
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0
        }
      }
    ]
  };



  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  onChartClick(event:any): void {

    let nodeId = event.dataIndex;

    console.log(event)

    const dialogRef = this.dialog.open(NodeDialogComponent, {
      data: this.nodes[nodeId],
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);

      if (result == "delete"){
        this.nodes.splice(nodeId, 1); 
        this.graphData.splice(nodeId, 1); 
        console.log(this.nodes)
      }
      else {
        this.nodes[nodeId] = result;
        this.graphData[nodeId].name = result.name;
        console.log(this.initialChartOption)
      }

      this.updateChart();
    });
  }

  updateChart(){


    let series = [
      {
        type: 'graph',
        layout: 'none',
        symbolSize: 50,
        roam: true,
        label: {
          show: true
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 20
        },
        data: this.graphData,
        // links: [],
        links: this.graphLink,
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0
        }
      }
    ]

    this.mergeOptions = {
      series: series
    };

    // Applying my dynamic data here


    //this.echartsInstance.

    //this.chartOption.
  }

  }


