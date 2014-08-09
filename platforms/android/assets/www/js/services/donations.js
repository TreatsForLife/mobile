'use strict';

angular.module('clientApp')
    .factory('Donations', ['$resource', function ($resource) {
        return $resource(Consts.api_root + 'donation/:id', {}, {
            all: { method: 'GET', withCredentials: true, params: {}, isArray: true },
            query: { method: 'GET', withCredentials: true, params: {}, isArray: false },
            given: { method: 'GET', withCredentials: true, params: {id: 'given'}, isArray: true },
            pending: { method: 'GET', withCredentials: true, params: {id: 'pending'}, isArray: true },
            create: { method: 'POST' },
            approve: { method: 'POST', params: {id: 'approve'} },
            update: { method: 'PUT', withCredentials: true, params: {id: '@_id'} },
            remove: { method: 'DELETE', params: {id: '@_id'} }
        });
    }]);