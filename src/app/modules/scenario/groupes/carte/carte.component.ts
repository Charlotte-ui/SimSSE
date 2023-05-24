import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import * as echarts from 'echarts/types/dist/echarts';
import { EChartsOption, util } from 'echarts';
import 'echarts/extension/bmap/bmap';

const SymbolSize = 20;
let Data = [];
let SceneNb = 0;
let SIZE_MAP = 600;
let MARGIN = 25;
let MAX_POSITION = 100 ;

@Component({
  selector: 'app-carte',
  templateUrl: './carte.component.html',
  styleUrls: ['./carte.component.less']
})
export class CarteComponent implements OnDestroy{

  @Input() set data(value: (string | number)[][]) {
    if (value) { // if value isnt undefined
      Data =  value;
      SceneNb = value.length - 3 ; // le nombre de groupe est le nombre de data  sauf PRV et PMA et CADI
      this.updateChart();
    }
  } 

  @Output() static positionsChange = new EventEmitter<any[]>();
  @Output()  positionsChange2 ; // use this one 


  updatePosition: () => void;
  initialChartOption: EChartsOption = {
    legend: {data:['group','PMA','PRV','CADI']},
    tooltip: {
      triggerOn: 'none',
      formatter: (params) =>
        'X: ' + params.data[0].toFixed(2) + '<br>Y: ' + params.data[1].toFixed(2),
    },
    grid:{
      show:false,
      right:'0',
      bottom:'0',
      top:'0',
      left:'0',
    },
    xAxis: {
      show:false,
      min: 0,
      max: MAX_POSITION,
      type: 'value',
    },
    yAxis: {
      show:false,
      min: 0,
      max: MAX_POSITION,
      type: 'value',
    },
    series: [],
  };

  mergeOptions = {};

  constructor() {
    this.positionsChange2 = CarteComponent.positionsChange;
  }

  ngOnDestroy() {
    if (this.updatePosition) {
      window.removeEventListener('resize', this.updatePosition);
    }
  }

  onChartReady(myChart: any) {

    const onPointDragging = function (dataIndex) {

      let newPosition = myChart.convertFromPixel({ gridIndex: 0 }, this.position) as number[];

      Data[dataIndex][0] = newPosition[0]
      Data[dataIndex][1] = newPosition[1]

      // Update data
      myChart.setOption({
        series: [
          { // groupe
            name:'group',
            id: 'group',
            type: 'scatter',
            symbolSize: SymbolSize,
            data: Data.slice(0, SceneNb),
            symbol: 'circle',
            itemStyle: {
              borderColor: '#555',
              color: 'rgba(245, 40, 145, 1)',
              opacity:1

            },
            label: {
              show: true,
              formatter: function(d) {
                return d.data[2];
              }
            }
          },
          { // PRV
            name:'PRV',
            id: 'PRV',
            type: 'scatter',
            symbolSize: SymbolSize,
            data: Data.slice(SceneNb,SceneNb+1),
            symbol: 'diamond',
            itemStyle: {
              borderColor: '#555',
              color: 'rgba(71, 245, 39, 1)',
              opacity:1

            },
          },
          { // PMA
            name:'PMA',
            id: 'PMA',
            type: 'scatter',
            symbolSize: SymbolSize,
            data: Data.slice(SceneNb+1,SceneNb+2),
            symbol: 'diamond',
            itemStyle: {
              borderColor: '#555',
              color: 'rgba(245, 39, 39, 1)',
              opacity:1
            },
          },
          { // CADI
          name:'CADI',
          id: 'CADI',
          type: 'scatter',
          symbolSize: SymbolSize,
          data: Data.slice(SceneNb+2,SceneNb+3),
          symbol: 'diamond',
          itemStyle: {
            borderColor: '#555',
            color: 'rgba(39, 213, 245, 1)',
            opacity:1
          },
          }
        ],
      });

      CarteComponent.positionsChange.emit(Data);
    };

    const showTooltip = (dataIndex) => {
      myChart.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex,
      });
    };

    const hideTooltip = () => {
      myChart.dispatchAction({
        type: 'hideTip',
      });
    };

    const updatePosition = () => {

      myChart.setOption({
        graphic: util.map(Data, (item) => ({
          position: myChart.convertToPixel({ gridIndex: 0 }, item),
        })),
      });
    };

    // save handler and remove it on destroy
    this.updatePosition = updatePosition;

    setTimeout(() => {
      myChart.setOption({
        graphic: util.map(Data, (item, dataIndex) => {
          return {
            type: 'circle',
            position: this.initPosition(item),
            shape: {
              cx: 0,
              cy: 0,
              r: SymbolSize / 2,
            },
            invisible: true,
            draggable: true,
            ondrag: util.curry<(dataIndex: any) => void, number>(onPointDragging, dataIndex),
            onmousemove: util.curry<(dataIndex: any) => void, number>(showTooltip, dataIndex),
            onmouseout: util.curry<(dataIndex: any) => void, number>(hideTooltip, dataIndex),
            z: 100,
          };
        }),
      });
    }, 0);
  }

  public updateChart(){

    let series = [
      { // groupe
        name:'group',
        id: 'group',
        label: {
          show: true,
          formatter: function(d) {
            return d.data[2];
          }
        },
        type: 'scatter',
        symbolSize: SymbolSize,
        data: Data.slice(0, SceneNb),
        symbol: 'circle',
        itemStyle: {
          borderColor: '#555',
          color: 'rgba(245, 40, 145, 1)',
          opacity:1   
        },
      },
      { // PRV
        name:'PRV',
        id: 'PRV',
        type: 'scatter',
        symbolSize: SymbolSize,
        data: Data.slice(SceneNb,SceneNb+1),
        symbol: 'diamond',
        itemStyle: {
          borderColor: '#555',
          color: 'rgba(71, 245, 39, 1)',
          opacity:1

        },
      },
      { // PMA
        name:'PMA',
        id: 'PMA',
        type: 'scatter',
        symbolSize: SymbolSize,
        data: Data.slice(SceneNb+1,SceneNb+2),
        symbol: 'diamond',
        itemStyle: {
          borderColor: '#555',
          color: 'rgba(245, 39, 39, 1)',
          opacity:1

        },
      },
      { // CADI
        name:'CADI',
        id: 'CADI',
        type: 'scatter',
        symbolSize: SymbolSize,
        data: Data.slice(SceneNb+2,SceneNb+3),
        symbol: 'diamond',
        itemStyle: {
          borderColor: '#555',
          color: 'rgba(39, 213, 245, 1)',
          opacity:1

        },
      }
    ]

    this.mergeOptions = {
      series: series
    };
  }

 //  myChart.convertToPixel({ gridIndex: 0 },index) does'nt work

  initPosition(position:number[]){
    let newX = (SIZE_MAP+MARGIN*2) - position[1] * (SIZE_MAP+MARGIN*2) / MAX_POSITION ;
    let newY =  position[0] * (SIZE_MAP+MARGIN*2) / MAX_POSITION ;
    return [newY,newX]
  }
}



