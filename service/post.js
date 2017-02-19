'use strict';

var post = {
	find: function (req, res, next) {
		// Double check this
		
	    req.query.user = req.query.user ? req.query.user : '';
	    req.query.ludiGroup = req.query.ludiGroup ? req.query.ludiGroup : '';
	    req.query.story = req.query.story ? req.query.story : '';
	    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	    req.query.sort = req.query.sort ? req.query.sort : '_id';
	    var filters = {};
	    if (req.query.user) {
	      filters['user.id'] =  req.query.user;
	    } 
	    if (req.query.ludiGroup) {
	      filters['ludiGroup.id'] = req.query.group;
	    }
	    if (req.query.story.id) {
	      filters['story.id'] = req.query.story;
	    }

	    req.app.db.models.Post.pagedFind({
	      filters: filters,
	      keys: 'user ludiGroup story',
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
  	// Upload with this method doesn't use JSON.
	create: function (req, res, next) {
	    var workflow = req.app.utility.workflow(req, res);
	    workflow.on('validate', function () {
	    	console.log(req.body)
	      	if (!req.body.story) {
	        	workflow.outcome.errors.push('A story is required.');
	        	return workflow.emit('response');
	      	}
	      	if (!req.body.ludiGroup) {
	        	workflow.outcome.errors.push('A group is required.');
	        	return workflow.emit('response');
	      	}
	      	if (!req.file) {
	        	workflow.outcome.errors.push('Must upload an image');
	        	return workflow.emit('response');
	      	}

	      workflow.emit('createPost');
	    });

	    workflow.on('createPost', function () {
	      var fieldsToSet = {
	        ludiGroup: {
	        	id: req.body.ludiGroup
	        },
	        story: {
	        	id: req.body.story
	        },
	        user: {
	        	id: req.user.id,
	        	name: req.user.username
	        },
	        img: {
	        	location: "img/" + req.file.filename,
	        	contentType: 'image/png'
	        }
	      };

	      req.app.db.models.Post.create(fieldsToSet, function (err, post) {
	        if (err) {
	          return workflow.emit('exception', err);
	        }

	        workflow.outcome.record = post;
	        return workflow.emit('response');
	      });
	    });

    	workflow.emit('validate');
  	},
  	read: function (req, res, next) {
	    req.app.db.models.Post.findById(req.params.id).exec(function (err, post) {
	      if (err) {
	        return next(err);
	      }
	      res.status(200).json(post);
	    });
	},
  	delete: function (req, res, next) {
	    var workflow = req.app.utility.workflow(req, res);

	    workflow.on('deletePost', function (err) {
	      req.app.db.models.Post.findByIdAndRemove(req.params.id, function (err, post) {
	        if (err) {
	          return workflow.emit('exception', err);
	        }
	        workflow.emit('response');
	      });
	    });

	    workflow.emit('deletePost');
	},
};
module.exports = post;