'use strict';

angular.module('clientApp')
    .factory('Pets', ['$resource', function ($resource) {
        return $resource(Consts.api_root + 'pet/:id', {}, {
            all: { method: 'GET', withCredentials: true, params: {}, isArray: true },
            lonely: { method: 'GET', withCredentials: true, params: {id: 'lonely'}, isArray: true },
            adopted: { method: 'GET', withCredentials: true, params: {id: 'adopted'}, isArray: true },
            addOwner: { method: 'PUT', withCredentials: true, params: {id: '@_id'}, isArray: false }, //must add id
            one: { method: 'GET', withCredentials: true, params: {}, isArray: false }, //must add id
            query: { method: 'GET', withCredentials: true, params: {}, isArray: true },
            create: { method: 'POST' },
            update: { method: 'PUT', withCredentials: true, params: {id: '@_id'} },
            remove: { method: 'DELETE', params: {id: '@_id'} }
        });
    }]);