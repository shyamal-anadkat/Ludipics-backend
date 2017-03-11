angular.module('admin.ludiCategories.detail', ['ngRoute', 'security.authorization', 'services.utility', 'services.adminResource', 'ui.bootstrap']);
angular.module('admin.ludiCategories.detail').config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/admin/ludiCategories/:id', {
      templateUrl: 'admin/ludiCategories/admin-ludiCategory.tpl.html',
      controller: 'AdminLudiCategoriesDetailCtrl',
      title: 'LudiCategories / Details',
      resolve: {
        ludiCategory: ['$q', '$route', '$location', 'securityAuthorization', 'adminResource', function($q, $route, $location, securityAuthorization, adminResource){
          //get app stats only for admin-user, otherwise redirect to /account
          var redirectUrl;
          var promise = securityAuthorization.requireAdminUser()
            .then(function(){
              var id = $route.current.params.id || '';
              if(id){
                return adminResource.findLudiCategory(id);
              }else{
                redirectUrl = '/admin/ludiCategories';
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
        }]
      }
    });
}]);
angular.module('admin.ludiCategories.detail').controller('AdminLudiCategoriesDetailCtrl', ['$scope', '$route', '$location', '$log', 'utility', 'adminResource', 'ludiCategory',
  function($scope, $route, $location, $log, utility, adminResource, data) {
    // local vars
    var deserializeData = function(data){
      $scope.ludiCategory = data;
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
        name: $scope.ludiCategory.name,
        description: $scope.ludiCategory.description,
        color: $scope.ludiCategory.color
      };
      adminResource.updateLudiCategory($scope.ludiCategory._id, data).then(function(result){
        if(result.success){
          deserializeData(result.ludiCategory);
          $scope.detailAlerts.push({ type: 'info', msg: 'Changes have been saved.'});
        }else{
          angular.forEach(result.errors, function(err, index){
            $scope.detailAlerts.push({ type: 'danger', msg: err });
          });
        }
      }, function(x){
        $scope.detailAlerts.push({ type: 'danger', msg: 'Error updating ludiCategory: ' + x });
      });
    };
    $scope.deleteLudiCategory = function(){
      $scope.deleteAlerts =[];
      if(confirm('Are you sure?')){
        adminResource.deleteLudiCategory($scope.ludiCategory._id).then(function(result){
          if(result.success){
            //redirect to admin categories index page
            $location.path('/admin/ludiCategories');
          }else{
            //error due to server side validation
            angular.forEach(result.errors, function(err, index){
              $scope.deleteAlerts.push({ type: 'danger', msg: err});
            });
          }
        }, function(x){
          $scope.deleteAlerts.push({ type: 'danger', msg: 'Error deleting ludiCategory: ' + x });
        });
      }
    };

    //initialize
    deserializeData(data);
  }
]);