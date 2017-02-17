'use strict';

exports = module.exports = function(app, mongoose) {
  //embeddable docs first
  require('./schema/Note')(app, mongoose);
  require('./schema/Status')(app, mongoose);
  require('./schema/StatusLog')(app, mongoose);
  require('./schema/Category')(app, mongoose);

  //then regular docs
  require('./schema/User')(app, mongoose);
  require('./schema/Admin')(app, mongoose);
  require('./schema/AdminGroup')(app, mongoose);
  require('./schema/Account')(app, mongoose);
  require('./schema/LoginAttempt')(app, mongoose);
  require('./schema/Story')(app, mongoose);
  require('./schema/Post')(app, mongoose);
  require('./schema/LudiCategory')(app, mongoose);
  require('./schema/LudiGroup')(app, mongoose);
  require('./schema/Daily')(app, mongoose);
};
