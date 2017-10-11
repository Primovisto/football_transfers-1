queue()
    .defer(d3.json, "/donorsUS/projects")
    .await(makeGraphs);

function makeGraphs(error, donorsUSProjects) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }


    //Create a Crossfilter instance
    var ndx = crossfilter(donorsUSProjects);

    //Define Dimensions

    var dateDimChartMargins = {top: 30, right: 50, bottom: 25, left: 90};

    var fundingStatus = ndx.dimension(function (d) {
        return d["WINDOW"];
    });
    var stateDim = ndx.dimension(function (d) {
        return d["LEAGUE"];
    });
    var focusSubjectDim = ndx.dimension(function (d) {
        return d["PRICE DESCRIPTION"];
    });

    var povertyLevelDim = ndx.dimension(function (d) {
        return d["POSITION"];
    });
    var all = ndx.groupAll();

    var dateDim = ndx.dimension(function (d) {
        return d["SEASON"];
    });


    //Calculate metrics
    var numProjectsByFundingStatus = fundingStatus.group();

    var stateGroup = stateDim.group();

    var totalTransfers = ndx.groupAll().reduceSum(function (d) {
        return d["PRICE"];
    });
    var numProjectsByFocusSubject = focusSubjectDim.group();

    var numProjectsByPovertyLevel = povertyLevelDim.group();

    var total_year = dateDim.group();

    var valueDonationsByDate = dateDim.group().reduceSum(function (d) {
        return d["PRICE"];
    });

    var formatCommas = d3.format(",.0f");
    var formatDollarsCommas = d3.format("$,.0f");

    //Define values (to be used in charts)
    var minDate = dateDim.bottom(1)[0]["SEASON"];
    var maxDate = dateDim.top(1)[0]["SEASON"];


    //Set Colours

    var pieChartColours = ['#d11141', '#00b159', '#00aedb', '#ffc425'];
    var rowChartColours = ['#d11141', '#00b159', '#00aedb', '#ffc425'];


    //Charts
    var numberTransfersPerSeasonChart = dc.barChart("#year_appearance");
    var totalTransfersND = dc.numberDisplay("#total-transfers-nd");
    var transferWindowChart = dc.pieChart("#window-chart");
    var transferTypeChart = dc.pieChart("#transfer-type-chart");
    var playerPositionChart = dc.rowChart("#player-position-row-chart");
    var numberTransfersND = dc.numberDisplay("#number-transfers-nd");
    var transferValueChart = dc.lineChart("#donation-value-line-chart");

    selectField = dc.selectMenu('#menu-select')
        .dimension(stateDim)
        .group(stateGroup);
    transferWindowChart
        .ordinalColors(pieChartColours)
        .height(234)
        .radius(100)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(fundingStatus)
        .group(numProjectsByFundingStatus)
        .useViewBoxResizing(true)
       ;
    totalTransfersND
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalTransfers)
        .formatNumber(formatDollarsCommas)
    .useViewBoxResizing(true)
        ;
    transferTypeChart
        .height(234)
        .radius(100)
        .width(360)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(focusSubjectDim)
        .group(numProjectsByFocusSubject)
        .ordinalColors(pieChartColours)
        .legend(dc.legend().x(20).y(10).itemHeight(13).gap(5))
        .cx(220)
        .cy(117)
        .useViewBoxResizing(true)
        ;
    playerPositionChart
        .width(300)
        .height(250)
        .dimension(povertyLevelDim)
        .group(numProjectsByPovertyLevel)
        .ordinalColors(rowChartColours)
        .xAxis().ticks(6);
    numberTransfersND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(all)
        .useViewBoxResizing(true)
        ;
    numberTransfersPerSeasonChart
        .width(900)
        .height(325)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dateDim)
        .group(total_year, 'Number of Transfers')
        .x(d3.scale.ordinal().domain([(minDate), (maxDate)]))
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .transitionDuration(500)
        .xAxisLabel("Season")
        .elasticY(true)
        .useViewBoxResizing(true)
        ;

    transferValueChart
        .width(900)
        .height(325)
        .margins(dateDimChartMargins)
        .title(function (d) {
            return d.key + ": " + formatCommas(d.value);
        })
        .dimension(dateDim)
        .group(valueDonationsByDate, 'Total Transfer Fees ($)')
        .x(d3.scale.ordinal().domain([(minDate), (maxDate)]))
        .legend(dc.legend().x(120).y(20).itemHeight(13).gap(5))
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .renderArea(true)
        .renderHorizontalGridLines(true)
        .yAxisLabel("$")
        .xAxisLabel("Season")
        .ordinalColors(['#00b159'])
        .elasticY(true)
        .useViewBoxResizing(true)
        ;


    dc.renderAll();
}

