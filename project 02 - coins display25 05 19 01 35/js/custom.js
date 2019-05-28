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

  $(document)
    .on("ajaxSend", function() {
      $("#loading").show();
    })
    .on("ajaxComplete", function() {
      $("#loading").hide();
    });

  $(document).on("click", "#homeTab", function() {
    getCoins();
  });
  $(document).on("click", "#liveReportsTab", function() {
    $("#home").load("./livereports.html");
  });
  $(document).on("click", ".goToliveReport", function() {
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
        showCoins(storedResponse);
      }
    });
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
  // <div class="custom-control custom-switch modal-switch" data-target="toggle"></div>
  // </div>
  function getModalRow(id, symbol) {
    var ModalRow = `<div class="row" id="row${id}">
    <div class="custom-control custom-switch modal-switch custom-control-inline" data-target="toggle">
    <input type="checkbox" class="custom-control-input  toggleBtn${id}"
    data-coinName="${id}" data-target="toggle" data-coinSymbol="${symbol}" id="modalSwitche${id}">
    <label class="custom-control-label" for="modalSwitches${id}">${id}</label>         
    </div>
    </div>`;
    return ModalRow;
  }

  /* card functions */
  function getCardElement(element) {
    var card = `
  <div class="col-sm-12 col-md-4 col-lg-3" id="card_${element.id}"">
  <div class="card">
      <div class="custom-control custom-switch card-switch" data-target="toggle">              
          <input type="checkbox" class="float-right custom-control-input toggleBtn${
            element.id
          }" data-target="toggle" data-coinName="${
      element.id
    }" data-coinSymbol="${element.symbol}" id="cardSwitch${element.id}">
        <label class="custom-control-label" for="cardSwitch${
          element.id
        }"</label>
      </div>        
      <h5 class="card-title">Symbol: ${element.symbol}</h5>
      <p class="card-text">Name: ${element.name}</p> 
      <button type="button" class="btn btn-secondary btn-block more-info-btn" data-toggle="collapse" data-target="#MI_${
        element.id
      }" aria-expanded="false" aria-controls="MI_${
      element.id
    }">more info</button>             
      <div class="moreInfo collapse" id="MI_${element.id}">
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
          updateMoreInfo(id);
          $(`#MI_${loadedlocalStorageArr[location].coinId}`).show();
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
        storedInfoArr.push(dataObject);
        localStorage.setItem("MIStorage", JSON.stringify(storedInfoArr));
        return storedInfoArr;
      }
    });
  }

  /************ end more info ***********/
  /************ start toggleer control ***********/

  $(document).on("click", ".modal-switch", function(element) {
    console.log("hello" + element);
    dimensions = element.hasClass();

    console.log(dimensions);
  });

  var counter = 0;

  $(document).on("click", ".custom-control-input", function(element) {
    let id = String($(this).attr("data-coinName"));
    let symbol = String($(this).attr("data-coinSymbol"));
    let SYMBOL = symbol.toUpperCase();

    if ($(this).is(":checked")) {
      let ModalRow = getModalRow(id, symbol);
      $("#modal-body-container").append(ModalRow);
      $(`input:checkbox.toggleBtn${id}`)
        .prop("checked", true)
        .attr("disabled", false);
      goodCoinsToPrint.push(symbol.toUpperCase());
      localStorage.setItem("dataForChart", JSON.stringify(goodCoinsToPrint));
      counter++;
      console.log("counter up: " + counter);
    } else {
      $(`input:checkbox.toggleBtn${id}`)
        .prop("checked", false)
        .attr("disabled", false);
      $(`#row${id}`).remove();
      let location = searchInChartData(SYMBOL);
      goodCoinsToPrint.splice(location, 1),
        localStorage.setItem("dataForChart", JSON.stringify(goodCoinsToPrint));
      counter--;
      console.log("counter down: " + counter);
    }
    if (counter < 6) {
      handleModalSize("small");
    }
    if (counter == 6) {
      handleModalSize("six");
    }
    if (counter > 6) {
      handleModalSize("big");
    }

    function handleModalSize(size) {
      switch (size) {
        case "small":
          console.log("small");
          break;
        case "six":
          $(".modal-switch").attr("disabled", false);
          $("#myModal").modal("show");
          break;
        case "big":
          alert("please uncheck at least one of the coins");
          $(document).on("hide.bs.modal", "#myModal", function(element) {
            $(`input:checkbox.toggleBtn${id}`).prop("checked", false);
            alert("please uncheck atleast one coin");
            $("#myModal").modal("show");
          });
          break;
        default:
          break;
      }
    }

    function searchInChartData(SYMBOL) {
      let json = localStorage.getItem("dataForChart");
      goodCoinsToPrint = JSON.parse(json);
      let counter = 0;
      for (counter = 0; counter < goodCoinsToPrint.length; counter++) {
        if (goodCoinsToPrint[counter] == SYMBOL) {
          console.log("the adress in the arr: " + counter);
          return counter;
        }
      }
      counter = false;
      return counter;
    }
  });

  // $(document).on("click", ".custom-control-input", function(event) {
  //   let id = String($(this).attr("data-coinName"));
  //   let symbol = String($(this).attr("data-coinSymbol"));

  //   console.log(id + symbol);

  //   if ($(this).is(":checked")) {
  //     let ModalRow = getModalRow(id, symbol);
  //     $("#modal-body-container").append(ModalRow);
  //     $(`#modalSwitche${id}`).prop("checked", true);
  //     $(`#cardSwitch${id}`).prop("checked", true);
  //     ++count;

  //     if (count <= 6) {

  //       goodCoinsToPrint.push(symbol.toUpperCase());
  //       localStorage.setItem("dataForChart", JSON.stringify(goodCoinsToPrint));
  //       coin = $(this).attr("data-coinSymbol");
  //     }

  //     if (count == 6) {
  //       $('input[type="checkbox"]')
  //         .not(":checked")
  //         .attr("disabled", true);

  //       $("#myModal").modal("show");
  //       $("#modal-body-container").append(ModalRow);
  //     }
  //   } else {
  //     --counter;
  //     coinRemove = $(this).attr("data-coinSymbol");
  //     goodCoinsToPrint.splice($.inArray(coinRed, goodCoinsToPrint), 1);

  //     if (togglecount == 5) {
  //       $('input[type="checkbox"]')
  //         .not(":checked")
  //         .attr("disabled", false);
  //     }
  //   }
  // });
});
