import { Civ, CivType, CivUtils } from "./aoe/civ";
import { PlayerMatch } from "./aoe/playermatches";

console.log("loaded");

const theViperId = 196240;

await CivUtils.initialiseCivCache();
const matches = await PlayerMatch.getPlayerMatches(theViperId, 500);
// To give an idea of shape:
console.log(matches[0]);

const groupByCivName = matches.reduce((byCiv: Map<Civ, PlayerMatch[]>, match: PlayerMatch) => {
    if (!byCiv.has(match.Played.Civ)) {
        byCiv.set(match.Played.Civ, []);
    }
    byCiv.get(match.Played.Civ).push(match);
    return byCiv;
}, new Map());

const winLossByCiv = new Map(Object.values(Civ).map(civ => {
    const civMatches = matches.filter(m => m.Played.Civ === civ);
    return [ civ, {
        wins: civMatches.filter(m => m.Won).length,
        losses: civMatches.filter(m => !m.Won).length,
        played: civMatches.length,
    }]
}));
console.log(winLossByCiv);

const winLossByCivType = new Map(Object.values(CivType).map(civType => {
    const civTypeMatches = matches.filter(m => CivUtils.isCivType(m.Played.Civ, civType));
    return [ civType, {
        wins: civTypeMatches.filter(m => m.Won).length,
        losses: civTypeMatches.filter(m => !m.Won).length,
        played: civTypeMatches.length,
    }]
}));
console.log(winLossByCivType);
