var dataSeries = [];
var dataPoints = [];

$(document).ready(function() {
  updateChartData();
  // window.onload = function() {
  var options = {
    exportEnabled: true,
    animationEnabled: true,
    title: {
      text: "coins:  price in USD"
    },
    subtitles: [
      {
        text: "Click Legend to Hide or Unhide Data Series"
      }
    ],
    axisX: {
      title: "Time",
      valueFormatString: "DDD HH:mm:ss"
    },
    axisY: {
      valueFormatString: "$#,###,#0",
      title: "Coins Value in USD",
      titleFontColor: "#4F81BC",
      lineColor: "#4F81BC",
      labelFontColor: "#4F81BC",
      tickColor: "#4F81BC",
      includeZero: false
    },
    toolTip: {
      shared: true
    },
    legend: {
      cursor: "pointer",
      itemclick: toggleDataSeries
    },
    data: dataSeries
  };

  $("#chartContainer").CanvasJSChart(options);

  function toggleDataSeries(e) {
    if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    e.chart.render();
  }
  updateChartData();

  function updateChartData() {
    var dataForChartFromModal = localStorage.getItem("dataForChart");
    var coinsToBring = [];
    dataForChartFromModal.forEach(element => {
      coinsToBring.push(element.toString().toUpperCase());
    });

    var adress = coinsToBring.toString();
    $.ajax({
      url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${adress}&tsyms=USD`,
      type: "GET",
      success: function(response) {
        var time = new Date();
        var index = 0;
        console.log("response values: " + Object.values(response));
        console.log("response keys: " + Object.keys(response).usd);
        Object.keys(response).forEach(function(element) {
          dataSeries.push({
            type: "spline",
            name: element,
            showInLegend: true,
            xValueFormatString: "DDD HH:mm:ss",
            yValueFormatString: "$#,##0.#",
            dataPoints: [{ x: time, y: response[element].USD }]
          });

          Object.keys(response).forEach(function(element) {
            dataSeries[index].dataPoints.push({
              x: time,
              y: response[element].USD
            });
            index++;
          });
        });
        chart.render();
        console.log("liveReportData: " + liveReportData);
      }
    });
    console.log("modal input from update chart :" + coinsToBring);
    console.log("modal input from update chart :" + typeof coinsToBring);
    console.log("adress from update chart :" + adress);
    console.log("adress from update chart :" + typeof adress);
  }
  setInterval(updateChartData, 2000);
});
