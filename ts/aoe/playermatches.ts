import axios from "axios";
import { Civ, CivUtils } from "./civ";
import { determineMapPosition, MapPosition } from "./map";

export type CivPos = {
    Civ: Civ;
    Pos: MapPosition;
}

export class PlayerMatch {

    private constructor(jsonMatch: JSON, asPlayerId: number) {
        this.Id = jsonMatch['match_id'];
        this.Started = new Date(jsonMatch['started']);
        this.Finished = new Date(jsonMatch['finished']);

        const gameVersion = Number.parseInt(jsonMatch['version']);
        const mainPlayer = jsonMatch['players'].find(p => p['profile_id'] === asPlayerId);
        const playerTeam = jsonMatch['players'].filter(p => p['team'] === mainPlayer['team']);
        const opponents = jsonMatch['players'].filter(p => p['team'] !== mainPlayer['team']);
        const playerCount = playerTeam.length + opponents.length;
        this.Won = mainPlayer['won'];

        this.EloBefore = mainPlayer['rating'];
        this.StartingAverageTeamElo = playerTeam.map(p => Number.parseInt(p['rating'])).reduce((a, b) => a + b, 0) / playerTeam.length;
        this.StartingAverageOpponentElo = opponents.map(p => Number.parseInt(p['rating'])).reduce((a, b) => a + b, 0) / opponents.length;
        this.EloChange = mainPlayer['rating_change'];

        this.Played = {
            Civ: CivUtils.getCivById(mainPlayer['civ'], gameVersion),
            Pos: determineMapPosition(mainPlayer['color'], playerCount)
        };
        this.Teammates = playerTeam.filter(p => p['profile_id'] !== asPlayerId).map(p => ({
            Civ: CivUtils.getCivById(p['civ'], gameVersion),
            Pos: determineMapPosition(p['color'], playerCount)
        }));
        this.Opponents = opponents.map(p => ({
            Civ: CivUtils.getCivById(p['civ'], gameVersion),
            Pos: determineMapPosition(p['color'], playerCount)
        }));

        this.Map = jsonMatch['map_type'];
    }

    public Id: string;
    public Started: Date;
    public Finished: Date;
    public Won: boolean;
    
    public EloBefore: number;
    public StartingAverageTeamElo: number;
    public StartingAverageOpponentElo: number;
    public EloChange: number;

    public Played: CivPos;
    public Teammates: CivPos[];
    public Opponents: CivPos[];

    // TODO:
    public Map: string;

    public isTeamGame(): boolean {
        return this.Teammates.length === 0 && this.Opponents.length === 1;
    }

    public static async getPlayerMatches(playerId: number, count: number): Promise<PlayerMatch[]> {
        // TODO: maybe add cache here?
        const response = await axios.get(`https://aoe2.net/api/player/matches?game=aoe2de&profile_id=${playerId}&count=${count}`);

        return response.data.filter(
            // Filter out matches that are not valid:
            //  - no player has won
            //  - there is no version
            jsonMatch => jsonMatch.players.some(p => p.won)
                && jsonMatch.version != null
        ).map(jsonMatch => new PlayerMatch(jsonMatch, playerId));
    }
}