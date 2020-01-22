const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: String
    name: String
    classification: String
    types: [String]
    resistant: [String]
    weakness: [String]
    weight: Weight
    height: Height
    fleeRate: Float
    evolutionRequirements: EvolutionRequirement
    evolutions: [Evolutions]
    maxCP: Int
    maxHP: Int
    attacks: AttackType
  }

  type Weight {
    minimum: String
    maximum: String
  }
  type Height {
    minimum: String
    maximum: String
  }
  type EvolutionRequirement {
    amount: Int
    name: String
  }
  type AttackType {
    fast : [Attack]
    special: [Attack]
  }
  type Attack {
    name: String
    type: String
    damage: Int
  }
  type Evolutions {
    id: String
    name : String
  }
  type Query {
    Pokemons: [Pokemon]
    Pokemon(name: String,id: String): Pokemon
    Types: [String]
    Attacks: AttackType
    Attack(type: String): [Attack]
    PokemonByType(name: String): [Pokemon]
    PokemonByAttack(name: String): [Pokemon]
  }
  input pokemonInput {
    id: String
    name: String
    classification: String
  }
  input attackInput {
    fastOrSpecial: String
    name: String
    type: String
    damage: Int
  }
  input typeInput {
    name: String
  }

  input pokemonEdit {
    name: String
    editField: String
    editValue: String
  }

  type Mutation {
    addPokemon(input: pokemonInput): Pokemon
    addAttack(input: attackInput): Attack
    addType(input: typeInput): [String]
    editPokemon(input: pokemonEdit): Pokemon
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    return data.pokemon.find((pokemon) => {
      if (pokemon.id === request.id || pokemon.name === request.name) {
        return pokemon;
      }
    });
  },
  Types: () => {
    return data.types;
  },
  Attacks: () => {
    return data.attacks;
  },
  Attack: (request) => {
    // console.log(data.pokemon[0].types);
    return data.attacks[request.type];
  },
  PokemonByType: (request) => {
    const results = [];
    data.pokemon.find((pokemon) => {
      if (pokemon.types.includes(request.name)) {
        results.push(pokemon);
      }
    });
    return results;
  },
  PokemonByAttack: (request) => {
    const results = [];
    data.pokemon.find((pokemon) => {
      const allAttacks = pokemon.attacks.fast.concat(pokemon.attacks.special);
      for (const elm of allAttacks) {
        if (elm.name === request.name) {
          results.push(pokemon);
        }
      }
    });
    return results;
  },
  addPokemon: (request) => {
    const newPokemon = {
      name: request.input.name,
      id: request.input.id,
      classification: request.input.classification,
    };
    data.pokemon.push(newPokemon);
    return newPokemon;
  },
  addAttack: (request) => {
    const newAttack = {
      name: request.input.name,
      type: request.input.type,
      damage: request.input.damage,
    };
    console.log(newAttack);
    data.attacks[request.input.fastOrSpecial].push(newAttack);
    console.log(data.attacks[request.input.fastOrSpecial]);
    return newAttack;
  },
  addType: (request) => {
    const newType = request.input.name;
    data.types.push(newType);
    return data.types;
  },
  editPokemon: (request) => {
    for (const poke of data.pokemon) {
      if (poke.name === request.input.name) {
        console.log(poke[request.input.editField]);
        poke[request.input.editField] = request.input.editValue;
        return poke;
      }
    }
  },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});
