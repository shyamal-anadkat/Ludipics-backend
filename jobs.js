'use strict';

// http://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array

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

function findTopForLudiCategoryInDay(app,day,daily,ludiCategory){
	app.db.models.LudiGroup.find({"ludiCategory.id":ludiCategory._id,"timeCreated":{"$gte": day}},function(err, ludiGroups){
		if (ludiGroups){
			for (var j = 0; j < ludiGroups.length; j++){
				app.db.models.Post.find({"ludiGroup.id":ludiGroups[j].id,"timeCreated":{"$gte": day}},function(err, posts){
					if (posts){
						var topPost = -1
						for (var k = 0; k < posts.length; k++){
							if (topPost == -1 || posts[k].votes.length > topPost.votes.length){
								topPost = posts[k];
							}
						}
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
								console.log(d)
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
	schedule.scheduleJob('1 0 0 * * *', function(){
		console.log('Creating Daily');
		app.db.models.LudiCategory.find({},function (err, LudiCategories) {
			if (err) {
				console.log(err)
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
	        	console.log(daily);
      		});
		});
	});
	// TODO Find highlights from previous day.
	schedule.scheduleJob('1 * * * * *', function(){
		console.log("Generating Highlights")
		var yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0,0,0,0);
		yesterday.toISOString()
		console.log(yesterday)
		app.db.models.Daily.findOne({'date':yesterday}, function(err, daily){
			if (daily){
				for (var i = 0; i < daily.ludiCategories.length; i++){
					console.log(daily)
					findTopForLudiCategoryInDay(app,yesterday,daily,daily.ludiCategories[i]);
				}
			}
		});
	});
}