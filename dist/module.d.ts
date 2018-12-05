/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'app/plugins/sdk';
declare class TablePanelCtrl extends MetricsPanelCtrl {
    private annotationsSrv;
    private $sanitize;
    private variableSrv;
    static templateUrl: string;
    pageIndex: number;
    dataRaw: any;
    table: any;
    renderer: any;
    panelDefaults: {
        targets: {}[];
        transform: string;
        pageSize: any;
        showHeader: boolean;
        styles: ({
            type: string;
            pattern: string;
            alias: string;
            dateFormat: string;
        } | {
            unit: string;
            type: string;
            alias: string;
            decimals: number;
            colors: string[];
            colorMode: any;
            pattern: string;
            thresholds: any[];
        })[];
        columns: any[];
        scroll: boolean;
        fontSize: string;
        sort: {
            col: number;
            desc: boolean;
        };
    };
    /** @ngInject */
    constructor($scope: any, $injector: any, templateSrv: any, annotationsSrv: any, $sanitize: any, variableSrv: any);
    onInitEditMode(): void;
    onInitPanelActions(actions: any): void;
    issueQueries(datasource: any): any;
    onDataError(err: any): void;
    onDataReceived(dataList: any): void;
    render(): void;
    toggleColumnSort(col: any, colIndex: any): void;
    moveQuery(target: any, direction: any): void;
    exportCsv(): void;
    link(scope: any, elem: any, attrs: any, ctrl: TablePanelCtrl): void;
}
export { TablePanelCtrl, TablePanelCtrl as PanelCtrl };
