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
	      keys: 'name description color img',
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
	      	// Check if valid color
	      	if (req.body.color && !(/^#[0-9A-F]{6}$/i.test(req.body.color))){
	      		workflow.outcome.errors.push('This is an invalid color');
	        	return workflow.emit('response');
	      	}
	      workflow.emit('createLudiCategory');
	    });

	    workflow.on('createLudiCategory', function () {
	      if (req.body.color){
	      	var colorName = req.body.color
	      }else{
	      	var colorName = "#B3B3B3" 
	      }
	      if (req.file){
	      	var fname = req.file.filename;
	      }else{
	      	var fname = "default.png"
	      }
	      var fieldsToSet = {
	        name: req.body.name,
	        description: req.body.description,
	        img: { location: "/" + fname, contentType: "img/png" },
	        color: colorName
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
	update: function (req, res, next) {
		var workflow = req.app.utility.workflow(req, res);

		workflow.on('validate', function () {
		  if (!req.user.roles.admin.isMemberOf('root')) {
		    workflow.outcome.errors.push('You may not update LudiCategories.');
		    return workflow.emit('response');
		  }

		  if (!req.body.name) {
		    workflow.outcome.errfor.name = 'required';
		    return workflow.emit('response');
		  }

		  workflow.emit('patchLudiCategory');
		});


		workflow.on('patchLudiCategory', function () {
		  var fieldsToSet = {
		    description: req.body.description,
		    name: req.body.name,
		    color: req.body.color
		  };
		  var options = { new: true };

		  req.app.db.models.LudiCategory.findByIdAndUpdate(req.params.id, fieldsToSet, options, function (err, ludiCategory) {
		    if (err) {
		      return workflow.emit('exception', err);
		    }

		    workflow.outcome.ludiCategory = ludiCategory;
		    return workflow.emit('response');
		  });
		});

		workflow.emit('validate');
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