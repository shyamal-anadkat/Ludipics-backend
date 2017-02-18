'use strict';
// public api
var story = {
  find: function(req, res, next){
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};

    req.app.db.models.Story.pagedFind({
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
    req.app.db.models.Story.findById(req.params.id).exec(function(err, story) {
      if (err) {
        return next(err);
      }
      res.status(200).json(story);
    });
  },

  create: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {

      if (!req.body.ludiGroup || !req.body.ludiGroup._id) {
        workflow.outcome.errors.push('Missing group information');
        return workflow.emit('response');
      }
      // check if user in group

      workflow.emit('createStory');
    });

    workflow.on('createStory', function() {
      var fieldsToSet = {
        user: {
          id: req.user.id,
          name: req.user.name
        },
        ludiGroup: {
          id: req.body.ludiGroup._id
        }

      };

      req.app.db.models.Story.create(fieldsToSet, function(err, group) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.record = group;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },
  // TODO: add to story
  update: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.body.ludiGroup.id) {
        workflow.outcome.errors.push('Missing group information');
        return workflow.emit('response');
      }
      if (!req.body.user.id) {
        workflow.outcome.errors.push('Missing user information');
        return workflow.emit('response');
      }
      workflow.emit('patchStory');
    });

    workflow.on('patchStory', function() {
      var fieldsToSet = {
        user: {
          id: req.user.id,
          name: req.user.name
        },
        ludiGroup: {
          id: req.body.ludiGroup.id
        }
      };
      var options = { new: true };
      req.app.db.models.Story.findByIdAndUpdate(req.params.id, fieldsToSet, options, function(err, story) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.story = story;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  delete: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);


    workflow.on('deleteStory', function(err) {
      req.app.db.models.Story.findByIdAndRemove(req.params.id, function(err, story) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('deleteStory');
  }

};
module.exports = story;