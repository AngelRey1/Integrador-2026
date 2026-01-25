import { NbJSThemeOptions } from '@nebular/theme';

export const SPORTCONNECT_THEME = {
  name: 'sportconnect',
  base: 'default',
  variables: {
    // Colores SportConnect
    primary: '#00D09C',
    success: '#00D09C',
    info: '#0A7B8A',
    warning: '#FFD700',
    danger: '#EF4444',

    // Paletas de colores
    primaryLight: '#A9F1E1',
    successLight: '#A9F1E1',
    infoLight: '#A3E9FF',
    warningLight: '#FEF3C7',
    dangerLight: '#FEE2E2',

    // Backgrounds
    bg: '#F8FAFC',
    bg2: '#F3F4F6',
    bg3: '#E2E8F0',
    bg4: '#CBD5E1',

    // Borders
    border: '#E2E8F0',
    border2: '#CBD5E1',
    border3: '#94A3B8',
    border4: '#64748B',
    border5: '#475569',

    // Foreground
    fg: '#0F172A',
    fgHeading: '#0F172A',
    fgText: '#475569',
    fgHighlight: '#00D09C',

    // Layout background
    layoutBg: '#F8FAFC',
    layoutBg2: '#FFFFFF',
    layoutBg3: '#F3F4F6',
    layoutBg4: '#E2E8F0',

    // Sidebar
    sidebar: '#FFFFFF',
    sidebarBg: '#FFFFFF',

    // Echarts (gráficos)
    echarts: {
      bg: '#FFFFFF',
      textColor: '#0F172A',
      axisLineColor: '#E2E8F0',
      splitLineColor: '#E2E8F0',
      itemHoverShadowColor: 'rgba(0, 208, 156, 0.5)',
      tooltipBackgroundColor: '#0F172A',
      areaOpacity: '0.7',
    },

    chartBg: '#FFFFFF',
    chartTextColor: '#0F172A',
    chartAxisLineColor: '#E2E8F0',
    chartSplitLineColor: '#E2E8F0',

    // Traffic chart (del dashboard)
    traffic: {
      colorBlue: '#0A7B8A',
      colorGreen: '#00D09C',
      colorRed: '#EF4444',
      colorYellow: '#FFD700',
      tooltipBg: '#0F172A',
      tooltipBorderColor: '#E2E8F0',
      tooltipExtraCss: 'box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);',
      tooltipTextColor: '#FFFFFF',
      tooltipFontWeight: '600',
    },

    // Electricity chart
    electricity: {
      tooltipBg: '#0F172A',
      tooltipLineColor: '#00D09C',
      tooltipLineWidth: '0',
      tooltipBorderColor: '#E2E8F0',
      tooltipExtraCss: 'box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15); border-radius: 8px;',
      tooltipTextColor: '#FFFFFF',
      tooltipFontWeight: '600',

      axisLineColor: '#E2E8F0',
      xAxisTextColor: '#64748B',
      yAxisSplitLine: '#E2E8F0',

      itemBorderColor: '#00D09C',
      lineStyle: 'solid',
      lineWidth: '4',
      lineGradFrom: '#00D09C',
      lineGradTo: '#0A7B8A',
      lineShadow: 'rgba(0, 208, 156, 0.3)',

      areaGradFrom: 'rgba(0, 208, 156, 0.5)',
      areaGradTo: 'rgba(10, 123, 138, 0.2)',
      shadowLineDarkBg: 'rgba(0, 0, 0, 0)',
    },

    // Solar chart
    solar: {
      gradientLeft: '#00D09C',
      gradientRight: '#0A7B8A',
      shadowColor: 'rgba(0, 208, 156, 0.3)',
      secondSeriesFill: '#F8FAFC',
      radius: ['70%', '90%'],
    },

    // Temperature chart
    temperature: {
      arcFill: ['#00D09C', '#00D09C', '#00D09C', '#00D09C', '#00D09C'],
      arcEmpty: '#F3F4F6',
      thumbBg: '#F3F4F6',
      thumbBorder: '#00D09C',
    },

    // Orders chart
    ordersProfitLegend: {
      firstItem: '#00D09C',
      secondItem: '#0A7B8A',
      thirdItem: '#64748B',
    },

    // Profit chart
    profit: {
      bg: '#FFFFFF',
      lineColor: '#00D09C',
      xAxisColor: '#E2E8F0',
      yAxisColor: '#E2E8F0',
      splitLineColor: '#E2E8F0',
      tooltipBg: '#0F172A',
      tooltipLineColor: '#00D09C',
      tooltipShadow: 'rgba(0, 208, 156, 0.3)',
    },

    // Earning chart
    earning: {
      bg: '#FFFFFF',
      linesColor: '#E2E8F0',
      textColor: '#64748B',
      valueTextColor: '#0F172A',
      line1Color: '#00D09C',
      line2Color: '#0A7B8A',
      line3Color: '#FFD700',
    },

    // Orders profit chart
    ordersProfit: {
      bgColor: '#FFFFFF',
      tooltipBg: '#0F172A',
      tooltipExtraCss: 'box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15); border-radius: 8px;',
      textColor: '#FFFFFF',
      valueColor: '#00D09C',
      labelColor: '#94A3B8',
      lineColor: '#E2E8F0',
    },

    // Visitor analytics
    visitors: {
      bg: '#FFFFFF',
      textColor: '#0F172A',
      lineColor: '#00D09C',
      gradientFrom: 'rgba(0, 208, 156, 0.5)',
      gradientTo: 'rgba(0, 208, 156, 0.1)',
      shadowColor: 'rgba(0, 208, 156, 0.2)',
    },
  },
} as NbJSThemeOptions;
