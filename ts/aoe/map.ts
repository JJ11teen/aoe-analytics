export enum MapPosition {
    Flank = "Flank",
    Pocket = "Pocket"
}

export function determineMapPosition(playerNumber: number, playerCount: number): MapPosition {
    if (playerCount === 6 && (
        playerNumber === 3 || playerNumber === 4
    )) {
        return MapPosition.Pocket;
    }
    if (playerCount === 8 && (
        playerNumber === 3 || playerNumber === 4
        || playerNumber === 5 || playerNumber === 6
    )) {
        return MapPosition.Pocket;
    }    
    return MapPosition.Flank;
}