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

function makeDailyIfNone(app,ludiCategories,date){
	app.db.models.Daily.find({'date':date},function(err,daily){
		if (err){
			console.log(err);
		}else if (daily.length == 0){
			var newCats = getRandom(ludiCategories,3);
			var fieldsToSet = {
        		date: date,
        		name: "",
        		ludiCategories: newCats 
      		};

      		app.db.models.Daily.create(fieldsToSet, function (err, daily) {
	        	if (err) {
	        		console.log(err);
	        	}
      		});
		}
	});
}

// Where the 'Magic' happens for highlights
function makeHighlightsForLudiCategoryForDay(app,day,daily,ludiCategory){
	app.db.models.LudiGroup.find({"ludiCategory.id":ludiCategory._id},function(err, ludiGroups){
		if (ludiGroups){
			// This is janky. Because there's a callback inside of this loop, you can't actually access the ludiGroup that you're making the
			// Post calls id. This is fine because we don't need anymore information about the group at this point.
			for (var j = 0; j < ludiGroups.length; j++){
				console.log(ludiGroups[j]._id)
				app.db.models.Post.find({"ludiGroup.id":ludiGroups[j]._id},function(err, posts){
					if (posts){
						var topPost = -1;
						for (var k = 0; k < posts.length; k++){
							console.log("upvotes: ")
							console.log(posts[k].votes.length)
							if (topPost == -1 || posts[k].votes.length >= topPost.votes.length){
								topPost = posts[k];
							}
						}
						// This isn't even in the Mongoose documentation. The '$' allow you to reference an index of an array.
						if (topPost != -1){
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
					} else {
						console.log("no posts")
					}
				});
			}
		}
	});
}

function getCDTDate() {
	var date = new Date();
	// 5 is the hour offset from UTC to CDT
	date.setHours(date.getUTCHours()-date.getTimezoneOffset()/60);
	return date;
}

exports = module.exports = function(app, schedule) {
	// 5 is the offset from UTC to CDT: 
	var UTCOffset = -(new Date().getTimezoneOffset()/60) + 5;
	// Daily creation
	// Runs at 00:00:01 CDT
	schedule.scheduleJob('1 0 ' + UTCOffset + ' * * *', function(){
		console.log('Creating Daily');
		app.db.models.LudiCategory.find({},function (err, ludiCategories) {
			if (err) {
				console.log(err);
			}
			var start = getCDTDate();
			start.setHours(0,0,0,0);
			// Check up to 40 days in the future
			for (var i=0; i < 40; i++){
				var d = getCDTDate();
				d.setDate(start.getDate() + i);
				d.setHours(0,0,0,0);
				makeDailyIfNone(app,ludiCategories,d);
			}
		});
	});
	// Highlights high level
	// Runs at 00:00:00
	schedule.scheduleJob('0 0 ' + UTCOffset + '0 * * *', function(){
		console.log("Generating Highlights")
		var yesterday = getCDTDate();
		yesterday.setDate(yesterday.getDate());
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
