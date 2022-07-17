'use strict';

const Client = require('@liqd-js/client');
const Handle = require('@liqd-js/handle');
const ObjectMerge = require('@liqd-js/alg-object-merge');

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
        let response = await Client[ method.toLowerCase() ]( this.url( path ), ObjectMerge
        (
            {
                headers:
                {
                    Authorization   : this.#auth,
                    'Content-Type'  : 'application/ejson',
                    Accept          : 'application/ejson',
                }
            },
            options
        ));

        if( 200 <= response.statusCode && response.statusCode < 300  )
        {
            return response.json;
        }
        else
        {
            throw { code: response.statusCode, message: ( await response.text ) || response.statusMessage } // TODO lepsie
        }
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