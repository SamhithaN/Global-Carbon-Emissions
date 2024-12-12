// add your JavaScript/D3 to this file

        const margin = { top: 20, right: 40, bottom: 70, left: 70 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const x0 = d3.scaleBand().range([0, width]).padding(0.2); // Group scale
        const x1 = d3.scaleBand().padding(0.1); // Bar scale within groups
        const y = d3.scaleLinear().range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain(["Forest_Area", "CO2_Emissions"])
            .range(["darkgreen", "darkred"]); // Updated colors

        const xAxis = svg.append("g").attr("transform", `translate(0, ${height})`);
        const yAxis = svg.append("g");

        svg.append("text")
            .attr("class", "axis-title")
            .attr("transform", `translate(${width / 2}, ${height + 50})`)
            .text("Amazon Rainforest Countries");

        svg.append("text")
            .attr("class", "axis-title")
            .attr("transform", `rotate(-90)`)
            .attr("x", -height / 2)
            .attr("y", -50)
            .text("Scaled Values");

        d3.csv("co2_forest.csv").then(data => {
            data.forEach(d => {
                d.Year = +d.Year;
                d.Forest_Area = +d.Forest_Area;
                d.CO2_Emissions = +d.CO2_Emissions;
            });

            const years = [...new Set(data.map(d => d.Year))];
            const countries = [...new Set(data.map(d => d["Country.Name"]))];

            const yearSlider = d3.select("#yearSlider")
                .attr("min", d3.min(years))
                .attr("max", d3.max(years))
                .attr("value", d3.min(years));

            function updateChart(year) {
                const yearData = data.filter(d => d.Year === year);

                x0.domain(yearData.map(d => d["Country.Name"]));
                x1.domain(["Forest_Area", "CO2_Emissions"]).range([0, x0.bandwidth()]);
                y.domain([0, d3.max(yearData, d => Math.max(d.Forest_Area, d.CO2_Emissions))]);

                xAxis.transition().call(d3.axisBottom(x0));
                yAxis.transition().call(d3.axisLeft(y));

                const groups = svg.selectAll(".group")
                    .data(yearData, d => d["Country.Name"]);

                const bars = groups.enter()
                    .append("g")
                    .attr("class", "group")
                    .attr("transform", d => `translate(${x0(d["Country.Name"])}, 0)`)
                    .merge(groups);

                const barUpdate = bars.selectAll("rect")
                    .data(d => ["Forest_Area", "CO2_Emissions"].map(key => ({ key, value: d[key] })));

                barUpdate.enter()
                    .append("rect")
                    .merge(barUpdate)
                    .transition()
                    .duration(500)
                    .attr("x", d => x1(d.key))
                    .attr("y", d => y(d.value))
                    .attr("width", x1.bandwidth())
                    .attr("height", d => height - y(d.value))
                    .attr("fill", d => color(d.key));

                barUpdate.exit().remove();
                groups.exit().remove();
            }

            updateChart(d3.min(years));

            yearSlider.on("input", function () {
                const year = +this.value;
                d3.select("#yearLabel").text(year);
                updateChart(year);
            });
        }).catch(err => console.error("Error loading data:", err));