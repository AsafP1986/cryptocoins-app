$(document).ready(function() {
  /*global vars*/
  var loadedlocalStorageArr = [];
  var loadedlocalStorage = "";
  var storedInfoArr = [];
  var dataObject = {
    coinId: "",
    coinSymbol: "",
    coinName: "",
    time: "",
    ils: "",
    usd: "",
    eur: ""
  };

  var goodCoinsToPrint = [];

  var index = 0;
  var i = "";
  var modalInput = [];
  var modalInputSize = "";
  var storedResponse = [];
  var coinSymbols = [];
  var checkIfIn3API = new Boolean();

  var dataSeries = [];

  /* end global vars*/

  // storedResponse = getCoins();
  // checkIfIn3APIFunc(storedResponse);

  getCoins();
  // $(".moreInfo").hide();

  $(document).on("click", "#homeTab", function() {
    getCoins();
  });
  $(document).on("click", "#liveReportsTab", function() {
    $("#home").load("./livereports.html");
  });

  $(document).on("click", "#aboutTab", function() {
    $("#home").load("./about.html");
  });

  $(document).on("click", "#searchBtn", function() {
    searchCoin();
  });

  /* end nav functions */

  function getCoins() {
    var card = "";
    $.ajax({
      url: "https://api.coingecko.com/api/v3/coins/list",
      type: "GET",
      success: function(response) {
        storedResponse = response;
        $("#home").html("");
        response.forEach(function(element, index) {
          if (index < 100) {
            card = getCardElement(element);
            $("#home").append(card);
          }
        });
      }
    });
  }

  

  function searchCoin() {
    var search = $("#searchInput").val();

    $.ajax({
      url: `https://api.coingecko.com/api/v3/coins/${search}`,
      type: "GET",
      success: function(element) {
        // console.log(response);
        $("#home").html("");
        $("#home").append(`<div class="card col-sm-6 col-md-3 col-lg-3">
          <div class="card-body">
            <h5 class="card-title">${element.symbol}</h5>
            <p class="card-text">${element.name}</p>
            <button type="button" class="btn btn-info btn-block more-info-btn" data-toggle="collapse" data-target="#moreInfoColaps${
              element.id
            }">more info</button>
              <div id="moreInfoColaps${element.id}" class="collapse">
                <div class="d-flex justify-content-center">
                  <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item more-info-item">ILS:</li>
                    <li class="list-group-item more-info-item">USD:</li>
                    <li class="list-group-item more-info-item">EUR:</li>
                  </ul>
                </div>
                
            </div>
        </div>
       </div>`);
      },
      error: function() {
        $("#home").html(
          `<div class="col-sm-12"><h1 class="text-center display-1">input was not found</h1></div>`
        );
      }
    });
  }

  function getModalRow(element) {
    var ModalRow = ``;
  }

  /* card functions */
  function getCardElement(element) {
    var card = `
  <div class="col-sm-12 col-md-4 col-lg-3" id="card_${element.id}"">
  <div class="card">
    
      <div class="custom-control custom-switch toggleBtn card-switch">              
          <input type="checkbox" class="custom-control-input toggleBtn" data-coinName="${
            element.id
          }" id="cardToggle_${element.id}" data-toggle="toggle">
                <label class="custom-control-label" for="cardToggle_${
                  element.id
                }" data-coinName="${element.id}">
                </label>
      </div>        
      <h5 class="card-title">${element.symbol}</h5>
      <p class="card-text">${element.name}</p> 
      <button type="button" class="btn btn-secondary btn-block more-info-btn" data-toggle="collapse" data-target="#MI_${
        element.id
      }" aria-expanded="false" aria-controls="MI_${
      element.id
    }">more info</button>             
      <div class="moreInfo collapse" id="MI_${element.id}">
          <div id="MISpinner_${element.id}" class="collapse"> 
              <div class="d-flex justify-content-center">
                  <div id="CSD_${
                    element.id
                  }" class="spinner-border" role="status">
                  <span class="sr-only">Loading...</span>
              </div>
          </div>
      </div>
      
      </div>   
    </div>
  </div>`;

    return card;
  }

  /************* click on toglle toggle *************/
  $(document).on("click", ".toggleBtn", function(element) {
    let id = $(this).attr("data-coinName");
    let isChecked = $(`#cardToggle_${id}`).is(":checked");
    console.log("isChecked from click on card: " + isChecked);

    loadedlocalStorage = localStorage.getItem("MIStorage");

    if (loadedlocalStorage == null) {
      getNewDataObject(id, minuteClicked);
    } else {
      loadedlocalStorageArr = JSON.parse(loadedlocalStorage);
      console.log("loadedlocalStorageArr: " + loadedlocalStorageArr);
      var isInLS = searchInLS(id);
      if (isInLS == false) {
        getNewDataObject(id, minuteClicked);
      } else {
        var location = isInLS;
        var lastclicked = loadedlocalStorageArr[location].time;
        var timePassed = minuteClicked - lastclicked; 
      }

    let isFromModal = $(this).hasClass("modal-switch");
    if (isFromModal) {
      if ($(`#modalSwitches${id}`).is(":checked")) {
        $(`#cardToggle_${id}`).prop("checked", true);
      }
      if ($(`#modalSwitches${id}`).is(":checked") == false) {
        $(`#cardToggle_${id}`).prop("checked", false);

      }
    }
    if (isChecked) {
        addToWantedCoins(id);
      } else {
        redFromWantedCoins(id);
      }

      function addToWantedCoins(id) {


        goodcoin = {
          coinId: loadedlocalStorageArr[location].id,
          coinSymbol: loadedlocalStorageArr[location].symbol,
          coinName: loadedlocalStorageArr[location].name,
          time: minuteClicked,
          ils: loadedlocalStorageArr[location].market_data.current_price.ils,
          usd: loadedlocalStorageArr[location].market_data.current_price.usd,
          eur: loadedlocalStorageArr[location].market_data.current_price.eur
        };

        goodCoinsToPrint.push(goodcoin);
        localStorage.setItem("dataForChart", JSON.stringify(goodCoinsToPrint));


    modalInput = localStorage.getItem("dataForChart");

    if (modalInput == null) {
      modalInput = [];
      modalInput.push(id);
    }
    var coinsearch = id;
    var isCoinInArr = "";
    for (let index = 0; index < modalInput.length; index++) {
      if (modalInput[index] == coinsearch) {
        isCoinInArr = true;
      } else {
        isCoinInArr = true;
      }
      if (isCoinInArr == false) {
        modalInput.push(id);
        localStorage.setItem("dataForChart", modalInput);
      }
    }
  } 


    
    
    modalInputSize = checkModalInputLength(id);
    modalInput = localStorage.getItem("dataForChart");



    // console.log("id from click on cardtoggle: " + id);
    // console.log("isChecked from click on card: " + isChecked);
    // console.log("isFromModal from click on cardtoggle: " + isFromModal);
    // console.log("modalInputSize from click on cardtoggle: " + modalInputSize);
    // console.log("modalInput from click on cardtoggle: " + modalInput);
    if (modalInput == null) {
      modalInput = [];
      modalInput.push(id);
    }
    
     else {
      switch (modalInputSize) {
        case "small":
          if (isChecked) {
            addToWantedCoins(id);
          } else {
            redFromWantedCoins(id);
          }
          break;
        case "six":
          addToWantedCoins(id);
          printModalBody();
          $("#myModal").modal("show");
          break;

        case "big":
          $("#myModal").modal("show");
          $(`#cardToggle_${id}`).prop("checked", false);
          break;
        default:
          break;
      }
    }
    console.log("modalInput from click on card: " + modalInput);
    console.log("type of modalInput from click on card: " + typeof modalInput);

    localStorage.setItem("dataForChart", modalInput);
  });

  /************* end click on card toggle *************/

  /**************  click on modal toggles **************/
  $(document).on("click", ".modal-switch", function(element) {
    modalInput = localStorage.getItem("dataForChart");
    let id = $(this).attr("data-coinName");
    let isChecked = $(`#modalSwitches${id}`).is(":checked");
    console.log("id: " + id);
    console.log("isChecked: " + isChecked);
    if (modalInput == null) {
      modalInput.push(id);
    }
    if (isChecked == false) {
      d(id, modalInput);
    } else {
      addToWantedCoins(id, modalInput);
    }
    console.log("from click on modal toggle: " + modalInput);
  });
  /**************  end click on modal toggles **************/

  /**************   click on modal buttons **************/

  $(document).on("click", ".goToliveReport", function() {
    $("#home").load("./livereports.html ");
  });

  // $(document).on("show", "#myModal", function(element) {
  //   printModalBody();
  // });
  // $(document).on("click", ".modal-open", function() {
  //   printModalBody();
  // });

  // $(document).on("hide.bs.modal", "#myModal", function(element) {
  //   modalInputSize = checkModalInputLength();

  //   if (modalInputSize == "big") {
  //     alert("please uncheck at least one of the coins");
  //     element.preventDefault();
  //   }

  // });

  /**************  end click on modal buttons **************/

  /************** card-modal functions *****************/

 

  function redFromWantedCoins(id, modalInput) {
    var coinsearch = id;
    modalInput = localStorage.getItem("dataForChart");

    if (modalInput == null) {
      modalInput = [];
      modalInput.push(id);
    }
    for (let index = 0; index < modalInput.length; index++) {
      if (modalInput[index] == coinsearch) {
        modalInput.splice(index, 1);
        localStorage.setItem("dataForChart", modalInput);
      }
    }
  }

  function checkModalInputLength(id) {
    modalInput = localStorage.getItem("dataForChart");

    if (modalInput == null) {
      modalInput = [];
      modalInput.push(id);
    }

    if (modalInput.length < 5) {
      return "small";
    }
    if (modalInput.length == 5) {
      return "six";
    }
    if (modalInput.length > 5) {
      return "big";
    }
  }

  function printModalBody() {
    modalInput = localStorage.getItem("dataForChart");

    // if (modalInput == null) {
    //   modalInput = [];
    //   modalInput.push(id);
    // }
    $("#modal-body-container").html(" ");
    $("#modal-footer-container").html(" ");
    console.log("modalInput: " + modalInput);
    console.log("type of modalInput: " + typeof modalInput);

    for (let index = 0; index < modalInput.length; index++) {
      if (index <= 4) {
        $("#modal-body-container").append(`
      <div class="row">
      <div class="custom-control${modalInput[index]} custom-switch${
          modalInput[index]
        } modal-switch${modalInput[index]} col-sm-12">
      <input type="checkbox" class="custom-control-input toggleBtn
       modal-switch${modalInput[index]}" data-coinName="${
          modalInput[index]
        }" id="modalSwitches${modalInput[index]}">
      <label class="custom-control-label${
        modalInput[index]
      }" for="modalSwitches${modalInput[index]}">${modalInput[index]}</label>
           
      </div>
      </div> 
         `);
        $(`#modalSwitches${modalInput[index]}`).prop("checked", true);
      } else {
        $("#modal-footer-container").append(`
      <div class="row">
      <div class="custom-control${modalInput[index]} custom-switch${
          modalInput[index]
        } modal-switch${modalInput[index]} col-sm-12">
      <input type="checkbox" class="custom-control-input${
        modalInput[index]
      } modal-switch" data-coinName="${modalInput[index]}" id="modalSwitches${
          modalInput[index]
        }">
      <label class="custom-control-label${
        modalInput[index]
      }" for="modalSwitches${modalInput[index]}">last coin picked: ${
          modalInput[index]
        }</label>
      </div>
      </div>       
         `);
        $(`#modalSwitches${modalInput[index]}`).prop("checked", true);
      }
    }
  }

  /************ more info ***********/

  $(document).on("click", ".more-info-btn", function(element) {
    var timeClicked = new Date();
    var minuteClicked = timeClicked.getTime();

    var d = $(this).attr("data-target");
    var res = d.split("_");
    var id = res[1];

    loadedlocalStorage = localStorage.getItem("MIStorage");

    if (loadedlocalStorage == null) {
      getNewDataObject(id, minuteClicked);
    } else {
      loadedlocalStorageArr = JSON.parse(loadedlocalStorage);
      console.log("loadedlocalStorageArr: " + loadedlocalStorageArr);
      var isInLS = searchInLS(id);
      if (isInLS == false) {
        getNewDataObject(id, minuteClicked);
      } else {
        var location = isInLS;
        var lastclicked = loadedlocalStorageArr[location].time;
        var timePassed = minuteClicked - lastclicked;

        if (timePassed >= 120000) {
          updateMI(id, minuteClicked);
          $(`#MI_${loadedlocalStorageArr[location].coinId}`).show();
        }
      }
    }
  });

  function updateMI(id, minuteClicked) {
    $.ajax({
      url: `https://api.coingecko.com/api/v3/coins/${id}`,
      type: "GET",
      success: function(response) {
        $(`#MI_${response.id}`)
          .html(`<div class="d-flex justify-content-center"><ul id="CUL_${
          response.id
        }" class="list-group list-group-flush">
          <li class="list-group-item more-info-item" id="CVILS_${
            response.id
          }">ILS: ${response.market_data.current_price.ils} &#8362;</li>
          <li class="list-group-item more-info-item" id="CVUSD_${
            response.id
          }">USD: ${response.market_data.current_price.usd} &#36;</li>
          <li class="list-group-item more-info-item" id="CVEUR_${
            response.id
          }">EUR: ${response.market_data.current_price.eur} &#128;</li>
        </ul></div>`);
      }
    });
  }

  function searchInLS(id) {
    let counter = 0;
    for (counter = 0; counter < loadedlocalStorageArr.length; counter++) {
      if (loadedlocalStorageArr[counter].coinId == id) {
        console.log("the adress in the arr: " + counter);
        return counter;
      }
    }
    counter = false;
    return counter;
  }

  function getNewDataObject(id, minuteClicked) {
    $.ajax({
      url: `https://api.coingecko.com/api/v3/coins/${id}`,
      type: "GET",
      success: function(response) {
        $(`#MI_${response.id}`)
          .html(`<div class="d-flex justify-content-center"><ul id="CUL_${
          response.id
        }" class="list-group list-group-flush">
          <li class="list-group-item more-info-item" id="CVILS_${
            response.id
          }">ILS: ${response.market_data.current_price.ils} &#8362;</li>
          <li class="list-group-item more-info-item" id="CVUSD_${
            response.id
          }">USD: ${response.market_data.current_price.usd} &#36;</li>
          <li class="list-group-item more-info-item" id="CVEUR_${
            response.id
          }">EUR: ${response.market_data.current_price.eur} &#128;</li>
        </ul></div>`);

        dataObject = {
          coinId: response.id,
          coinSymbol: response.symbol,
          coinName: response.name,
          time: minuteClicked,
          ils: response.market_data.current_price.ils,
          usd: response.market_data.current_price.usd,
          eur: response.market_data.current_price.eur
        };

        
        console.log(`to storage:  + ${dataObject.coinId}`);
        console.log(dataObject.time);
        console.log(dataObject.ils);
        console.log(dataObject.usd);
        console.log(dataObject.eur);
        storedInfoArr.push(dataObject);
        localStorage.setItem("MIStorage", JSON.stringify(storedInfoArr));
      }
    });
  }

  /************ end more info ***********/
});

/************** end card-modal functions *****************/

/* start live report */
// var chart = new CanvasJS.Chart("chartContainer");

// function creatChart() {
//   var options = {
//     exportEnabled: true,
//     animationEnabled: true,
//     title: {
//       text: "coins:  price in USD"
//     },
//     subtitles: [
//       {
//         text: "Click Legend to Hide or Unhide Data Series"
//       }
//     ],
//     axisX: {
//       title: "Time",
//       valueFormatString: "DDD HH:mm:ss"
//     },
//     axisY: {
//       valueFormatString: "$#,###,#0",
//       title: "Coins Value in USD",
//       titleFontColor: "#4F81BC",
//       lineColor: "#4F81BC",
//       labelFontColor: "#4F81BC",
//       tickColor: "#4F81BC",
//       includeZero: false
//     },
//     toolTip: {
//       shared: true
//     },
//     legend: {
//       cursor: "pointer",
//       itemclick: toggleDataSeries
//     },
//     data: dataSeries
//   };

//   $("#chartContainer").CanvasJS.chart(options);

//   function toggleDataSeries(e) {
//     if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
//       e.dataSeries.visible = false;
//     } else {
//       e.dataSeries.visible = true;
//     }
//     e.chart.render();
//   }
// }

// function updateChartData() {
//   // updateChartData();
//   var modalInputToSend = [];

//   modalInput.forEach(element => {
//     modalInputToSend.push(element.toString().toUpperCase());
//   });

//   var adress = modalInputToSend.toString();
//   $.ajax({
//     url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${adress}&tsyms=USD`,
//     type: "GET",
//     success: function(response) {
//       var time = new Date();
//       var index = 0;
//       console.log("response values: " + Object.values(response));
//       console.log("response keys: " + Object.keys(response).usd);
//       Object.keys(response).forEach(function(element) {
//         dataSeries.push({
//           type: "spline",
//           name: element,
//           showInLegend: true,
//           xValueFormatString: "DDD HH:mm:ss",
//           yValueFormatString: "#,##0 Units",
//           dataPoints: [{ x: time, y: response[element].USD }]
//         });

//         Object.keys(response).forEach(function(element) {
//           dataSeries[index].dataPoints.push({
//             x: time,
//             y: response[element].USD
//           });
//           index++;
//         });
//       });
//       chart.render();
//       console.log("liveReportData: " + liveReportData);
//     }
//   });
//   console.log("modal input from update chart :" + modalInputToSend);
//   console.log("modal input from update chart :" + typeof modalInputToSend);
//   console.log("adress from update chart :" + adress);
//   console.log("adress from update chart :" + typeof adress);
// }
// setInterval(updateChartData, 2000);

/* end live report*/

/*compare API's - slows everything*/
/* this one mightwork*/
// function GetCoinsWithAjaxTo3API() {
//   $.ajax({
//     url: "https://api.coingecko.com/api/v3/coins/list",
//     type: "GET",
//     success: function(response) {
//       var count = 0;
//       response.forEach(function(element) {
//         var coinSymbol = element.symbol.toUpperCase();
//         $.ajax({
//           url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinSymbol}&tsyms=USD`,
//           type: "GET",

//           success: function(data) {
//             if (data.Response !== "Error") {
//               $("#home").append(
//                 `<div class="card col-sm-6 col-md-3 col-lg-3">
//                                      <div class="card-body">
//                                       <div class="custom-control custom-switch">
//                                           <input type="checkbox" class="custom-control-input" data-coinName="${
//                                             element.id
//                                           }" id="customSwitches${element.id}">
//                                       <label class="custom-control-label" for="customSwitches${
//                                         element.id
//                                       }"></label>
//                         </div>
//                                         <h5 class="card-title">${
//                                           element.symbol
//                                         }</h5>
//                                         <p class="card-text">${element.name}</p>
//                                         <button type="button" class="btn btn-info btn-block more-info-btn" data-toggle="collapse" data-target="#MI_${
//                                           element.id
//                                         }">more info</button>
//                                        <div id="MI_${
//                                          element.id
//                                        }" class="collapse">
//                                           <div class="d-flex justify-content-center">
//                                             <div id="CSD_${
//                                               element.id
//                                             }" class="spinner-border" role="status">
//                                               <span class="sr-only">Loading...</span>
//                                             </div>
//                                             </div>
//                                             </div>
//                                           </div>
//                                    </div>`
//               );
//             }
//           },
//           error: function(dat) {
//             console.log("dat: " + dat);
//           }
//         });
//       });
//     }
//   });
// }
// function checkIfIn3APIFunc(response) {
//   var coinSymbol;
//   response.forEach(function(element, index) {
//     coinSymbol = element.symbol.toUpperCase();
//     console.log(coinSymbol);
//     $.ajax({
//       url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinSymbol}&tsyms=USD`,
//       type: "GET",
//       async: false,
//       success: successCallBack,
//       error: failCallBack
//     });
//     if (checkIfIn3API == true) {
//       goodCoinsToPrint.push(element);
//     }
//   });
// }
// function successCallBack(response) {
//   var isIn3API;
//   var paresedArr = Object.values(response);
//   if (paresedArr[0] == "Error") {
//     console.log("error");
//     isIn3API = false;
//     console.log(
//       "not in 3 api: checkifin3api : " + isIn3API + "coinSymbols: " + coinSymbol
//     );
//   } else {
//     console.log("no error");
//     isIn3API = true;

//     console.log(
//       "is in 3 api: checkifin3api : " + isIn3API + "coinSymbols: " + coinSymbols
//     );
//   }
//   checkIfIn3API = isIn3API;
//   if (checkIfIn3API == true) {
//     console.log("checkIfIn3API from successCallBack: " + checkIfIn3API);
//   }
//   // console.log(response);
//   // console.log("paresedArr: " + paresedArr);
//   // console.log("storedResponse: " + storedResponse);
// }
// function failCallBack(response) {
//   console.log("failCallBack: " + response);
// }
/*end compare API's*/
