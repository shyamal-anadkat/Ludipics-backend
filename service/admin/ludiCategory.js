'use strict';

var ludiCategory = {
	find: function (req, res, next) {
	    req.query.name = req.query.name ? req.query.name : '';
	    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	    req.query.sort = req.query.sort ? req.query.sort : '_id';

	    var filters = {};
	    if (req.query.name) {
	      filters.name = new RegExp('^.*?' + req.query.name + '.*$', 'i');
	    }

	    req.app.db.models.LudiCategory.pagedFind({
	      filters: filters,
	      keys: 'name',
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
        		workflow.outcome.errors.push('You may not create LudiCategories.');
        		return workflow.emit('response');
      		}

	      	if (!req.body.name) {
	        	workflow.outcome.errors.push('A name is required.');
	        	return workflow.emit('response');
	      	}

	      //workflow.emit('duplicateLudiCategoryCheck');
	      workflow.emit('createLudiCategory');
	    });
	    /*
	    workflow.on('duplicateLudiCategoryCheck', function () {
	      req.app.db.models.LudiCategory.find({name:req.body.name}).exec(function (err, ludiCategory) {
	        if (err) {
	          return workflow.emit('exception', err);
	        }

	        if (ludiCategory) {
	          workflow.outcome.errors.push('That ludiCategory is already taken.');
	          return workflow.emit('response');
	        }

	        workflow.emit('createLudiCategory');
	      });
	    });
		*/

	    workflow.on('createLudiCategory', function () {
	      var fieldsToSet = {
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
	    req.app.db.models.LudiCategory.findById(req.params.id).exec(function (err, ludiCategory) {
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
};
module.exports = ludiCategory;