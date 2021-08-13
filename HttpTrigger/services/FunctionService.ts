import _ from "lodash";
import axios, { AxiosResponse } from 'axios';

import { inject, injectable } from "inversify";
import { IFunctionService } from "./IFunctionService";
import { COMMON_TYPES } from "../../ioc/commonTypes";
import { ILogger } from "../../commonServices/iLogger";
import { IPokemon } from "../../commonServices/interfaces/iPokemon";
import { HttpRequestQuery } from "@azure/functions";

@injectable()
export class FunctionService implements IFunctionService<any> {

    @inject(COMMON_TYPES.ILogger)
    private readonly _logger: ILogger;

    public async processMessageAsync(query: HttpRequestQuery): Promise<object> {
        this._logger.verbose(`${JSON.stringify(query)}`);

        const id: string = query.id;
        const type: string = query.type;

        const ids: number[] = this.getIds(id);
        let pokemons: IPokemon[] =  await this.fetchPokemons(ids);
        
        if (type) {
            pokemons = this.filterByType(pokemons, type);
        }
        
        const pokemonNames: string[] = this.getNames(pokemons);
        
        return { pokemons: pokemonNames };
    }

    private getIds(ids: string): number[] {
        return _.split(ids, ',').map(id => { return _.toNumber(id); });
    }

    private async fetchPokemons(ids: number[]): Promise<IPokemon[]> {
        let pokemons: IPokemon[] = await Promise.all(_.map(ids, async (id): Promise<IPokemon> => {
            return await this.getPokemon(id);
        }))
        
        return pokemons;
    }

    private async getPokemon(id: number): Promise<IPokemon> {
        const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
        const pokemon: AxiosResponse<IPokemon> = await axios.get<IPokemon>(url);

        return pokemon.data;
    }

    private filterByType(pokemons: IPokemon[], typeName: string): IPokemon[] {
        const result: IPokemon[] = _.filter(pokemons, {
            types: [
                { type: { name: typeName } }
            ]
        });

        return result;
    }

    private getNames(pokemons: IPokemon[]): string [] {
        const result: string[] = _.map(pokemons, pokemon => { return pokemon.name; });

        return result;
    }
}
