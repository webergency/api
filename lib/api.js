'use strict';

const Client = require('@liqd-js/client');
const Handle = require('@liqd-js/handle');

class WebergencyAPIClient
{
    #endpoint; #auth;

    constructor( endpoint, clientID, clientSecret )
    {
        this.#endpoint  = endpoint
        this.#auth      = 'Basic ' + Buffer.from( clientID + ':' + clientSecret, 'utf8' ).toString('base64');
    }

    async request( method, path, options )
    {
        let response = await Client[ method.toLowerCase() ]( this.url( path ), 
        {
            ...options,
            headers: 
            {
                Authorization: this.#auth
            }
        });

        return response.json;
    }

    url( path )
    {
        return new URL( path, new URL( this.#endpoint )).toString();
    }
}

module.exports = class WebergencyAPI extends Handle
{
    constructor( endpoint, clientID, clientSecret, schema )
    {
        let instance = { api: undefined, client: new WebergencyAPIClient( endpoint, clientID, clientSecret )}, handler;

        super( instance,
        {
            apply: ( instance, path, args ) =>
            {
                if( !( handler = schema[ path = path.join('.')])){ throw 'Unsupported method ' + JSON.stringify( path + '()' )}

                return handler( instance, ...args );
            }
        });

        instance.api = this;

        Object.defineProperty( this, 'name', { value: 'WebergencyAPI' });
    }
}