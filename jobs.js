'use strict';

// http://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array
// N random elements from array

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len;
    }
    return result;
}

// Where the 'Magic' happens for highlights
// This is broken out because of the way for loops work. 
function makeHighlightsForLudiCategoryForDay(app,day,daily,ludiCategory){
	app.db.models.LudiGroup.find({"ludiCategory.id":ludiCategory._id,"timeCreated":{"$gte": day}},function(err, ludiGroups){
		if (ludiGroups){
			// This is janky. Because there's a callback inside of this loop, you can't actually access the ludiGroup that you're making the
			// Post calls id. This is fine because we don't need anymore information about the group at this point.
			for (var j = 0; j < ludiGroups.length; j++){
				app.db.models.Post.find({"ludiGroup.id":ludiGroups[j].id,"timeCreated":{"$gte": day}},function(err, posts){
					if (posts){
						var topPost = -1
						for (var k = 0; k < posts.length; k++){
							if (topPost == -1 || posts[k].votes.length > topPost.votes.length){
								topPost = posts[k];
							}
						}
						// This isn't even in the Mongoose documentation. The '$' allow you to reference an index of an array.
						app.db.models.Daily.findOneAndUpdate(
							{"_id":daily._id,"ludiCategories._id":ludiCategory._id},
							{ 
								"$push": {
            						"ludiCategories.$.highlights": {"_id": topPost._id}
        						}
							},
							function(err,d){
								if (err){
									console.log(err);
								}
							}					
						);
					}
				});
			}
		}
	});
}

exports = module.exports = function(app, schedule) {
	// Daily creation
	// Runs at 00:00:01
	schedule.scheduleJob('1 0 0 * * *', function(){
		console.log('Creating Daily');
		app.db.models.LudiCategory.find({},function (err, LudiCategories) {
			if (err) {
				console.log(err);
			}
			var newCats = getRandom(LudiCategories,3);
			var start = new Date();
      		start.setHours(0,0,0,0);
			var fieldsToSet = {
        		date: start,
        		name: "",
        		ludiCategories: newCats 
      		};

      		app.db.models.Daily.create(fieldsToSet, function (err, daily) {
	        	if (err) {
	        		console.log(err);
	        	}
      		});
		});
	});
	// Highlights high level
	// Runs at 00:00:00
	schedule.scheduleJob('0 0 0 * * *', function(){
		console.log("Generating Highlights")
		var yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0,0,0,0);
		yesterday.toISOString();
		app.db.models.Daily.findOne({'date':yesterday}, function(err, daily){
			if (daily){
				for (var i = 0; i < daily.ludiCategories.length; i++){
					makeHighlightsForLudiCategoryForDay(app,yesterday,daily,daily.ludiCategories[i]);
				}
			}
		});
	});
}