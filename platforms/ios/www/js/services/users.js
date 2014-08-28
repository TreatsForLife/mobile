'use strict';

angular.module('clientApp')
    .factory('Users', ['$resource', function ($resource) {
        return $resource(Consts.api_root + 'user/:id', {}, {
            all: { method: 'GET', params: {}, isArray: true },
            query: { method: 'GET', withCredentials: true, params: {}, isArray: false },
            create: { method: 'POST', withCredentials: true },
            addPet: { method: 'PUT', withCredentials: true, params: {id: '@_id'}, isArray: false }, //must add id
            update: { method: 'PUT', withCredentials: true, params: {id: '@_id'} },
            remove: { method: 'DELETE', withCredentials: true, params: {id: '@_id'} }
        });
    }]);