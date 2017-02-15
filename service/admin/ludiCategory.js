'use strict';

var ludiCategory = {
	find: function (req, res, next) {
	    req.query.pivot = req.query.pivot ? req.query.pivot : '';
	    req.query.name = req.query.name ? req.query.name : '';
	    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	    req.query.sort = req.query.sort ? req.query.sort : '_id';

	    var filters = {};
	    if (req.query.pivot) {
	      filters.pivot = new RegExp('^.*?' + req.query.pivot + '.*$', 'i');
	    }
	    if (req.query.name) {
	      filters.name = new RegExp('^.*?' + req.query.name + '.*$', 'i');
	    }

	    req.app.db.models.LudiCategory.pagedFind({
	      filters: filters,
	      keys: 'pivot name',
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
	create: function (req, res, next) {
	    var workflow = req.app.utility.workflow(req, res);

	    workflow.on('validate', function () {
			if (!req.user.roles.admin.isMemberOf('root')) {
        		workflow.outcome.errors.push('You may not create statuses.');
        		return workflow.emit('response');
      		}
      		if (!req.body.pivot) {
        		workflow.outcome.errors.push('A pivot is required.');
        		return workflow.emit('response');
      		}

	      	if (!req.body.name) {
	        	workflow.outcome.errors.push('A name is required.');
	        	return workflow.emit('response');
	      	}

	      workflow.emit('duplicateLudiCategoryCheck');
	    });

	    workflow.on('duplicateLudiCategoryCheck', function () {
	      req.app.db.models.LudiCategory.findById(req.app.utility.slugify(req.body.pivot + ' ' + req.body.name)).exec(function (err, ludiCategory) {
	        if (err) {
	          return workflow.emit('exception', err);
	        }

	        if (ludiCategory) {
	          workflow.outcome.errors.push('That ludiCategory+pivot is already taken.');
	          return workflow.emit('response');
	        }

	        workflow.emit('createLudiCategory');
	      });
	    });

	    workflow.on('createLudiCategory', function () {
	      var fieldsToSet = {
	        _id: req.app.utility.slugify(req.body.pivot + ' ' + req.body.name),
	        pivot: req.body.pivot,
	        name: req.body.name,
	        description: req.body.description,
	        image_location: ""//TODO
	      };

	      req.app.db.models.LudiCategory.create(fieldsToSet, function (err, ludiCategory) {
	        if (err) {
	          return workflow.emit('exception', err);
	        }

	        workflow.outcome.record = ludiCategory;
	        return workflow.emit('response');
	      });
	    });

    	workflow.emit('validate');
  	},
  	read: function (req, res, next) {
	    req.app.db.models.LudiCategory.findById(req.params.id).exec(function (err, category) {
	      if (err) {
	        return next(err);
	      }
	      res.status(200).json(ludiCategory);
	    });
	},
  	delete: function (req, res, next) {
	    var workflow = req.app.utility.workflow(req, res);

	    workflow.on('validate', function () {
	      if (!req.user.roles.admin.isMemberOf('root')) {
	        workflow.outcome.errors.push('You may not delete categories.');
	        return workflow.emit('response');
	      }

	      workflow.emit('deleteLudiCategory');
	    });

	    workflow.on('deleteLudiCategory', function (err) {
	      req.app.db.models.LudiCategory.findByIdAndRemove(req.params.id, function (err, ludiCategory) {
	        if (err) {
	          return workflow.emit('exception', err);
	        }
	        workflow.emit('response');
	      });
	    });

	    workflow.emit('validate');
	},
}
module.exports = ludiCategory;