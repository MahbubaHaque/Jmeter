/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 23.380281690140844, "KoPercent": 76.61971830985915};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0035211267605633804, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.043478260869565216, 500, 1500, "About-1"], "isController": false}, {"data": [0.0, 500, 1500, "Archives-0"], "isController": false}, {"data": [0.010869565217391304, 500, 1500, "About-0"], "isController": false}, {"data": [0.0, 500, 1500, "Archives-1"], "isController": false}, {"data": [0.0, 500, 1500, "Home page"], "isController": false}, {"data": [0.0, 500, 1500, "Archives"], "isController": false}, {"data": [0.0, 500, 1500, "About"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 710, 544, 76.61971830985915, 10736.99295774647, 7, 30705, 7830.0, 21052.0, 21058.45, 22015.87, 12.00216377036987, 81.7293139643485, 1.1976080723003584], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["About-1", 46, 5, 10.869565217391305, 7500.652173913044, 600, 17794, 8033.0, 12173.700000000006, 17125.65, 17794.0, 1.135494063340821, 32.4042727206808, 0.13971899607514007], "isController": false}, {"data": ["Archives-0", 9, 0, 0.0, 9133.222222222223, 7519, 11687, 8604.0, 11687.0, 11687.0, 11687.0, 0.3784215616196443, 0.1947540654038599, 0.04730269520245553], "isController": false}, {"data": ["About-0", 46, 0, 0.0, 9153.173913043478, 1052, 13747, 8884.5, 12574.2, 13663.5, 13747.0, 1.0370403769416325, 0.581375790461483, 0.1265918428883829], "isController": false}, {"data": ["Archives-1", 9, 7, 77.77777777777777, 3721.5555555555557, 74, 15487, 896.0, 15487.0, 15487.0, 15487.0, 0.2885447725305377, 3.6264404696066173, 0.0323110031739925], "isController": false}, {"data": ["Home page", 200, 175, 87.5, 7730.710000000001, 3094, 22854, 6428.0, 14085.800000000001, 15353.249999999998, 21929.870000000006, 7.524454477050414, 48.04408272197141, 0.8817720090293454], "isController": false}, {"data": ["Archives", 200, 198, 99.0, 10977.379999999997, 7, 27174, 6528.5, 21056.0, 21063.95, 21069.97, 4.35075811960234, 9.474158196284453, 0.3509498248819857], "isController": false}, {"data": ["About", 200, 159, 79.5, 14999.390000000001, 523, 30705, 21035.0, 21055.9, 21063.95, 27831.600000000024, 3.917497502595342, 32.63252465574991, 0.3499733120482636], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to lifecharger.org:443 [lifecharger.org/162.241.225.105] failed: Connection timed out: connect", 177, 32.536764705882355, 24.929577464788732], "isController": false}, {"data": ["500/Internal Server Error", 363, 66.7279411764706, 51.12676056338028], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: lifecharger.org:443 failed to respond", 4, 0.7352941176470589, 0.5633802816901409], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 710, 544, "500/Internal Server Error", 363, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to lifecharger.org:443 [lifecharger.org/162.241.225.105] failed: Connection timed out: connect", 177, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: lifecharger.org:443 failed to respond", 4, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["About-1", 46, 5, "500/Internal Server Error", 5, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Archives-1", 9, 7, "500/Internal Server Error", 6, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: lifecharger.org:443 failed to respond", 1, null, null, null, null, null, null], "isController": false}, {"data": ["Home page", 200, 175, "500/Internal Server Error", 175, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Archives", 200, 198, "500/Internal Server Error", 118, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to lifecharger.org:443 [lifecharger.org/162.241.225.105] failed: Connection timed out: connect", 77, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: lifecharger.org:443 failed to respond", 3, null, null, null, null], "isController": false}, {"data": ["About", 200, 159, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to lifecharger.org:443 [lifecharger.org/162.241.225.105] failed: Connection timed out: connect", 100, "500/Internal Server Error", 59, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
