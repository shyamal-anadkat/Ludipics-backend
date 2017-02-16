'use strict';
// public api
var ludiGroup = {
  find: function(req, res, next){
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};

    req.app.db.models.LudiGroup.pagedFind({
      filters: filters,
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

      if (!req.body.category) {
        workflow.outcome.errors.push('Missing category information');
        return workflow.emit('response');
      }

      workflow.emit('createLudiGroup');
    });

    workflow.on('createLudiGroup', function() {
      var fieldsToSet = {
        _id: req.app.utility.slugify(req.body.category),
        category: {
        	id: req.body.category
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

  update: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.body.category {
        workflow.outcome.errfor.category = 'required';
        return workflow.emit('response');
      }

      workflow.emit('patchLudiGroup');
    });

    workflow.on('patchLudiGroup', function() {
      var fieldsToSet = {
        category: req.body.category
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