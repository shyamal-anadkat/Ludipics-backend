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

exports = module.exports = function(app, schedule) {
	schedule.scheduleJob('* * 0 * * *', function(){
		console.log('Created Daily');
		// TODO Actually creating the daily
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
	})
}