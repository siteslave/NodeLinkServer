angular.module('app', ['ngProgress'])
  .controller('MainCtrl', function ($scope, MainService, ngProgressFactory) {
    $scope.progressbar = ngProgressFactory.createInstance();
      $scope.progressbar.setHeight('2px');
      $scope.progressbar.setColor('#E91E63');

    $scope.show = function () {
        $scope.progressbar.start();
      //console.log($scope.hospcode);
      if ($scope.hospcode) {
        MainService.list($scope.hospcode)
        .then(function (data) {
          $scope.person = data.rows;
          $scope.progressbar.complete();
        }, function (err) {
          console.log(err);
        })
      }
    }
  })
  .factory('MainService', function ($q, $http) {
    return {
      list: function (hospcode) {
        var q = $q.defer();
        var params = {
          hospcode: hospcode
        };

        $http.post('/list', params)
        .success(function (data) {
          q.resolve(data);
        })
        .error(function (err) {
          q.reject(err);
        });

        return q.promise;
      }
    }
  })
