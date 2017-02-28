angular.module('admin.dailies.detail', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource', 'ui.bootstrap']);
angular.module('admin.dailies.detail').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/dailies/:id', {
      templateUrl: 'admin/dailies/admin-daily.tpl.html',
      controller: 'AdminDailiesDetailCtrl',
      title: 'Dailies / Details',
      resolve: {
        daily: ['$q', '$route', '$location', 'securityAuthorization', 'adminResource', function($q, $route, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              var id = $route.current.params.id || '';
              if(id){
                return adminResource.findDaily(id);
              }else{
                redirectUrl = '/admin/dailies';
                return $q.reject();
              }
            }, function(reason){
              //rejected either user is un-authorized or un-authenticated
              redirectUrl = reason === 'unauthorized-client'? '/account': '/login';
              return $q.reject();
            })
            .catch(function(){
              redirectUrl = redirectUrl || '/account';
              $location.path(redirectUrl);
              return $q.reject();
            });
          return promise;
        }],
        ludiCategories: ['$q', '$route', '$location', 'securityAuthorization', 'adminResource', function($q, $route, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              return adminResource.findLudiCategories();
            }, function(reason){
              //rejected either user is un-authorized or un-authenticated
              redirectUrl = reason === 'unauthorized-client'? '/account': '/login';
              return $q.reject();
            })
            .catch(function(){
              redirectUrl = redirectUrl || '/account';
              $location.path(redirectUrl);
              return $q.reject();
            });
          return promise;
        }]
      }
    });
}]);
angular.module('admin.dailies.detail').controller('AdminDailiesDetailCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'adminResource', 'daily','ludiCategories',
  function($scope, $route, $location, $log, utility, adminResource, data,ludiCategories) {
    // local vars
    var deserializeData = function(data){
      $scope.daily = data;
      $scope.ludiCategories = ludiCategories.data;
    };
    var setCats = function(){
      $scope.cats = ["","",""];
      if ($scope.daily.ludiCategories.length == 3){
        for (var i = 0; i < 3; i++){
          for (var j = 0; j < $scope.ludiCategories.length; j++){
            if ($scope.daily.ludiCategories[i]._id == $scope.ludiCategories[j]._id){
              $scope.cats[i] = $scope.ludiCategories[j];
            }
          }
        }
      }
    };
    var closeAlert = function(alert, ind){
      alert.splice(ind, 1);
    };
    //$scope vars
    $scope.detailAlerts = [];
    $scope.deleteAlerts = [];
    $scope.canSave = utility.canSave;
    $scope.hasError = utility.hasError;
    $scope.showError = utility.showError;
    $scope.closeDetailAlert = function(ind){
      closeAlert($scope.detailAlerts, ind);
    };
    $scope.closeDeleteAlert = function(ind){
      closeAlert($scope.deleteAlerts, ind);
    };
    $scope.update = function(){
      $scope.detailAlerts = [];
      var data = {
        date: $scope.daily.date,
        ludiCategories: $scope.cats
      };
      adminResource.updateDaily($scope.daily._id, data).then(function(result){
        if(result.success){
          deserializeData(result.daily);
          $scope.detailAlerts.push({ type: 'info', msg: 'Changes have been saved.'});
        }else{
          angular.forEach(result.errors, function(err, index){
            $scope.detailAlerts.push({ type: 'danger', msg: err });
          });
        }
      }, function(x){
        $scope.detailAlerts.push({ type: 'danger', msg: 'Error updating daily: ' + x });
      });
    };
    $scope.deleteDaily = function(){
      $scope.deleteAlerts =[];
      if(confirm('Are you sure?')){
        adminResource.deleteDaily($scope.daily._id).then(function(result){
          if(result.success){
            //redirect to admin categories index page
            $location.path('/admin/dailies');
          }else{
            //error due to server side validation
            angular.forEach(result.errors, function(err, index){
              $scope.deleteAlerts.push({ type: 'danger', msg: err});
            });
          }
        }, function(x){
          $scope.deleteAlerts.push({ type: 'danger', msg: 'Error deleting daily: ' + x });
        });
      }
    };

    //initialize
    deserializeData(data);
    setCats()
    console.log($scope.cats)
  }
]);