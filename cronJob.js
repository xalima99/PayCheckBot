const looper = require('./index')

//local cron task that will execute each ${minutes}
var minutes = 30, the_interval = minutes * 60 * 1000;
setInterval(function() {
   looper()
  // do your stuff here
}, the_interval);