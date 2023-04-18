import { Component, OnDestroy } from '@angular/core';
import * as echarts from 'echarts/types/dist/echarts';
import { EChartsOption, util } from 'echarts';
import 'echarts/extension/bmap/bmap';

const SymbolSize = 20;
const groupe = [
  [56.5, 20, "1"],
  [46.5, 30, "2"],
  [22.1, 40, "3"],
];

const PRV = [
  [15, 15],
];

const PMA= [
  [50, 10],
];

const Data = groupe.concat(PRV,PMA);

@Component({
  selector: 'app-carte',
  templateUrl: './carte.component.html',
  styleUrls: ['./carte.component.less']
})
export class CarteComponent implements OnDestroy{

  updatePosition: () => void;
  options: EChartsOption = {
    legend: {data:['group','PMA','PRV']},
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
      max: 100,
      type: 'value',
    },
    yAxis: {
      show:false,
      min: 0,
      max: 100,
      type: 'value',
    },
    series: [
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
        data: Data.slice(0, groupe.length),
        symbol: 'circle',
        itemStyle: {
          borderColor: '#555',
          color: '#37A2DA',
          
        },
      //  label:"b",
      },
      { // PRV
        name:'PRV',
        id: 's',
        type: 'scatter',
        symbolSize: SymbolSize,
        data: Data.slice(groupe.length,groupe.length+1),
        symbol: 'diamond',
        itemStyle: {
          borderColor: '#555',
          color: '#e06343',
        },
      },
      { // PMA
        name:'PMA',
        id: 't',
        type: 'scatter',
        symbolSize: SymbolSize,
        data: Data.slice(groupe.length+1,groupe.length+2),
        symbol: 'diamond',
        itemStyle: {
          borderColor: '#555',
          color: '#FC7D02',
        },
      }
    ],
  };
  constructor() { 

    console.log("group");
    console.log(Data.slice(0, groupe.length));

    console.log("PRV");
    console.log(Data.slice(groupe.length,groupe.length+1));

    console.log("PMA");
    console.log(Data.slice(groupe.length+1,groupe.length+2));

  }

  ngOnDestroy() {
    if (this.updatePosition) {
      window.removeEventListener('resize', this.updatePosition);
    }
  }

  onChartReady(myChart: any) {
    const onPointDragging = function (dataIndex) {
      Data[dataIndex] = myChart.convertFromPixel({ gridIndex: 0 }, this.position) as number[];

      // Update data
      myChart.setOption({
        series: [
          { // groupe
            name:'group',
            id: 'group',
            type: 'scatter',
            symbolSize: SymbolSize,
            data: Data.slice(0, groupe.length),
            symbol: 'circle',
            itemStyle: {
              borderColor: '#555',
              color: '#37A2DA',
              
            },
            label: {
              show: true,
              formatter: function(d) {
                return d.data[2];
              }
            }
          //  label:"b",
          },
          { // PRV
            name:'PRV',
            id: 's',
            type: 'scatter',
            symbolSize: SymbolSize,
            data: Data.slice(groupe.length,groupe.length+1),
            symbol: 'diamond',
            itemStyle: {
              borderColor: '#555',
              color: '#e06343',
            },
          },
          { // PMA
            name:'PMA',
            id: 't',
            type: 'scatter',
            symbolSize: SymbolSize,
            data: Data.slice(groupe.length+1,groupe.length+2),
            symbol: 'diamond',
            itemStyle: {
              borderColor: '#555',
              color: '#FC7D02',
            },
          }
        ],
      });
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
            position: myChart.convertToPixel({ gridIndex: 0 }, item),
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
}