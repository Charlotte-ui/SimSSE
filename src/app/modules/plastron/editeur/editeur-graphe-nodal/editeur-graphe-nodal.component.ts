import { Component, OnInit, Inject } from '@angular/core';
import { NgxEchartsModule, NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NodeDialogComponent } from './node-dialog/node-dialog.component';

@Component({
  selector: 'app-editeur-graphe-nodal',
  templateUrl: './editeur-graphe-nodal.component.html',
  styleUrls: ['./editeur-graphe-nodal.component.less']
})
export class EditeurGrapheNodalComponent implements OnInit {


  data = [
    {
      name: 'Tendance 1',
      x: 300,
      y: 300,
      type:'trend',
      cible:'SpO2',
      pente:-1
    },
    {
      name: 'Tendance 2',
      x: 800,
      y: 300,
      type:'trend',
      cible:'FR',
      pente:1
    },
    {
      name: 'Event 1',
      x: 550,
      y: 100,
      type:'event',
      event:'oxygénothérapie'
    },
  ]

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

  chartOption: EChartsOption = {
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
        links: [
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
        ],
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

  onChartClick(event:any): void {

    console.log(event)

    const dialogRef = this.dialog.open(NodeDialogComponent, {
      data: {name: "this.name", animal: "this.animal"},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      //this.animal = result;
    });
  }

  }


