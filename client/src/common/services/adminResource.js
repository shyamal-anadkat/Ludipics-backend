angular.module('services.adminResource', []).factory('adminResource', ['$http', '$q', function ($http, $q) {
  // local variable
  var baseUrl = '/api';
  var userUrl = baseUrl + '/admin/users';
  var accountUrl = baseUrl + '/admin/accounts';
  var administratorUrl = baseUrl + '/admin/administrators';
  var adminGroupUrl = baseUrl + '/admin/admin-groups';
  var adminStatusesUrl = baseUrl + '/admin/statuses';
  var adminCategoriesUrl = baseUrl + '/admin/categories';
  var regLudiCategoriesUrl = baseUrl + '/ludiCategories';
  var adminLudiCategoriesUrl = baseUrl + '/admin/ludiCategories';
  var regDailiesUrl = baseUrl + '/dailies';
  var adminDailiesUrl = baseUrl + '/admin/dailies';

  var processResponse = function(res){
    return res.data;
  };
  var processError = function(e){
    var msg = [];
    if(e.status)         { msg.push(e.status); }
    if(e.statusText)     { msg.push(e.statusText); }
    if(msg.length === 0) { msg.push('Unknown Server Error'); }
    return $q.reject(msg.join(' '));
  };
  // public api
  var resource = {};
  resource.getStats = function(){
    return $http.get(baseUrl + '/admin').then(processResponse, processError);
  };
  resource.search = function(query){
    return $http.get(baseUrl + '/admin/search', { params: { q: query }} ).then(processResponse, processError);
  };

  // ----- users api -----
  resource.findUsers = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(userUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addUser = function(username){
    return $http.post(userUrl, { username: username }).then(processResponse, processResponse);
  };
  resource.findUser = function(_id){
    var url = userUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateUser = function(_id, data){
    var url = userUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.setPassword = function(_id, data){
    var url = userUrl + '/' + _id + '/password';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.linkAdmin = function(_id, data){
    var url = userUrl + '/' + _id + '/role-admin';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.unlinkAdmin = function(_id){
    var url = userUrl + '/' + _id + '/role-admin';
    return $http.delete(url).then(processResponse, processError);
  };
  resource.linkAccount = function(_id, data){
    var url = userUrl + '/' + _id + '/role-account';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.unlinkAccount = function(_id){
    var url = userUrl + '/' + _id + '/role-account';
    return $http.delete(url).then(processResponse, processError);
  };
  resource.deleteUser = function(_id){
    var url = userUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ----- accounts api -----
  resource.findAccounts = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(accountUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addAccount = function(fullname){
    return $http.post(accountUrl, { 'name.full': fullname }).then(processResponse, processResponse);
  };
  resource.findAccount = function(_id){
    var url = accountUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateAccount = function(_id, data){
    var url = accountUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.linkUser = function(_id, data){
    var url = accountUrl + '/' + _id + '/user';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.unlinkUser = function(_id){
    var url = accountUrl + '/' + _id + '/user';
    return $http.delete(url).then(processResponse, processError);
  };
  resource.newAccountNote = function(_id, data){
    var url = accountUrl + '/' + _id + '/notes';
    return $http.post(url, data).then(processResponse, processError);
  };
  resource.newAccountStatus = function(_id, data){
    var url = accountUrl + '/' + _id + '/status';
    return $http.post(url, data).then(processResponse, processError);
  };
  resource.deleteAccount = function(_id){
    var url = accountUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ----- administrators api -----
  resource.findAdministrators = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(administratorUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addAdministrator = function(fullname){
    return $http.post(administratorUrl, { 'name.full': fullname }).then(processResponse, processResponse);
  };
  resource.findAdministrator = function(_id){
    var url = administratorUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateAdministrator = function(_id, data){
    var url = administratorUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.adminLinkUser = function(_id, data){
    var url = administratorUrl + '/' + _id + '/user';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.adminUnlinkUser = function(_id){
    var url = administratorUrl + '/' + _id + '/user';
    return $http.delete(url).then(processResponse, processError);
  };
  resource.saveAdminGroups = function(_id, data){
    var url = administratorUrl + '/' + _id + '/groups';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.saveAdminPermissions = function(_id, data){
    var url = administratorUrl + '/' + _id + '/permissions';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteAdministrator = function(_id){
    var url = administratorUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ----- admin-groups api -----
  resource.findAdminGroups = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(adminGroupUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addAdminGroup = function(name){
    return $http.post(adminGroupUrl, { name: name }).then(processResponse, processResponse);
  };
  resource.findAdminGroup = function(_id){
    var url = adminGroupUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateAdminGroup = function(_id, data){
    var url = adminGroupUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.saveAdminGroupPermissions = function(_id, data){
    var url = adminGroupUrl + '/' + _id + '/permissions';
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteAdminGroup = function(_id){
    var url = adminGroupUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ----- statuses api -----
  resource.findStatuses = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(adminStatusesUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addStatus = function(data){
    return $http.post(adminStatusesUrl, data).then(processResponse, processResponse);
  };
  resource.findStatus = function(_id){
    var url = adminStatusesUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateStatus = function(_id, data){
    var url = adminStatusesUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteStatus = function(_id){
    var url = adminStatusesUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ----- categories api -----
  resource.findCategories = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(adminCategoriesUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addCategory = function(data){
    return $http.post(adminCategoriesUrl, data).then(processResponse, processResponse);
  };
  resource.findCategory = function(_id){
    var url = adminCategoriesUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateCategory = function(_id, data){
    var url = adminCategoriesUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteCategory = function(_id){
    var url = adminCategoriesUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ----- ludiCategories api -----
  resource.findLudiCategories = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(regLudiCategoriesUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addLudiCategory = function(data,file){
    var fd = new FormData();
    fd.append('ludiCategoryImage', file);
    fd.append('name', data.name);
    fd.append('description', data.description);
    fd.append('color', data.color);
    return $http.post(adminLudiCategoriesUrl, fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
    }).then(processResponse, processError);
  };
  resource.findLudiCategory = function(_id){
    var url = regLudiCategoriesUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateLudiCategory = function(_id, data){
    var url = adminLudiCategoriesUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteLudiCategory = function(_id){
    var url = adminLudiCategoriesUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  // ----- dailies api -----
  resource.findDailies = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    return $http.get(regDailiesUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addDaily = function(data){
    return $http.post(adminDailiesUrl, data).then(processResponse, processResponse);
  };
  resource.findDaily = function(_id){
    var url = regDailiesUrl + '/' + _id;
    return $http.get(url).then(processResponse, processError);
  };
  resource.updateDaily = function(_id, data){
    var url = adminDailiesUrl + '/' + _id;
    return $http.put(url, data).then(processResponse, processError);
  };
  resource.deleteDaily = function(_id){
    var url = adminDailiesUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  return resource;
}]);
