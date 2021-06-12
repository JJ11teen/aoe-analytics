import { Civ, CivType, CivUtils } from "./aoe/civ";
import { PlayerMatch } from "./aoe/playermatches";

import * as d3 from "d3";

console.log("loaded");

const theViperId = 196240;

await CivUtils.initialiseCivCache();
const matches = await PlayerMatch.getPlayerMatches(theViperId, 500);
// To give an idea of shape:
console.log(matches[0]);
console.log(matches.length);

const groupedByCiv = d3.groups(matches, m => m.Played.Civ);
console.log(groupedByCiv);

type WonLoss = {
    played: number;
    won: number;
    lost: number;
};
const wonLostByCiv = d3.rollups<PlayerMatch, WonLoss, Civ>(matches, g => ({
    played: g.length,
    won: g.filter(m => m.Won).length,
    lost: g.filter(m => m.Won).length
}), m => m.Played.Civ);
console.log(wonLostByCiv);

type DupedMatchType = PlayerMatch & {
    PlayedCivType: CivType;
}
const matchesWithCivTypeDupes = matches.reduce((all, match) => {
    all.push(...CivUtils.getCivTypes(match.Played.Civ).map(t => ({
        ...match,
        PlayedCivType: t,
    })));
    return all;
}, new Array<DupedMatchType>());

type LabelledBin<T> = T & {
    Min: number;
    Max: number;
};
function calculateBins<T>(binInto: T[], valuesToBin: number[]): LabelledBin<T>[] {
    const binned = d3.bin<number, number>()
        .thresholds(binInto.length);
    return binned(valuesToBin).reduce((flat, bin, i) => [...flat, {
        ...binInto[i],
        Min: bin.x0,
        Max: bin.x1,
    }], new Array<LabelledBin<T>>());
}

const resultBins = calculateBins([
    { Label: "Very Unexpected Loss" },
    { Label: "Unexpected Loss" },
    { Label: "Expected Loss" },
    { Label: "Expected Win" },
    { Label: "Unexpected Win" },
    { Label: "Very Unexpected Win" },
], matchesWithCivTypeDupes.map(m => m.EloChange));
console.log(resultBins);

const matchesWithBins = matchesWithCivTypeDupes.map(m => ({
    ...m,
    Bin: resultBins.find(b => m.EloChange >= b.Min && m.EloChange < b.Max)
}));

const countRollup = d3.rollups(matchesWithBins, m => m.length, m => m.PlayedCivType, m => m.Bin.Label);
console.log(countRollup);
const resultsWithBins = Array.from(countRollup, ([civType, bins]) => ({
    Category: civType,
    // This gives all our keys a default value of zero
    ...Object.fromEntries(resultBins.map(b => ([b.Label, 0]))),
    // This overwrites with our rollup values if we have them, negated for losses
    ...Object.fromEntries(bins.map(b => ([b[0], b[0].endsWith("Win") ? b[1] : -b[1]])))
}));
console.log(resultsWithBins);

type SeriesPoint = {
    Category: CivType;
    [key: string]: number | CivType;
};
const series = d3.stack<SeriesPoint>()
    .keys([
        "Very Unexpected Loss",
        "Unexpected Loss",
        "Expected Loss",
        "Expected Win",
        "Unexpected Win",
        "Very Unexpected Win",
    ])
    .offset(d3.stackOffsetDiverging)
    .order(d3.stackOrderAscending)
    (resultsWithBins)
    .map(d => (d.forEach(v => v['ResultLabel'] = d.key), d));
console.log(series);

const svg = d3.select('body')
    .append("svg")
    .attr("viewBox", "-100, 0, 500, 500");

const color = d3.scaleOrdinal<string>()
    .domain([...resultBins.map(r => r.Label)])
    .range(d3.schemeSpectral[resultBins.length]);
const x = d3.scaleLinear()
    .domain([0, matches.length])
    .rangeRound([40, 500 - 40]);
const y = d3.scaleBand()
    .domain(Object.values(CivType))
    .rangeRound([40, 500 - 40])
    .padding(0.001);

svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
        .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", (d, i) => y(d.data.Category))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth())
    .append("title")
        .text((d) => `${d.data.Category} - ${d['ResultLabel']}`);

        
const yAxis = g => g
    .call(d3.axisLeft(y).tickSizeOuter(0))
    .call(g => g.selectAll(".tick").data(resultsWithBins
        .map(r => ([r.Category, r['Very Unexpected Loss'] + r['Unexpected Loss'] + r['Expected Loss']])))
    .attr("transform", ([name, min]) => `translate(${x(min)},${y(name) + y.bandwidth() / 2})`))
    .call(g => g.select(".domain").attr("transform", `translate(${x(0)},0)`));
svg.append("g")
    .call(yAxis);

const xAxis = g => g
    .attr("transform", `translate(0,40)`)
    .call(d3.axisTop(x)
        .ticks(500 / 80)
        .tickFormat(d3.formatPrefix("1.0", 1))
        .tickSizeOuter(0))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", x(0) + 20)
        .attr("y", -24)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("Wins"))
    .call(g => g.append("text")
        .attr("x", x(0) - 20)
        .attr("y", -24)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text("Losses"));
svg.append("g")
    .call(xAxis);
