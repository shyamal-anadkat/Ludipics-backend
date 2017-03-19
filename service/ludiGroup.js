'use strict';

var ludiGroup = {
  find: function(req, res, next){
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};

    if (req.query.ludiCategory) {
      filters['ludiCategory.id'] =  req.query.ludiCategory;
    }

    req.app.db.models.LudiGroup.pagedFind({
      filters: filters,
      keys: 'ludiCategory',
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort
    }, function(err, results) {
      if (err) {
        return next(err);
      }
      results.filters = req.query;
      res.status(200).json(results);
    });
  },

  read: function(req, res, next){
    req.app.db.models.LudiGroup.findById(req.params.id).exec(function(err, ludiGroup) {
      if (err) {
        return next(err);
      }
      res.status(200).json(ludiGroup);
    });
  },

  create: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      if (!req.body.ludiCategory || !req.body.ludiCategory.id) {
        workflow.outcome.errors.push('Missing category information');
        return workflow.emit('response');
      }

      workflow.emit('createLudiGroup');
    });

    workflow.on('createLudiGroup', function() {
      var fieldsToSet = {
        ludiCategory: 
          {
            id: req.body.ludiCategory.id
          }
      };

      req.app.db.models.LudiGroup.create(fieldsToSet, function(err, ludiGroup) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.record = ludiGroup;
        return workflow.emit('response');
      });
    });
    workflow.emit('validate');
  },

  place: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);
    var categoryName = "";
    workflow.on('validate', function() {
      if (!req.body.ludiCategory || !req.body.ludiCategory.id) {
        workflow.outcome.errors.push('Missing category information');
        return workflow.emit('response');
      }
      req.app.db.models.LudiCategory.findById(req.body.ludiCategory.id).exec(function(err, ludiCategory) {
        if (err) {
          return next(err);
        }
        categoryName = ludiCategory.name;
        req.app.db.models.User.findById(req.user.id).exec(function(err, user) {
          if (err) {
            workflow.outcome.errors.push('Looks like this is not a category');
            return workflow.emit('response');
          }
          if (!user){
            return 
          }
          var dt = new Date();
          dt.setHours(0,0,0,0);
          if (user.currentGroup.joinTime > dt) {
            workflow.outcome.errors.push('Already picked a group today!');
            return workflow.emit('response');
          }
          else{
            workflow.emit('findGroup');
          }
        });
      });

      // Check to see if the user is already in a group today
    });
    workflow.on('findGroup', function() {
      // Find a LudiGroup that was made today with the right LudiCategory
      var start = new Date();
      start.setHours(0,0,0,0);

      var end = new Date();
      end.setHours(23,59,59,999);

      req.app.db.models.LudiGroup.find({"timeCreated": {"$gte": start},"ludiCategory.id":req.body.ludiCategory.id}, function(err, ludiGroups) {
        if (err) {
          return workflow.emit('exception', err);
        }
        if (ludiGroups){
          var found = false;
          for (var i=0;i<ludiGroups.length;i++){
            if (ludiGroups[i].users.length < 40 && !found){
              found = true;
              // Add the User to that list of LudiCategories
              req.app.db.models.LudiGroup.findByIdAndUpdate(ludiGroups[i].id,{$push: {"users": {_id: req.user.id, "name": req.user.username}}},{safe: true, upsert: true,'new':true},function(err, ludiGroup) {
                  if (err) {
                    return workflow.emit('exception', err);
                  }
                  var fieldsToSet = {
                    user: {
                      id: req.user.id,
                      name: req.user.name
                    },
                    ludiGroup: {
                      id: ludiGroup.id
                    }
                  };
                  req.app.db.models.Story.create(fieldsToSet, function(err, story){
                    var time = new Date()
                    req.app.db.models.User.findByIdAndUpdate(req.user.id,{$set: {"currentStory":{"id":story._id},"currentGroup":{"id":story.ludiGroup.id, "joinTime":time}}},{safe: true, upsert: true}, function(err,user){
                      if (err) {
                        return workflow.emit('exception', err);
                      }
                      workflow.outcome.record = ludiGroup;
                      return workflow.emit('response');
                    });
                  });
              });
            }
          }
          if (!found){
            workflow.emit('newGroup');
          }
        } else {
          workflow.emit('newGroup')
        }
      });
    });
    workflow.on('newGroup',function(){
      var fieldsToSet = {
        ludiCategory: {id: req.body.ludiCategory.id, name: categoryName},
        users: [{_id: req.user.id, name: req.user.username}]
      };

      req.app.db.models.LudiGroup.create(fieldsToSet, function(err, ludiGroup) {
        if (err) {
          return workflow.emit('exception', err);
        }
        var time = new Date()
        
        req.app.db.models.Story.create(fieldsToSet, function(err, story){
          var time = new Date()
          req.app.db.models.User.findByIdAndUpdate(req.user.id,{$set: {"currentStory":{"id":story._id},"currentGroup":{"id":story.ludiGroup.id, "joinTime":time}}},{safe: true, upsert: true}, function(err,user){
            if (err) {
              return workflow.emit('exception', err);
            }
            workflow.outcome.record = ludiGroup;
            return workflow.emit('response');
          });
        });
      });
    });
    workflow.emit('validate');
  },

  update: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.body.ludiCategory) {
        workflow.outcome.errfor.ludiCategory = 'required';
        return workflow.emit('response');
      }

      workflow.emit('patchLudiGroup');
    });

    workflow.on('patchLudiGroup', function() {
      var fieldsToSet = {
        ludiCategory: req.body.ludiCategory
      };
      var options = { new: true };
      req.app.db.models.LudiGroup.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, ludiGroup) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.ludiGroup = ludiGroup;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  permissions: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not change the permissions of groups.');
        return workflow.emit('response');
      }

      if (!req.body.permissions) {
        workflow.outcome.errfor.permissions = 'required';
        return workflow.emit('response');
      }

      workflow.emit('patchLudiGroup');
    });

    workflow.on('patchLudiGroup', function() {
      var fieldsToSet = {
        permissions: req.body.permissions
      };
      var options = { new: true };

      req.app.db.models.LudiGroup.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, ludiGroup) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.ludiGroup = ludiGroup;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  delete: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not delete groups.');
        return workflow.emit('response');
      }

      workflow.emit('deleteLudiGroup');
    });

    workflow.on('deleteLudiGroup', function(err) {
      req.app.db.models.LudiGroup.findByIdAndRemove(req.params.id, function(err, ludiGroup) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  }

};
module.exports = ludiGroup;