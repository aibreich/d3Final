function main() {
  // Target the svg element on the page
  var svg = d3.select("svg"),
    margin = 300,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin;
  // Set the X Scale for the graph
  var xScale = d3.scaleBand().range([0, width]).padding(0.4);

  // Set the Y Scale for the graph
  var yScale = d3.scaleLinear().clamp(true).range([0, height]);

  //append the graph to the svg
  var g = svg
    .append("g")
    .attr("transform", "translate(" + 100 + "," + 100 + ")");
  // Grab the data from the data folder
  d3.csv("../data/NBA_2024_per_game(11-10-2023Updated).csv").then(function (
    data
  ) {
    // set the X scale domain
    xScale.domain(
      d3.extent(data, function (d) {
        return d.Player;
      })
    );

    //  set the max value for the Y axis
    var maxValue = Math.max(
      d3.max(data, function (d) {
        return d.TRESPA;
      }),
      18
    );
    // set the number of ticks for the Y axis
    var numTicks = Math.ceil(
      maxValue -
        d3.min(data, function (d) {
          return d.TRESPA;
        })
    );
    //  Set the Y Scale domain with the maxValue and the min from the dataset
    yScale.domain([
      maxValue,
      d3.min(data, function (d) {
        return d.TRESPA;
      }),
    ]);

    // targeting the Y axis to better display it
    g.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(0,0)")
      .call(d3.axisLeft(yScale).ticks(numTicks));
    // Setting an axis group for the X Axis to allow a dynamic range
    var xAxisGroup = g
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale).ticks(18));
    // Styling the text to be easier to read
    xAxisGroup
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .attr("transform", function (d) {
        return "rotate(-60)";
      });
    //  Target the team select element on the page to allow me to change the teams
    d3.select("#team-select").on("change", function () {
      var selectedTeam = this.value;
      var filteredData = data.filter(function (d) {
        return d.Tm === selectedTeam;
      });

      // Update the chart with the filtered data
      updateChart(filteredData);
    });
    // Update chart with the filtered data from the input select
    function updateChart(filteredData) {
      // Bind the new data to the existing bars
      var bars = g.selectAll(".bar").data(filteredData, function (d) {
        return d.Player;
      });
      // checking what is pulled back after filtering
      console.log(
        filteredData.map(function (d) {
          return d.Player;
        })
      );
      // Updating the X Scale domain for the x axis to respond to how many players there are
      xScale.domain(
        filteredData.map(function (d) {
          return d.Player;
        })
      );

      // Update the ticks of the x-axis based on the filtered data
      xAxisGroup
        .transition()
        .call(d3.axisBottom(xScale).ticks(filteredData.length));
      xAxisGroup
        .selectAll("text")
        .style("text-anchor", "end")
        .style("font-size", "14px")
        .attr("transform", function (d) {
          return "rotate(-60)";
        });

      // Same Y scale maxValue and numTicks functions to set the range for the Y domain
      var maxValue = Math.max(
        d3.max(data, function (d) {
          return d.TRESPA;
        }),
        18
      );
      var numTicks = Math.ceil(
        maxValue -
          d3.min(data, function (d) {
            return d.TRESPA;
          })
      );
      // update the Y scale domain based on the filtered results
      yScale.domain([
        maxValue,
        d3.min(data, function (d) {
          return d.TRESPA;
        }),
      ]);
      //  add an animation to make the transition of ticks to be better visually
      g.select(".y-axis")
        .transition()
        .call(d3.axisLeft(yScale).ticks(numTicks));

      // Update the attributes of the existing bars
      bars
        .transition()
        .duration(750)
        .attr("x", function (d) {
          return xScale(d.Player);
        })
        .attr("y", function (d) {
          return yScale(d.TRESPA);
        })
        .attr("height", function (d) {
          return height - yScale(d.TRESPA);
        });

      // Add new bars for any new data
      bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
          return xScale(d.Player);
        })
        .attr("y", function (d) {
          return yScale(d.TRESPA);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) {
          return height - yScale(d.TRESPA);
        });

      // Remove any bars that no longer have corresponding data
      bars.exit().remove();
    }
  });
}
