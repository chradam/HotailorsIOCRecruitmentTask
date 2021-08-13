export interface IPokemon {
  id: number;
  name: string;
  types: [
    type: Type
  ];
}

export type Type = {
  type: {
    name: string
  };
}