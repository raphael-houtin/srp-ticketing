'use strict';

/**
 * @ngdoc function
 * @name srpTicketingApp.controller:AdministrationCtrl
 * @description
 * # AdministrationCtrl
 * Controller of the srpTicketingApp
 */

angular.module('srpTicketingApp')
    .controller('AdministrationCtrl', function ($scope, Auth, $location, $q, Ref, $timeout, srpGroups) {

        $scope.srpNewGroups = srpGroups;

        $scope.addNewGroup = function(srpGroup) {
            $scope.srpNewGroups.$add({
                name: srpGroup
            });
        };

        $scope.createAccount = function(email, pass, confirm) {
            $scope.err = null;
            if( !pass ) {
                $scope.err = 'Please enter a password';
            }
            else if( pass !== confirm ) {
                $scope.err = 'Passwords do not match';
            }
            else {
                Auth.$createUser({email: email, password: pass})
                    .then(function () {
                    // authenticate so we have permission to write to Firebase
                    return Auth.$authWithPassword({email: email, password: pass}, {rememberMe: true});
                })
                    .then(createProfile)
                    .then(redirect, showError);
            }

            function createProfile(user) {
                var ref = Ref.child('users', user.uid), def = $q.defer();
                ref.set({email: email, name: firstPartOfEmail(email)}, function(err) {
                    $timeout(function() {
                        if( err ) {
                            def.reject(err);
                        }
                        else {
                            def.resolve(ref);
                        }
                    });
                });
                return def.promise;
            }
        };
        function firstPartOfEmail(email) {
            return ucfirst(email.substr(0, email.indexOf('@'))||'');
        }

        function ucfirst (str) {
            // inspired by: http://kevin.vanzonneveld.net
            str += '';
            var f = str.charAt(0).toUpperCase();
            return f + str.substr(1);
        }

        function redirect() {
            $location.path('/account');
        }

        function showError(err) {
            $scope.err = err;
        }
    });
