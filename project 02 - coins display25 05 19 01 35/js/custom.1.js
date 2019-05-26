$(document).ready(function() {
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

  //header

  $(document).on("click", "#homeTab", function() {
    getCoins();
  });
  $(document).on("click", "#liveReportsTab", function() {
    $("#home").load("./livereports.html");
  });

  $(document).on("click", "#aboutTab", function() {
    $("#home").load("./about.html");
  });

  //helper
  $(document).on("click", ".goToliveReport", function() {
    $("#home").load("./livereports.html ");
  });

  //more info button
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

  //toggllers

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

        storedInfoArr.push(dataObject);
        console.log(`to storage:  + ${dataObject.coinId}`);
        console.log(dataObject.time);
        console.log(dataObject.ils);
        console.log(dataObject.usd);
        console.log(dataObject.eur);
        localStorage.setItem("MIStorage", JSON.stringify(storedInfoArr));
      }
    });
  }

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

  function getCardElement(element) {
    var card = `
  <div class="col-sm-12 col-md-4 col-lg-3" id="card_${element.id}"">
  <div class="card">
    
      <div class="custom-control custom-switch">              
          <input type="checkbox" class="custom-control-input" data-coinName="${
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
      <div class="moreInfo collapse" id="MI_${element.id}"></div>   
    </div>
  </div>`;

    return card;
  }

  getCoins();
});
