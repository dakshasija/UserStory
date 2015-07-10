 // angular.module('MyApp', ['appRoutes','mainCtrl', 'authService','userCtrl','userService','storyService','storyCtrl']) 
 


 angular.module('MyApp', ['appRoutes','mainCtrl', 'authService','userCtrl','userService','storyService','storyCtrl','reverseDirective'])



// angular.module('MyApp',[]);


 .config(function($httpProvider){

 	$httpProvider.interceptors.push('AuthInterceptor');
 })