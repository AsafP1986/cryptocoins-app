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

  /* end global vars*/

  getCoins();

  localStorage.removeItem("dataForChart");

  $(document).on({
    ajaxStart: function() {
      $("#loading").show();
    },
    ajaxStop: function() {
      $("#loading").hide();
    }
  });

  $(document).on("click", "#homeTab", function() {
    getCoins();
  });
  $(document).on("click", "#liveReportsTab", function() {
    $("#home").load("./livereports.html");
  });
  $(document).on("click", "#modalSaveAndGoHEAD", function() {
    $("#home").load("./livereports.html");
  });

  $(document).on("click", "#modalSaveAndGoBtnInModal", function() {
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
    $("#home").html(`<div id="loading" class="spinner">
    <div class="spinner-border" 
    style="width: 10rem; height: 10rem;" role="status">
    <span class="sr-only">Loading...</span>
  </div></div>`);
    setTimeout(function() {
      $.ajax({
        url: "https://api.coingecko.com/api/v3/coins/list",
        type: "GET",
        success: function(response) {
          storedResponse = response;
          showCoins(storedResponse);
        }
      });
    }, 3000);
  }

  function showCoins(list) {
    $("#home").html("");
    list.forEach(function(element, index) {
      if (index < 100) {
        card = getCardElement(element);
        $("#home").append(card);
      }
    });
  }

  function searchCoin() {
    var search = $("#searchInput").val();
    console.log(search);
    console.log(storedResponse);

    if (search) {
      var list = storedResponse.filter(function(item) {
        return item.id === search;
      });
      if (list.length) {
        showCoins(list);
      } else {
        $("#home").html(
          `<div class="col-sm-12"><h1 class="text-center display-1">input was not found</h1></div>`
        );
      }
    } else {
      showCoins(storedResponse);
    }
  }

  function getModalRow(id, symbol) {
    var ModalRow = `<div class="row" id="row${id}">
    <div class="custom-control custom-switch "
    data-toggle="checkbox" data-target="modalSwitch${id}"
    data-coinName="${id}" data-coinSymbol="${symbol}">
   <input type="checkbox" class="custom-control-input modal-switch" id="modalSwitch${id}"
   data-coinName="${id}" data-coinSymbol="${symbol}">
   <label class="custom-control-label" for="modalSwitch${id}">${id}</label>         
   </div>
      </div>`;
    return ModalRow;
  }

  /* card functions */
  function getCardElement(element) {
    var card = `
    <div class="col-sm-12 col-md-4 col-lg-3" id="card_${element.id}">
        <div class="card">
        <div class="custom-control custom-switch "
        data-toggle="checkbox" data-target="cardSwitch${element.id}"
        data-coinName="${element.id}" data-coinSymbol="${
      element.symbol
    }">              
       <input type="checkbox" class="float-right custom-control-input card-switch" data-target="toggle" 
       data-coinName="${element.id}" data-coinSymbol="${
      element.symbol
    }" id="cardSwitch${element.id}">
         <label class="custom-control-label" for="cardSwitch${
           element.id
         }"></label>
       </div>        
            <h5 class="card-title">Symbol: ${element.symbol}</h5>
            <p class="card-text">Name: ${element.name}</p> 
            <button type="button" class="btn btn-secondary btn-block more-info-btn" data-toggle="collapse" data-target="#MI_${
              element.id
            }" aria-expanded="true" aria-controls="MI_${element.id}">
                    more info
            </button>             
        <div class="moreInfo collapse" id="MI_${element.id}">
            <div class="card-footer">
                <div id="moreInfoloading">
                    <div id="MISpinner_${element.id}"> 
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
        </div>   
    </div>
</div>`;

    return card;
  }
  /************ start more info ***********/
  $(document).on("click", ".more-info-btn", function(element) {
    var timeClicked = new Date();
    var minuteClicked = timeClicked.getTime();

    var d = $(this).attr("data-target");
    var res = d.split("_");
    var id = res[1];
    console.log(id);
    loadedlocalStorage = localStorage.getItem("MIStorage");

    if (loadedlocalStorage == null) {
      getNewDataObject(id, minuteClicked);
    } else {
      loadedlocalStorageArr = JSON.parse(loadedlocalStorage);
      console.log("loadedlocalStorageArr: " + loadedlocalStorageArr);
      var isInLS = searchInLS(id);
      if (isInLS === false) {
        getNewDataObject(id, minuteClicked);
      } else {
        var location = isInLS;
        var lastclicked = loadedlocalStorageArr[location].time;
        var timePassed = minuteClicked - lastclicked;

        if (timePassed >= 120000) {
          updateMoreInfo(id);
          loadedlocalStorageArr[location].time = minuteClicked;
          // $(`#MI_${loadedlocalStorageArr[location].coinId}`).show();
        }
      }
    }
  });

  function updateMoreInfo(id) {
    xhr = $.ajax({
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
    console.log("more info updated");
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
            }">ILS: moroco ${
          response.market_data.current_price.ils
        } &#8362;</li>
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
        storedInfoArr.push(dataObject);
        localStorage.setItem("MIStorage", JSON.stringify(storedInfoArr));
        return storedInfoArr;
      }
    });
  }

  /************ end more info ***********/
  /************ start toggleer control ***********/
  var counter = 0;

  $(document).on("click", ".custom-control-input", function(element) {
    let id = String($(this).attr("data-coinName"));
    let symbol = String($(this).attr("data-coinSymbol"));
    let SYMBOL = symbol.toUpperCase();
    let isFromModal = $(this).hasClass("modal-switch");
    console.log("SYMBOL: " + SYMBOL);
    let isChecked = $(this).is(":checked");
    console.log(isChecked);
    if (isFromModal) {
      if ($(`#modalSwitch${id}`).is(":checked")) {
        $(`#cardSwitch${id}`).prop("checked", true);
      }
      if ($(`#modalSwitch${id}`).is(":checked") == false) {
        $(`#cardSwitch${id}`).prop("checked", false);
      }
    }
    if (isChecked) {
      counter++;
      handleDataSize(counter, id, SYMBOL, isFromModal);

      console.log("counter up: " + counter);
    } else {
      dataRed(id, SYMBOL, isFromModal);
      counter--;
      console.log("counter down: " + counter);
    }
  });

  function handleDataSize(size, id, SYMBOL, isFromModal) {
    if (size < 6) {
      dataAdd(id, SYMBOL, isFromModal);
      console.log("small");
    }
    if (size == 6) {
      dataAdd(id, SYMBOL, isFromModal);
      $("#myModal").modal("show");
    }
    if (size > 6) {
      $(document).on("hide.bs.modal", "#myModal", function(element) {
        $(`input:checkbox.toggleBtn${id}`).prop("checked", false);
        alert("please uncheck atleast one coin");
        $("#myModal").modal("show");
      });
    }
  }
  function dataAdd(id, SYMBOL, isFromModal) {
    var isCoinInArr = searchInChartData(SYMBOL);
    if (isCoinInArr == false) {
      goodCoinsToPrint.push(SYMBOL);
      localStorage.setItem("dataForChart", JSON.stringify(goodCoinsToPrint));
      if (isFromModal == false) {
        let ModalRow = getModalRow(id, SYMBOL);
        $("#modal-body-container").append(ModalRow);
        $(`#modalSwitch${id}`).prop("checked", true);
      }
    }
  }

  function dataRed(id, SYMBOL, isFromModal) {
    let location = searchInChartData(SYMBOL);
    goodCoinsToPrint.splice(location, 1),
      localStorage.setItem("dataForChart", JSON.stringify(goodCoinsToPrint));
    if (isFromModal == false) {
      $(`#row${id}`).remove();
    }
  }

  function searchInChartData(SYMBOL) {
    let json =
      localStorage.getItem("dataForChart") === null
        ? JSON.stringify([])
        : localStorage.getItem("dataForChart");
    goodCoinsToPrint = JSON.parse(json);
    let i = 0;

    for (i = 0; i < goodCoinsToPrint.length; i++) {
      if (goodCoinsToPrint[i] == SYMBOL) {
        console.log("the adress in the arr: " + i);
        return i;
      }
    }
    i = false;
    return i;
  }
});
