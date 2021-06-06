import axios from "axios";

type Revision = {
    version: number;
    civs: string[];
};
const cachedData: {
    revisions: Revision[],
    tags: { [civ: string]: string[] },
} = {
    revisions: [],
    tags: {}
};

export enum Civ {
    Aztecs = "Aztecs",
    Berbers = "Berbers",
    Britons = "Britons",
    Bulgarians = "Bulgarians",
    Burgundians = "Burgundians",
    Burmese = "Burmese",
    Byzantines = "Byzantines",
    Celts = "Celts",
    Chinese = "Chinese",
    Cumans = "Cumans",
    Ethiopians = "Ethiopians",
    Franks = "Franks",
    Goths = "Goths",
    Huns = "Huns",
    Incas = "Incas",
    Indians = "Indians",
    Italians = "Italians",
    Japanese = "Japanese",
    Khmer = "Khmer",
    Koreans = "Koreans",
    Lithuanians = "Lithuanians",
    Magyars = "Magyars",
    Malay = "Malay",
    Malians = "Malians",
    Mayans = "Mayans",
    Mongols = "Mongols",
    Persians = "Persians",
    Portuguese = "Portuguese",
    Saracens = "Saracens",
    Sicilians = "Sicilians",
    Slavs = "Slavs",
    Spanish = "Spanish",
    Tatars = "Tatars",
    Teutons = "Teutons",
    Turks = "Turks",
    Vietnamese = "Vietnamese",
    Vikings = "Vikings",
}

export enum CivType {
    Archer = "a",
    Cavalry = "c",
    Infantry = "i",
    CavalryArcher = "ca",
    Seige = "s",
    Meso = "m",
}

export class CivUtils {
    public static async initialiseCivCache() {
        cachedData.revisions.push(...(await axios.get('./civs.json')).data);
        cachedData.tags = (await axios.get('./civ-tags.json')).data;
    }
    
    private static getRevision(gameVersion: number): Revision {
        return cachedData.revisions
            .filter(r => r.version <= gameVersion)
            .sort((a, b) => a.version - b.version)
            .pop();
    }
    
    public static getCivById(civId: number, gameVersion: number): Civ {
        const revision = CivUtils.getRevision(gameVersion);
        if (!revision) {
            throw Error(`Unknown game version: ${gameVersion}`);
        }
        const civName = revision.civs[civId];
        if (!civName) {
            throw Error(`Invalid civ number ${civId} for game version ${gameVersion}`);
        }
        return Civ[civName as keyof typeof Civ];
    }
    
    public static isCivType(civ: Civ, civType: CivType): boolean {
        return cachedData.tags[civ].includes(civType);
    }
}
