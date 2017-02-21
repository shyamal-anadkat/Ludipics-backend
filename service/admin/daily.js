'use strict';
// public api
var daily = {
  find: function (req, res, next) {
    //req.query.date = req.query.date? req.query.date : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};
    if (req.query.ludiCategory) {
      filters['ludiCategory.id'] =  req.query.ludiCategory;
    }
    if (req.query.date) {
      var dt = new Date(req.query.date);
      dt.setHours(24,0,0,0);
      dt.toISOString();
      filters['date'] = dt
      console.log(filters['date'])


    }

    req.app.db.models.Daily.pagedFind({
      filters: filters,
      keys: 'date ludiCategory.id',
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort
    }, function (err, results) {
      if (err) {
        return next(err);
      }

      results.filters = req.query;
      res.status(200).json(results);
    });
  },

  read: function (req, res, next) {
    req.app.db.models.Daily.findById(req.params.id).exec(function (err, daily) {
      if (err) {
        return next(err);
      }
      res.status(200).json(daily);
    });
  },

  create: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not create dailies.');
        return workflow.emit('response');
      }

      if (!req.body.date) {
        workflow.outcome.errors.push('A date is required.');
        return workflow.emit('response');
      }

      workflow.emit('createDaily');
    });

    workflow.on('createDaily', function () {
      var fieldsToSet = {
        date: new Date(req.body.date),
        name: req.body.name,
        ludiCategories: req.body.ludiCategories 
      };

      req.app.db.models.Daily.create(fieldsToSet, function (err, daily) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.record = daily;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  update: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not update dailies');
        return workflow.emit('response');
      }

      workflow.emit('patchDaily');
    });


    workflow.on('patchDaily', function () {
      var fieldsToSet = {
        date: new Date(req.body.date),
        name: req.body.name,
        ludiCategories: req.body.ludiCategories 
      };
      var options = { new: true };

      req.app.db.models.Daily.findByIdAndUpdate(req.params.id, fieldsToSet, options, function (err, daily) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.daily = daily;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  delete: function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not delete dailies.');
        return workflow.emit('response');
      }

      workflow.emit('deleteDaily');
    });

    workflow.on('deleteDaily', function (err) {
      req.app.db.models.Daily.findByIdAndRemove(req.params.id, function (err, daily) {
        if (err) {
          return workflow.emit('exception', err);
        }
        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  }

};
module.exports = daily;
