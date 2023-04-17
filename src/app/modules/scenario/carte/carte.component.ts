import { Component, OnDestroy } from '@angular/core';
import * as echarts from 'echarts/types/dist/echarts';
import { EChartsOption, util } from 'echarts';
import 'echarts/extension/bmap/bmap';

const SymbolSize = 20;
const Data = [
  [15, 0],
  [50, 10],
  [56.5, 20],
  [46.5, 30],
  [22.1, 40],
];

@Component({
  selector: 'app-carte',
  templateUrl: './carte.component.html',
  styleUrls: ['./carte.component.less']
})
export class CarteComponent implements OnDestroy{
  updatePosition: () => void;
  options: EChartsOption = {
    tooltip: {
      triggerOn: 'none',
      formatter: (params) =>
        'X: ' + params.data[0].toFixed(2) + '<br>Y: ' + params.data[1].toFixed(2),
    },
    grid: {},
    xAxis: {
      min: 0,
      max: 100,
      type: 'value',
    },
    yAxis: {
      min: 0,
      max: 100,
      type: 'value',
    },
    series: [
      { // groupe
        id: 'group',
        type: 'scatter',
        symbolSize: SymbolSize,
        data: Data,
        symbol: 'pin'
      },
      { // groupe
        id: 's',
        type: 'effectScatter',
        symbolSize: SymbolSize,
        data: Data,
        symbol: 'diamond'
      }
    ],
  };
  constructor() { }

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
          {
            id: 'group',
            data: Data,
          },
          {
            id: 's',
            data: Data,
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
            invisible: false,
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